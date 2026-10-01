import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {
  signIn,
  signInWithProvider,
} from '@/features/auth/api/auth'

import { getCurrentProfile } from '@/features/auth/api/profile'

import { getDefaultPathForProfile } from '@/features/auth/utils/permissions'

import PulseLogo from '@/shared/components/PulseLogo'

export default function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  /* =========================================================
     CONNEXION EMAIL / MOT DE PASSE
  ========================================================= */

  const mutation = useMutation({
    mutationFn: async () => {
      await signIn(
        email.trim(),
        password
      )

      const profile =
        await getCurrentProfile()

      return profile
    },

    onSuccess: async (profile) => {
      queryClient.setQueryData(
        ['current-profile'],
        profile
      )

      await queryClient.invalidateQueries({
        queryKey: ['current-user'],
      })

      const defaultPath =
        getDefaultPathForProfile(profile)

      navigate(defaultPath, {
        replace: true,
      })
    },
  })

  /* =========================================================
     CONNEXION GOOGLE
  ========================================================= */

  const googleMutation = useMutation({
    mutationFn: async () => {
      /*
       * Sur Android :
       * → Google Sign-In natif
       * → ID Token
       * → Supabase
       *
       * Sur le Web :
       * → OAuth Google classique
       */
      await signInWithProvider('google')

      /*
       * Une fois la session Supabase créée,
       * on récupère le profil PULSE.
       */
      const profile =
        await getCurrentProfile()

      return profile
    },

    onSuccess: async (profile) => {
      /*
       * Met à jour le cache React Query.
       */
      queryClient.setQueryData(
        ['current-profile'],
        profile
      )

      await queryClient.invalidateQueries({
        queryKey: ['current-user'],
      })

      /*
       * Choisit automatiquement la bonne
       * destination suivant le rôle.
       *
       * Exemple :
       * citoyen → signaler un point
       * bénévole → carte
       * association → dashboard
       * admin → administration
       */
      const defaultPath =
        getDefaultPathForProfile(profile)

      navigate(defaultPath, {
        replace: true,
      })
    },
  })

  /* =========================================================
     SUBMIT EMAIL
  ========================================================= */

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    mutation.mutate()
  }

  /* =========================================================
     GOOGLE
  ========================================================= */

  function handleGoogleSignIn() {
    if (
      googleMutation.isPending ||
      mutation.isPending
    ) {
      return
    }

    googleMutation.mutate()
  }

  /* =========================================================
     ERREUR
  ========================================================= */

  const loginError =
    mutation.isError
      ? (mutation.error as Error)?.message
      : googleMutation.isError
        ? (googleMutation.error as Error)
            ?.message
        : null

  const isLoading =
    mutation.isPending ||
    googleMutation.isPending

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* ===================================================
            LOGO
        =================================================== */}

        <div className="flex flex-col items-center text-center">
          <PulseLogo className="h-14 w-auto" />

          <h1 className="mt-6 text-2xl font-black text-slate-950">
            Connexion
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Connecte-toi à ton espace.
          </p>
        </div>

        {/* ===================================================
            ERREUR
        =================================================== */}

        {loginError && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {loginError ||
              'Impossible de te connecter.'}
          </div>
        )}

        {/* ===================================================
            FORMULAIRE
        =================================================== */}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          {/* EMAIL */}

          <input
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
            type="email"
            placeholder="Email"
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          {/* MOT DE PASSE */}

          <div>
            <input
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              required
              type="password"
              placeholder="Mot de passe"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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

          {/* =================================================
              GOOGLE
          ================================================= */}

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              {googleMutation.isPending
                ? 'Connexion avec Google...'
                : 'Continuer avec Google'}
            </button>
          </div>

          {/* =================================================
              SÉPARATEUR
          ================================================= */}

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-xs font-bold text-slate-400">
              ou
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* =================================================
              CONNEXION EMAIL
          ================================================= */}

          <button
            type="submit"
            disabled={isLoading}
            className="min-h-12 w-full rounded-xl bg-[#d94a0b] px-4 py-3 text-sm font-black text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {mutation.isPending
              ? 'Connexion...'
              : 'Se connecter'}
          </button>
        </form>

        {/* ===================================================
            INSCRIPTION
        =================================================== */}

        <div className="mt-5 text-center text-sm text-slate-600">
          Pas de compte ?{' '}

          <Link
            to="/register"
            className="font-bold text-[#d94a0b]"
          >
            S’inscrire
          </Link>
        </div>
      </div>
    </div>
  )
}