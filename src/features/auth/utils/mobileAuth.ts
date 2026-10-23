
import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'

import { supabase } from '@/lib/supabase'

const APPLE_CALLBACK_URL =
  'fr.humanspulse.app://auth/callback'

let initialized = false

async function handleAuthCallback(url: string) {
  if (!url.startsWith(APPLE_CALLBACK_URL)) return

  const callbackUrl = new URL(url)

  const authError =
    callbackUrl.searchParams.get('error_description') ??
    callbackUrl.searchParams.get('error')

  if (authError) {
    console.error('Échec de la connexion Apple :', authError)
    await Browser.close().catch(() => undefined)
    window.location.replace('/login?oauth=error')
    return
  }

  const code = callbackUrl.searchParams.get('code')

  if (!code) {
    console.error(
      "Le retour Apple ne contient pas de code d'authentification."
    )
    await Browser.close().catch(() => undefined)
    window.location.replace('/login?oauth=error')
    return
  }

  const { error } =
    await supabase.auth.exchangeCodeForSession(code)

  await Browser.close().catch(() => undefined)

  if (error) {
    console.error(
      "Impossible de créer la session après la connexion Apple :",
      error
    )
    window.location.replace('/login?oauth=error')
    return
  }

  window.location.replace('/login?oauth=complete')
}

export async function initializeMobileAuth() {
  if (!Capacitor.isNativePlatform() || initialized) return

  initialized = true

  await App.addListener('appUrlOpen', async ({ url }) => {
    try {
      await handleAuthCallback(url)
    } catch (error) {
      console.error(
        'Erreur lors du retour OAuth dans PULSE :',
        error
      )
      window.location.replace('/login?oauth=error')
    }
  })

  const launch = await App.getLaunchUrl()

  if (launch?.url) {
    await handleAuthCallback(launch.url)
  }
}
