
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Capacitor } from '@capacitor/core'

import {
  signUp,
  signInWithProvider,
} from '../api/auth'

import { getDefaultPathForProfile } from '../utils/permissions'
import { savePublicRole } from '../api/profile'   // remplace l'import de getCurrentProfile

import {
  PENDING_ROLE_STORAGE_KEY,
  publicRegisterRoles,
  type PublicRegisterRole,
} from '../utils/roles'

import {
  isValidPassword,
  passwordValidationMessage,
} from '../utils/passwordValidation'

import PulseLogo from '@/shared/components/PulseLogo'

export default function RegisterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] =
    useState<PublicRegisterRole>('citoyen')
  const [password, setPassword] = useState('')

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAcknowledged, setPrivacyAcknowledged] =
    useState(false)

  const [error, setError] = useState<string | null>(null)
  const [successEmail, setSuccessEmail] =
    useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const legalAccepted =
    termsAccepted && privacyAcknowledged

  const isIOS =
    Capacitor.getPlatform() === 'ios'

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError(null)
    setSuccessEmail(null)

    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanName) {
      setError('Le nom est obligatoire.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Adresse e-mail invalide.')
      return
    }

    if (!isValidPassword(password)) {
      setError(passwordValidationMessage)
      return
    }

    if (!legalAccepted) {
      setError(
        'Tu dois accepter les conditions et confirmer avoir lu la politique de confidentialité.'
      )
      return
    }

    try {
      setLoading(true)

      await signUp(
        cleanEmail,
        password,
        cleanName,
        role
      )

      setSuccessEmail(cleanEmail)
      setPassword('')
      window.scrollTo({ top: 0, behavior: 'instant' })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'inscription."
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleSocialSignUp(
    provider: 'google' | 'apple'
  ) {
    setError(null)

    if (!legalAccepted) {
      setError(
        'Accepte les conditions et confirme avoir lu la politique de confidentialité pour continuer.'
      )
      return
    }

        try {
      setLoading(true)

      // Mémorise le rôle pour le retour OAuth (Apple, web).
      sessionStorage.setItem(PENDING_ROLE_STORAGE_KEY, role)

      await signInWithProvider(provider)

      // Apple et la version web reviennent via /login?oauth=complete,
      // qui applique le rôle mémorisé.
      if (
        provider === 'apple' ||
        !Capacitor.isNativePlatform()
      ) {
        return
      }

      sessionStorage.removeItem(PENDING_ROLE_STORAGE_KEY)

      const profile = await savePublicRole(role)

      queryClient.setQueryData(
        ['current-profile'],
        profile
      )

      if (!profile.role) {
        navigate('/login?oauth=complete', {
          replace: true,
        })
        return
      }

      navigate(getDefaultPathForProfile(profile), {
        replace: true,
      })
    } catch (err) {
      sessionStorage.removeItem(PENDING_ROLE_STORAGE_KEY)

      setError(
        err instanceof Error
          ? err.message
          : `Impossible de continuer avec ${provider}.`
      )
    } finally {
      setLoading(false)
    }
  }

  const pageClass =
    'min-h-[100dvh] w-full overflow-x-hidden bg-white px-4 sm:px-6'

  const safePadding = {
    paddingTop: 'max(24px, env(safe-area-inset-top, 0px))',
    paddingBottom: 'max(40px, env(safe-area-inset-bottom, 0px))',
  }

  if (successEmail) {
    return (
      <div className={pageClass} style={safePadding}>
        <div className="mx-auto w-full max-w-md">
          <div className="flex flex-col items-center text-center">
            <PulseLogo className="h-14 w-auto" />

            <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-700">
              ✓
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-950">
              Compte créé !
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Un e-mail de confirmation vient de t'être envoyé à :
            </p>

            <p className="mt-2 break-all text-sm font-bold text-slate-950">
              {successEmail}
            </p>

            <div className="mt-6 w-full rounded-xl border border-orange-200 bg-orange-50 p-4 text-left">
              <p className="font-bold text-orange-800">
                Confirme ton adresse e-mail
              </p>
              <p className="mt-2 text-sm leading-relaxed text-orange-700">
                Clique sur le lien reçu par e-mail pour activer
                ton compte PULSE. Tu pourras ensuite te connecter.
              </p>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Vérifie également ton dossier spam.
            </p>

            <Link
              to="/login"
              className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#d94a0b] px-4 py-3 font-bold text-white"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={pageClass} style={safePadding}>
      <div className="mx-auto w-full min-w-0 max-w-md">
        <div className="flex flex-col items-center text-center">
          <PulseLogo className="h-14 w-auto" />

          <h1 className="mt-6 text-2xl font-bold text-slate-950">
            Inscription
          </h1>

          <p className="mt-2 text-slate-500">
            Crée ton compte.
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="mt-6 flex min-w-0 flex-col gap-4"
        >
          <input
            type="text"
            placeholder="Nom"
            aria-label="Nom"
            value={name}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
            className="min-h-12 w-full min-w-0 rounded-lg border px-3 py-2 text-base"
          />

          <input
            type="email"
            placeholder="Email"
            aria-label="Email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-12 w-full min-w-0 rounded-lg border px-3 py-2 text-base"
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Type de compte
            </label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as PublicRegisterRole)
              }
              className="min-h-12 w-full min-w-0 rounded-lg border px-3 py-2 text-base"
            >
              {publicRegisterRoles.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="password"
              placeholder="Mot de passe"
              aria-label="Mot de passe"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-12 w-full min-w-0 rounded-lg border px-3 py-2 text-base"
            />

            <p className="mt-2 text-xs text-slate-500">
              15 caractères minimum, avec au moins une
              majuscule, une minuscule et un chiffre.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-4">

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) =>
                    setTermsAccepted(e.target.checked)
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-[#d94a0b]"
                />
                <span className="min-w-0 text-sm leading-relaxed text-slate-700">
                  J'accepte les{' '}
                  <Link
                    to="/terms"
                    target="_blank"
                    className="font-bold text-[#d94a0b] underline"
                  >
                    Conditions Générales d'Utilisation
                  </Link>{' '}
                  de PULSE.
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={privacyAcknowledged}
                  onChange={(e) =>
                    setPrivacyAcknowledged(e.target.checked)
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-[#d94a0b]"
                />
                <span className="min-w-0 text-sm leading-relaxed text-slate-700">
                  Je reconnais avoir lu la{' '}
                  <Link
                    to="/privacy"
                    target="_blank"
                    className="font-bold text-[#d94a0b] underline"
                  >
                    Politique de confidentialité
                  </Link>
                  .
                </span>
              </label>

            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700"
            >
              {error}
            </div>
          )}

<p className="mt-5 text-center text-sm text-slate-600">
          Tu représentes une association ?{' '}
          <Link
            to="/associations/register"
            className="font-bold text-[#d94a0b]"
          >
            Demander un accès association
          </Link>
        </p>
        
          <div className="space-y-3">

            {isIOS && (
              <button
                type="button"
                disabled={loading || !legalAccepted}
                onClick={() => void handleSocialSignUp('apple')}
                className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuer avec Apple
              </button>
            )}

            <button
              type="button"
              disabled={loading || !legalAccepted}
              onClick={() => void handleSocialSignUp('google')}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              S'inscrire avec Google
            </button>

          </div>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold text-slate-400">
              ou
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="submit"
            disabled={loading || !legalAccepted}
            className="min-h-12 w-full rounded-lg bg-green-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>

        {!legalAccepted && (
          <p className="mt-3 text-center text-xs text-slate-500">
            Accepte les conditions et confirme avoir lu
            la politique de confidentialité pour continuer.
          </p>
        )}

        <p className="mt-5 text-center text-sm text-slate-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-medium text-indigo-600">
            Se connecter
          </Link>
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-xs text-slate-500">
          <Link to="/conditions-utilisation">
            Conditions d'utilisation
          </Link>
          <span>·</span>
          <Link to="/politique-confidentialite">
            Politique de confidentialité
          </Link>
          <span>·</span>
          <Link to="/mentions-legales">
            Mentions légales
          </Link>
        </div>

        
      </div>
    </div>
  )
}
