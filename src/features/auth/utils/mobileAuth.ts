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

// supabase-js (flux PKCE) mémorise le "code verifier" d'une demande de
// réinitialisation avec le suffixe /PASSWORD_RECOVERY. On le lit avant
// l'échange du code, car l'échange l'efface.
function hasPendingPasswordRecovery(): boolean {
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)

      if (
        key?.endsWith('-code-verifier') &&
        localStorage.getItem(key)?.endsWith('/PASSWORD_RECOVERY')
      ) {
        return true
      }
    }
  } catch {
    return false
  }

  return false
}

async function handleAuthCallback(url: string) {
  if (!isAppleCallback(url) || handlingCallback) return

  handlingCallback = true

  let isPasswordRecovery = hasPendingPasswordRecovery()

  try {
    const callbackUrl = new URL(url)

    // Lien e-mail expiré ou déjà utilisé : Supabase renvoie otp_expired.
    if (callbackUrl.searchParams.get('error_code') === 'otp_expired') {
      isPasswordRecovery = true
    }

    const authError =
      callbackUrl.searchParams.get('error_description') ||
      callbackUrl.searchParams.get('error')

    if (authError) {
      throw new Error(authError)
    }

    const code = callbackUrl.searchParams.get('code')

    if (!code) {
      throw new Error(
        'Retour sans code. Vérifie les Redirect URLs Supabase.'
      )
    }

    const { error } =
      await supabase.auth.exchangeCodeForSession(code)

    if (error) throw error

    await Browser.close().catch(() => undefined)

    // Lien "mot de passe oublié" : la session temporaire est ouverte,
    // on affiche directement le formulaire du nouveau mot de passe.
    if (isPasswordRecovery) {
      await router.navigate('/reset-password', {
        replace: true,
      })
      return
    }

    await router.navigate('/login?oauth=complete', {
      replace: true,
    })
  } catch (error) {
    console.error('Erreur de retour d’authentification dans PULSE :', error)

    await Browser.close().catch(() => undefined)

    await router.navigate(
      isPasswordRecovery ? '/forgot-password?expired=1' : '/login?oauth=error',
      { replace: true }
    )
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
