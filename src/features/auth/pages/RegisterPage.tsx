import {
  useState,
  type FormEvent,
} from 'react'

import { Link } from 'react-router-dom'

import {
  signUp,
  signInWithProvider,
} from '../api/auth'

import {
  publicRegisterRoles,
  type PublicRegisterRole,
} from '../utils/roles'

import {
  isValidPassword,
  passwordValidationMessage,
} from '../utils/passwordValidation'

import PulseLogo from '@/shared/components/PulseLogo'

export default function RegisterPage() {
  const [name, setName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [role, setRole] =
    useState<PublicRegisterRole>(
      'citoyen'
    )

  const [password, setPassword] =
    useState('')

  const [
    termsAccepted,
    setTermsAccepted,
  ] = useState(false)

  const [
    privacyAcknowledged,
    setPrivacyAcknowledged,
  ] = useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [
    successEmail,
    setSuccessEmail,
  ] = useState<string | null>(null)

  const [loading, setLoading] =
    useState(false)

  const legalAccepted =
    termsAccepted &&
    privacyAcknowledged

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError(null)
    setSuccessEmail(null)

    const cleanName =
      name.trim()

    const cleanEmail =
      email
        .trim()
        .toLowerCase()

    if (!cleanName) {
      setError(
        'Le nom est obligatoire.'
      )

      return
    }

    if (!cleanEmail) {
      setError(
        'L’email est obligatoire.'
      )

      return
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      setError(
        'Adresse e-mail invalide.'
      )

      return
    }

    if (
      !isValidPassword(
        password
      )
    ) {
      setError(
        passwordValidationMessage
      )

      return
    }

    if (!termsAccepted) {
      setError(
        'Tu dois accepter les Conditions Générales d’Utilisation pour créer un compte.'
      )

      return
    }

    if (!privacyAcknowledged) {
      setError(
        'Tu dois confirmer avoir lu la Politique de confidentialité.'
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

      setSuccessEmail(
        cleanEmail
      )

      setPassword('')
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'inscription."
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignUp() {
    setError(null)

    if (!termsAccepted) {
      setError(
        'Tu dois accepter les Conditions Générales d’Utilisation avant de continuer avec Google.'
      )

      return
    }

    if (!privacyAcknowledged) {
      setError(
        'Tu dois confirmer avoir lu la Politique de confidentialité avant de continuer avec Google.'
      )

      return
    }

    try {
      setLoading(true)

      await signInWithProvider(
        'google'
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Impossible de continuer avec Google.'
      )

      setLoading(false)
    }
  }

  /*
   * =========================================================
   * INSCRIPTION TERMINÉE
   * =========================================================
   */

  if (successEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">

          <div className="flex flex-col items-center text-center">

            <PulseLogo className="h-14 w-auto" />

            <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-700">
              ✓
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-950">
              Compte créé !
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Un e-mail de confirmation
              vient de t’être envoyé à :
            </p>

            <p className="mt-2 break-all text-sm font-bold text-slate-950">
              {successEmail}
            </p>

            <div className="mt-6 w-full rounded-xl border border-orange-200 bg-orange-50 p-4 text-left">
              <p className="text-sm font-bold text-orange-800">
                Confirme ton adresse e-mail
              </p>

              <p className="mt-2 text-sm leading-relaxed text-orange-700">
                Clique sur le lien reçu
                par e-mail pour activer
                ton compte PULSE.
                Tu pourras ensuite te
                connecter.
              </p>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Si tu ne vois pas l’e-mail,
              vérifie également ton dossier
              spam ou courrier indésirable.
            </p>

            <Link
              to="/login"
              className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#d94a0b] px-4 py-3 text-sm font-black text-white transition hover:bg-[#b93607]"
            >
              Retour à la connexion
            </Link>

          </div>
        </div>
      </div>
    )
  }

  /*
   * =========================================================
   * FORMULAIRE
   * =========================================================
   */

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">

      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">

        <div className="flex flex-col items-center text-center">

          <PulseLogo className="h-14 w-auto" />

          <h1 className="mt-6 text-2xl font-bold">
            Inscription
          </h1>

          <p className="mt-2 text-slate-500">
            Crée ton compte.
          </p>

        </div>

        <form
          onSubmit={
            handleRegister
          }
          className="mt-6 flex flex-col gap-4"
        >

          <input
            type="text"
            placeholder="Nom"
            value={name}
            autoComplete="name"
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            className="rounded-lg border px-3 py-2"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            autoComplete="email"
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            className="rounded-lg border px-3 py-2"
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Type de compte
            </label>

            <select
              value={role}
              onChange={(event) =>
                setRole(
                  event.target
                    .value as PublicRegisterRole
                )
              }
              className="w-full rounded-lg border px-3 py-2"
            >
              {publicRegisterRoles.map(
                (
                  roleOption
                ) => (
                  <option
                    key={
                      roleOption.value
                    }
                    value={
                      roleOption.value
                    }
                  >
                    {
                      roleOption.label
                    }
                  </option>
                )
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1">

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              autoComplete="new-password"
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              className="rounded-lg border px-3 py-2"
            />

            <p className="text-xs text-slate-500">
              15 caractères minimum,
              avec au moins une majuscule,
              une minuscule et un chiffre.
            </p>

          </div>

          {/* CONDITIONS LÉGALES */}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

            <div className="space-y-4">

              <label className="flex cursor-pointer items-start gap-3">

                <input
                  type="checkbox"
                  checked={
                    termsAccepted
                  }
                  onChange={(event) =>
                    setTermsAccepted(
                      event.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-[#d94a0b]"
                />

                <span className="text-sm leading-relaxed text-slate-700">
                  J’accepte les{' '}

                  <Link
                    to="/terms"
                    target="_blank"
                    className="font-bold text-[#d94a0b] underline underline-offset-2"
                  >
                    Conditions Générales d’Utilisation
                  </Link>

                  {' '}de PULSE.
                </span>

              </label>

              <label className="flex cursor-pointer items-start gap-3">

                <input
                  type="checkbox"
                  checked={
                    privacyAcknowledged
                  }
                  onChange={(event) =>
                    setPrivacyAcknowledged(
                      event.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-[#d94a0b]"
                />

                <span className="text-sm leading-relaxed text-slate-700">
                  Je reconnais avoir lu la{' '}

                  <Link
                    to="/privacy"
                    target="_blank"
                    className="font-bold text-[#d94a0b] underline underline-offset-2"
                  >
                    Politique de confidentialité
                  </Link>

                  .
                </span>

              </label>

            </div>

          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">

              <p className="text-sm font-semibold text-red-700">
                {error}
              </p>

            </div>
          )}

          <div className="space-y-3">

            <button
              type="button"
              disabled={
                loading ||
                !legalAccepted
              }
              onClick={
                handleGoogleSignUp
              }
              className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              S’inscrire avec Google
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
            disabled={
              loading ||
              !legalAccepted
            }
            className="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {loading
              ? 'Inscription...'
              : "S'inscrire"}
          </button>

        </form>

        {!legalAccepted && (
          <p className="mt-3 text-center text-xs text-slate-500">
            Accepte les conditions et confirme avoir lu la politique de confidentialité pour continuer.
          </p>
        )}

        <p className="mt-4 text-sm text-slate-600">
          Déjà un compte ?{' '}

          <Link
            to="/login"
            className="font-medium text-indigo-600"
          >
            Se connecter
          </Link>

        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-slate-500">
  <Link
    to="/conditions-utilisation"
    className="transition hover:text-[#d94a0b]"
  >
    Conditions d’utilisation
  </Link>

  <span>·</span>

  <Link
    to="/politique-confidentialite"
    className="transition hover:text-[#d94a0b]"
  >
    Politique de confidentialité
  </Link>

  <span>·</span>

  <Link
    to="/mentions-legales"
    className="transition hover:text-[#d94a0b]"
  >
    Mentions légales
  </Link>
          </div>

        <div className="mt-4 text-center text-sm text-slate-600">

          Tu représentes une association ?{' '}

          <Link
            to="/associations/register"
            className="font-bold text-[#d94a0b]"
          >
            Demander un accès association
          </Link>

        </div>

      </div>
    </div>
  )
}