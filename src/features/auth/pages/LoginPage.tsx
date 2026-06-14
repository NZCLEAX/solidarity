import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/auth-context'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const { error } = await login(email, password)
    if (error) {
      setErrorMessage(error)
      return
    }

    setErrorMessage(null)
    navigate(from, { replace: true })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Connexion</h1>

      <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
        Email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="mb-5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        placeholder="vous@exemple.com"
        required
      />

      <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
        Mot de passe
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="mb-5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        required
      />

      {errorMessage ? <p className="mb-4 text-sm text-red-600">{errorMessage}</p> : null}

      <button
        type="submit"
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Se connecter
      </button>
    </form>
  )
}
