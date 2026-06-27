import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { signIn } from '@/features/auth/api/auth'
import { getCurrentProfile } from '@/features/auth/api/profile'
import { getDefaultPathForProfile } from '@/features/auth/utils/permissions'
import { signInWithProvider } from '@/features/auth/api/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      await signIn(email.trim(), password)

      const profile = await getCurrentProfile()

      return profile
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['current-profile'], profile)

      const defaultPath = getDefaultPathForProfile(profile)

      navigate(defaultPath, { replace: true })
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    mutation.mutate()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">Connexion</h1>

        <p className="mt-2 text-sm text-slate-500">Connecte-toi à ton espace.</p>

        {mutation.isError && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {(mutation.error as Error)?.message ||
              'Impossible de te connecter.'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
          />

          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            placeholder="Mot de passe"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
          />
<div className="space-y-3">
  <button
    type="button"
    onClick={() => signInWithProvider('google')}
    className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-50"
  >
    Continuer avec Google
  </button>

</div>

<div className="my-4 flex items-center gap-3">
  <div className="h-px flex-1 bg-slate-200" />
  <span className="text-xs font-bold text-slate-400">ou</span>
  <div className="h-px flex-1 bg-slate-200" />
</div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="min-h-12 w-full rounded-xl bg-[#d94a0b] px-4 py-3 text-sm font-black text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {mutation.isPending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-600">
          Pas de compte ?{' '}
          <Link to="/register" className="font-bold text-[#d94a0b]">
            S’inscrire
          </Link>
        </div>
      </div>
    </div>
  )
}