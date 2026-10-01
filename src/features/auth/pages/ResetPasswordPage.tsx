import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function checkSession() {
      const { data } = await supabase.auth.getSession()

      if (!mounted) {
        return
      }

      if (!data.session) {
        setError(
          'Le lien de réinitialisation est invalide ou a expiré.'
        )
      }

      setCheckingSession(false)
    }

    checkSession()

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (
          mounted &&
          session
        ) {
          setError('')
          setCheckingSession(false)
        }
      }
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError('')

    if (password.length < 15) {
      setError(
        'Le mot de passe doit contenir au moins 15 caractères.'
      )
      return
    }

    if (!/[A-Z]/.test(password)) {
      setError(
        'Le mot de passe doit contenir au moins une majuscule.'
      )
      return
    }

    if (!/[a-z]/.test(password)) {
      setError(
        'Le mot de passe doit contenir au moins une minuscule.'
      )
      return
    }

    if (!/[0-9]/.test(password)) {
      setError(
        'Le mot de passe doit contenir au moins un chiffre.'
      )
      return
    }

    if (password !== confirmPassword) {
      setError(
        'Les deux mots de passe ne correspondent pas.'
      )
      return
    }

    try {
      setLoading(true)

      const { error } =
        await supabase.auth.updateUser({
          password,
        })

      if (error) {
        throw error
      }

      await supabase.auth.signOut()

      navigate('/login', {
        replace: true,
      })
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Impossible de modifier le mot de passe.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0f172a] px-4 py-10 text-center text-slate-300">
        Vérification du lien...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] px-4 py-10">
      <div className="mx-auto max-w-md rounded-[2rem] border border-slate-700 bg-[#111827] p-6 shadow-xl sm:p-8">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-500">
            PULSE
          </p>

          <h1 className="mt-4 text-3xl font-black text-white">
            Nouveau mot de passe
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Choisis un nouveau mot de passe sécurisé.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-200">
              Nouveau mot de passe
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Nouveau mot de passe"
              className="min-h-14 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-200">
              Confirmer le mot de passe
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirme ton mot de passe"
              className="min-h-14 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-orange-500"
            />
          </div>

          <p className="text-xs leading-relaxed text-slate-400">
            Minimum 15 caractères avec au moins une majuscule,
            une minuscule et un chiffre.
          </p>

          {error && (
            <div className="rounded-2xl border border-red-700 bg-red-950/40 p-4 text-sm font-bold text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="min-h-14 w-full rounded-2xl bg-[#d94a0b] px-5 font-black text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Modification...'
              : 'Modifier le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  )
}