import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../api/auth'
import {
  publicRegisterRoles,
  type PublicRegisterRole,
} from '../utils/roles'
import {
  isValidPassword,
  passwordValidationMessage,
} from '../utils/passwordValidation'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<PublicRegisterRole>('citoyen')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!name.trim()) {
      setError('Le nom est obligatoire.')
      setLoading(false)
      return
    }

    if (!email.trim()) {
      setError('L’email est obligatoire.')
      setLoading(false)
      return
    }

    if (!isValidPassword(password)) {
      setError(passwordValidationMessage)
      setLoading(false)
      return
    }

    try {
      await signUp(email, password, name, role)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || "Erreur d'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold mb-2">Inscription</h1>
        <p className="text-slate-500 mb-6">Crée ton compte.</p>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Type de compte
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as PublicRegisterRole)}
              className="w-full rounded-lg border px-3 py-2"
            >
              {publicRegisterRoles.map((roleOption) => (
                <option key={roleOption.value} value={roleOption.value}>
                  {roleOption.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
            <p className="text-xs text-slate-500">
              15 caractères minimum, avec au moins une majuscule, une minuscule
              et un chiffre.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white rounded-lg px-4 py-2 disabled:opacity-60"
          >
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-indigo-600 font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}