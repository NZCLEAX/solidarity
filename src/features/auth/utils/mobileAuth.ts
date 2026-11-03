import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'

import { router } from '@/app/router'
import { supabase } from '@/lib/supabase'
import {
  clearPendingEmailConfirmation,
  hasPendingEmailConfirmation,
} from './mobileCallback'

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

type CallbackFlow = 'recovery' | 'email-confirmation' | 'oauth'

// Le même lien de retour sert à trois choses : connexion Apple,
// « mot de passe oublié » et confirmation de l'e-mail à l'inscription.
function detectCallbackFlow(): CallbackFlow {
  if (hasPendingPasswordRecovery()) return 'recovery'
  if (hasPendingEmailConfirmation()) return 'email-confirmation'
  return 'oauth'
}

async function handleAuthCallback(url: string) {
  if (!isAppleCallback(url) || handlingCallback) return

  handlingCallback = true

  const flow = detectCallbackFlow()
  let linkExpired = false

  try {
    const callbackUrl = new URL(url)

    // Lien e-mail expiré ou déjà utilisé : Supabase renvoie otp_expired.
    linkExpired =
      callbackUrl.searchParams.get('error_code') === 'otp_expired'

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
    if (flow === 'recovery') {
      await router.navigate('/reset-password', {
        replace: true,
      })
      return
    }

    // Confirmation d'e-mail ou connexion Apple : l'utilisateur est
    // connecté, la page de connexion l'envoie vers son espace.
    clearPendingEmailConfirmation()

    await router.navigate('/login?oauth=complete', {
      replace: true,
    })
  } catch (error) {
    console.error('Erreur de retour d’authentification dans PULSE :', error)

    await Browser.close().catch(() => undefined)

    if (flow === 'recovery') {
      await router.navigate('/forgot-password?expired=1', { replace: true })
      return
    }

    if (flow === 'email-confirmation' || linkExpired) {
      clearPendingEmailConfirmation()

      // L'adresse est confirmée dès le clic sur le lien, même si la
      // connexion automatique n'a pas abouti : on invite à se connecter.
      await router.navigate(
        linkExpired ? '/login?email=expired' : '/login?email=confirmed',
        { replace: true }
      )
      return
    }

    await router.navigate('/login?oauth=error', { replace: true })
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
