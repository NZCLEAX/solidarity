import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/auth-context'
import { logSecurityEvent } from '@/features/security/services/security-audit'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard'

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await login(email, password)
      if (result.error) {
        throw new Error(result.error)
      }

      void logSecurityEvent({
        action: 'auth.login.success',
        resource: 'session',
        outcome: 'success',
        details: { email_domain: email.split('@')[1] ?? null },
      })

      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold">Connexion</h1>
        <p className="mb-6 text-slate-500">Connecte-toi a ton espace.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-lg border px-3 py-2"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-lg border px-3 py-2"
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Pas de compte ?{' '}
          <Link to="/register" className="font-medium text-indigo-600">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
