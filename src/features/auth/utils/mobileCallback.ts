import { Capacitor } from '@capacitor/core'

// Adresse de retour vers l'app iOS (schéma déclaré dans Info.plist).
// Utilisée par la connexion Apple, le lien « mot de passe oublié » et
// le lien de confirmation de l'e-mail. Elle doit figurer dans les
// Redirect URLs Supabase (Authentication > URL Configuration).
export const MOBILE_AUTH_CALLBACK_URL = 'fr.humanspulse.app://auth/callback'

// Marqueur posé à l'inscription dans l'app : quand le lien de
// confirmation rouvre PULSE, on sait qu'il s'agit d'une confirmation
// d'e-mail (et non d'une connexion Apple).
const PENDING_CONFIRMATION_KEY = 'pulse-pending-email-confirmation'

// Au-delà, le lien Supabase a de toute façon expiré.
const PENDING_CONFIRMATION_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000

// Dans l'app : le lien de l'e-mail rouvre PULSE. Sur le web : adresse
// par défaut du projet Supabase (Site URL).
export function getEmailConfirmationRedirect(): string | undefined {
  return Capacitor.isNativePlatform() ? MOBILE_AUTH_CALLBACK_URL : undefined
}

export function markPendingEmailConfirmation() {
  if (!Capacitor.isNativePlatform()) return

  try {
    localStorage.setItem(PENDING_CONFIRMATION_KEY, String(Date.now()))
  } catch {
    // Stockage indisponible : le retour fonctionnera comme une connexion.
  }
}

export function hasPendingEmailConfirmation(): boolean {
  try {
    const markedAt = Number(localStorage.getItem(PENDING_CONFIRMATION_KEY))

    return (
      Number.isFinite(markedAt) &&
      markedAt > 0 &&
      Date.now() - markedAt < PENDING_CONFIRMATION_MAX_AGE_MS
    )
  } catch {
    return false
  }
}

export function clearPendingEmailConfirmation() {
  try {
    localStorage.removeItem(PENDING_CONFIRMATION_KEY)
  } catch {
    // Rien à faire.
  }
}
