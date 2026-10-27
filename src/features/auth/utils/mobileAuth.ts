import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'

import { router } from '@/app/router'
import { supabase } from '@/lib/supabase'

let initialized = false
let handlingCallback = false

function isAppleCallback(url: string): boolean {
  try {
    const parsed = new URL(url)

    return (
      parsed.protocol === 'fr.humanspulse.app:' &&
      parsed.hostname === 'auth' &&
      parsed.pathname === '/callback'
    )
  } catch {
    return false
  }
}

async function handleAuthCallback(url: string) {
  if (!isAppleCallback(url) || handlingCallback) return

  handlingCallback = true

  try {
    const callbackUrl = new URL(url)

    const authError =
      callbackUrl.searchParams.get('error_description') ||
      callbackUrl.searchParams.get('error')

    if (authError) {
      throw new Error(authError)
    }

    const code = callbackUrl.searchParams.get('code')

    if (!code) {
      throw new Error(
        'Retour Apple sans code OAuth. Vérifie les Redirect URLs Supabase.'
      )
    }

    const { error } =
      await supabase.auth.exchangeCodeForSession(code)

    if (error) throw error

    await Browser.close().catch(() => undefined)

    await router.navigate('/login?oauth=complete', {
      replace: true,
    })
  } catch (error) {
    console.error('Erreur OAuth Apple dans PULSE :', error)

    await Browser.close().catch(() => undefined)

    await router.navigate('/login?oauth=error', {
      replace: true,
    })
  } finally {
    handlingCallback = false
  }
}

export async function initializeMobileAuth() {
  if (!Capacitor.isNativePlatform() || initialized) {
    return
  }

  initialized = true

  await App.addListener('appUrlOpen', ({ url }) => {
    void handleAuthCallback(url)
  })

  const launch = await App.getLaunchUrl()

  if (launch?.url) {
    void handleAuthCallback(launch.url)
  }
}
