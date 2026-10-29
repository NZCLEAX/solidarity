
import { FormEvent, useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {
  signIn,
  signInWithProvider,
} from '@/features/auth/api/auth'

import {
  getCurrentProfile,
  savePublicRole,
  type CurrentProfile,
} from '@/features/auth/api/profile'

import {
  PENDING_ROLE_STORAGE_KEY,
} from '@/features/auth/utils/roles'

import type { PublicRegisterRole } from '@/features/auth/utils/roles'

import { getDefaultPathForProfile } from '@/features/auth/utils/permissions'

import PulseLogo from '@/shared/components/PulseLogo'

export default function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pendingProfile, setPendingProfile] =
    useState<CurrentProfile | null>(null)
  const [selectedRole, setSelectedRole] =
    useState<PublicRegisterRole>('citoyen')
  const [localError, setLocalError] = useState<string | null>(null)
  const [isCompletingOAuth, setIsCompletingOAuth] = useState(false)

  /*
   * REDIRECTION APRÈS CONNEXION
   */

  function navigateWithProfile(profile: CurrentProfile) {
    queryClient.setQueryData(['current-profile'], profile)

    void queryClient.invalidateQueries({
      queryKey: ['current-user'],
    })

    navigate(getDefaultPathForProfile(profile), {
      replace: true,
    })
  }

  /*
   * RÉCUPÉRATION DU PROFIL APRÈS LE RETOUR OAUTH
   */

  useEffect(() => {
    const oauthStatus = searchParams.get('oauth')

    if (oauthStatus !== 'complete') {
      if (oauthStatus === 'error') {
        setLocalError(
          "La connexion Apple n'a pas abouti. Réessaie."
        )
        setSearchParams({}, { replace: true })
      }
      return
    }

    let cancelled = false

    async function completeOAuthLogin() {
      setIsCompletingOAuth(true)
      setLocalError(null)

      try {
                // Rôle choisi sur la page d'inscription avant Apple / Google.
        const pendingRole = sessionStorage.getItem(
          PENDING_ROLE_STORAGE_KEY
        )
        sessionStorage.removeItem(PENDING_ROLE_STORAGE_KEY)

        const profile =
          pendingRole === 'citoyen' || pendingRole === 'benevole'
            ? await savePublicRole(pendingRole)
            : await getCurrentProfile()

        if (cancelled) return

        setSearchParams({}, { replace: true })

        if (!profile.role) {
          setPendingProfile(profile)
          setSelectedRole('citoyen')
          return
        }

        navigateWithProfile(profile)
      } catch (error) {
        if (cancelled) return

        setLocalError(
          (error as Error).message ||
            'Impossible de récupérer ton profil après la connexion.'
        )

        setSearchParams({}, { replace: true })
      } finally {
        if (!cancelled) {
          setIsCompletingOAuth(false)
        }
      }
    }

    void completeOAuthLogin()

    return () => {
      cancelled = true
    }
  }, [searchParams, setSearchParams])

  /*
   * CONNEXION EMAIL / MOT DE PASSE
   */

  const mutation = useMutation({
    mutationFn: async () => {
      await signIn(email.trim(), password)
      return getCurrentProfile()
    },

    onSuccess: (profile) => {
      if (!profile.role) {
        setPendingProfile(profile)
        setSelectedRole('citoyen')
        return
      }

      navigateWithProfile(profile)
    },
  })

  /*
   * CONNEXION GOOGLE
   */

  const googleMutation = useMutation({
    mutationFn: async () => {
      await signInWithProvider('google')
      return getCurrentProfile()
    },

    onSuccess: (profile) => {
      if (!profile.role) {
        setPendingProfile(profile)
        setSelectedRole('citoyen')
        return
      }

      navigateWithProfile(profile)
    },
  })

  /*
   * CONNEXION APPLE
   */

  const appleMutation = useMutation({
    mutationFn: async () => {
      return signInWithProvider('apple')
    },
  })

  /*
   * ENREGISTREMENT DU RÔLE
   */

  const roleMutation = useMutation({
    mutationFn: async (role: PublicRegisterRole) => {
      return savePublicRole(role)
    },

    onSuccess: (profile) => {
      setPendingProfile(null)
      setLocalError(null)
      navigateWithProfile(profile)
    },

    onError: (error) => {
      setLocalError(
        (error as Error).message ||
          "Impossible d'enregistrer ton rôle."
      )
    },
  })

  /*
   * FORMULAIRE DE CONNEXION
   */

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isLoading) return

    setLocalError(null)
    mutation.mutate()
  }

  function handleGoogleSignIn() {
    if (isLoading) return

    setLocalError(null)
    googleMutation.mutate()
  }

  function handleAppleSignIn() {
    if (isLoading) return

    setLocalError(null)
    appleMutation.mutate()
  }

  function handleRoleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (roleMutation.isPending) return

    setLocalError(null)
    roleMutation.mutate(selectedRole)
  }

  /*
   * ERREURS ET CHARGEMENT
   */

  const loginError =
    localError ??
    (mutation.isError
      ? (mutation.error as Error).message
      : googleMutation.isError
        ? (googleMutation.error as Error).message
        : appleMutation.isError
          ? (appleMutation.error as Error).message
          : null)

  const isLoading =
    mutation.isPending ||
    googleMutation.isPending ||
    appleMutation.isPending ||
    roleMutation.isPending ||
    isCompletingOAuth

  /*
   * ÉCRAN DE CHOIX DU RÔLE
   */

  if (pendingProfile) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-white px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center">
            <PulseLogo className="h-14 w-auto" />

            <h1 className="mt-6 text-2xl font-black text-slate-950">
              Bienvenue sur PULSE
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Choisis le profil qui te correspond.
            </p>
          </div>

          {loginError && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
            >
              {loginError}
            </div>
          )}

          <form onSubmit={handleRoleSubmit} className="mt-6 space-y-3">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                selectedRole === 'citoyen'
                  ? 'border-[#d94a0b] bg-orange-50'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="citoyen"
                checked={selectedRole === 'citoyen'}
                onChange={() => setSelectedRole('citoyen')}
                disabled={isLoading}
                className="mt-1 accent-[#d94a0b]"
              />

              <span>
                <span className="block font-bold text-slate-900">
                  Citoyen
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  Signaler un besoin et consulter les points sur la carte.
                </span>
              </span>
            </label>

            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                selectedRole === 'benevole'
                  ? 'border-[#d94a0b] bg-orange-50'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="benevole"
                checked={selectedRole === 'benevole'}
                onChange={() => setSelectedRole('benevole')}
                disabled={isLoading}
                className="mt-1 accent-[#d94a0b]"
              />

              <span>
                <span className="block font-bold text-slate-900">
                  Bénévole
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  Participer aux actions solidaires et aider sur le terrain.
                </span>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-3 min-h-12 w-full rounded-xl bg-[#d94a0b] px-4 py-3 text-sm font-black text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {roleMutation.isPending
                ? 'Enregistrement...'
                : 'Confirmer mon choix'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  /*
   * PAGE DE CONNEXION
   */

  return (
<div className="flex min-h-[100dvh] items-center justify-center bg-white px-4 py-8">
  <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center">
          <PulseLogo className="h-14 w-auto" />

          <h1 className="mt-6 text-2xl font-black text-slate-950">
            Connexion
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Connecte-toi à ton espace.
          </p>
        </div>

        {loginError && (
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
          >
            {loginError}
          </div>
        )}

        {/* CONNEXION PAR EMAIL EN PREMIER */}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Adresse e-mail
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isLoading}
              placeholder="Email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Mot de passe
            </label>

            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={isLoading}
              placeholder="Mot de passe"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-[#d94a0b] transition hover:text-[#b93607]"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="min-h-12 w-full rounded-xl bg-[#d94a0b] px-4 py-3 text-sm font-black text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {mutation.isPending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* SÉPARATEUR */}

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-bold text-slate-400">
            ou continuer avec
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* APPLE ET GOOGLE SOUS LE FORMULAIRE EMAIL */}

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleAppleSignIn}
            disabled={isLoading}
            className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-900 bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {appleMutation.isPending
              ? 'Connexion avec Apple...'
              : 'Continuer avec Apple'}
          </button>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {googleMutation.isPending
              ? 'Connexion avec Google...'
              : 'Continuer avec Google'}
          </button>
        </div>

        <div className="mt-5 text-center text-sm text-slate-600">
          Pas de compte ?{' '}
          <Link
            to="/register"
            className="font-bold text-[#d94a0b] hover:text-[#b93607]"
          >
            S’inscrire
          </Link>
        </div>
      </div>
    </div>
  )
}
