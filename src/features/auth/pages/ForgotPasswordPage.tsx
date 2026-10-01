import { useState } from 'react'
import { Link } from 'react-router-dom'

import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError('')
    setSuccess('')

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail) {
      setError('Renseigne ton adresse e-mail.')
      return
    }

    try {
      setLoading(true)

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo:
              `${window.location.origin}/reset-password`,
          }
        )

      if (error) {
        throw error
      }

      setSuccess(
        'Si un compte existe avec cette adresse, un e-mail de réinitialisation a été envoyé.'
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Impossible d’envoyer l’e-mail de réinitialisation.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] px-4 py-10">
      <div className="mx-auto max-w-md rounded-[2rem] border border-slate-700 bg-[#111827] p-6 shadow-xl sm:p-8">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-500">
            PULSE
          </p>

          <h1 className="mt-4 text-3xl font-black text-white">
            Mot de passe oublié
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Entre ton adresse e-mail pour recevoir un lien de réinitialisation.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-200">
              Adresse e-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="email@exemple.com"
              className="min-h-14 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-orange-500"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-700 bg-red-950/40 p-4 text-sm font-bold text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-emerald-700 bg-emerald-950/40 p-4 text-sm font-bold text-emerald-300">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="min-h-14 w-full rounded-2xl bg-[#d94a0b] px-5 font-black text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Envoi en cours...'
              : 'Envoyer le lien'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm font-bold text-orange-500 transition hover:text-orange-400"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}