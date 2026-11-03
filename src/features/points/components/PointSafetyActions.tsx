import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  REPORT_REASONS,
  blockUser,
  getCurrentUserId,
  reportPoint,
  type ReportReason,
} from '@/features/moderation/api/contentReports'

type Mode = 'idle' | 'report' | 'block'

type PointSafetyActionsProps = {
  pointId: string
  authorId: string | null
}

// Bloc « Signaler ce contenu / Bloquer l'auteur » affiché sur la fiche
// d'un point (règle App Store 1.2 sur le contenu des utilisateurs).
export default function PointSafetyActions({
  pointId,
  authorId,
}: PointSafetyActionsProps) {
  const queryClient = useQueryClient()

  const [mode, setMode] = useState<Mode>('idle')
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [details, setDetails] = useState('')
  const [formError, setFormError] = useState('')
  const [reported, setReported] = useState(false)
  const [blocked, setBlocked] = useState(false)

  const { data: currentUserId, isLoading } = useQuery({
    queryKey: ['current-user-id'],
    queryFn: getCurrentUserId,
  })

  const reportMutation = useMutation({
    mutationFn: reportPoint,
    onSuccess: () => {
      setReported(true)
      setMode('idle')
      setReason('')
      setDetails('')
    },
  })

  const blockMutation = useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      setBlocked(true)
      setMode('idle')
      queryClient.invalidateQueries({ queryKey: ['points'] })
    },
  })

  // Pas de bouton sur ses propres signalements.
  if (isLoading || (authorId && authorId === currentUserId)) {
    return null
  }

  const canBlock = Boolean(authorId) && !blocked

  function handleReportSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    if (!reason) {
      setFormError('Choisis un motif de signalement.')
      return
    }

    reportMutation.mutate({ pointId, motif: reason, details })
  }

  const mutationError =
    (reportMutation.error as Error | null)?.message ||
    (blockMutation.error as Error | null)?.message ||
    ''

  return (
    <section
      id="signaler"
      className="mt-6 scroll-mt-28 rounded-[2rem] border border-red-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <h2 className="text-2xl font-black text-slate-950">
        Un problème avec ce contenu ?
      </h2>

      <p className="mt-1 text-sm leading-relaxed text-slate-500">
        Signale un contenu inapproprié, faux ou offensant : l’équipe de
        modération l’examinera rapidement. Tu peux aussi bloquer son auteur
        pour ne plus voir ses signalements.
      </p>

      {reported && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          Merci, ton signalement a été transmis à l’équipe de modération.
        </div>
      )}

      {blocked && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          Auteur bloqué. Ses signalements n’apparaîtront plus sur ta carte ni
          dans tes listes.{' '}
          <Link to="/carte" className="underline underline-offset-4">
            Retour à la carte
          </Link>
        </div>
      )}

      {mutationError && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {mutationError}
        </div>
      )}

      {mode === 'idle' && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {!reported && (
            <button
              type="button"
              onClick={() => {
                reportMutation.reset()
                setMode('report')
              }}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
            >
              Signaler ce contenu
            </button>
          )}

          {canBlock && (
            <button
              type="button"
              onClick={() => {
                blockMutation.reset()
                setMode('block')
              }}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Bloquer l’auteur
            </button>
          )}
        </div>
      )}

      {mode === 'report' && (
        <form onSubmit={handleReportSubmit} className="mt-5 space-y-4">
          <fieldset>
            <legend className="text-sm font-black text-slate-950">
              Motif du signalement
            </legend>

            <div className="mt-3 grid gap-2">
              {REPORT_REASONS.map((item) => (
                <label
                  key={item}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                    reason === item
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="motif"
                    value={item}
                    checked={reason === item}
                    onChange={() => setReason(item)}
                    className="h-4 w-4 accent-red-600"
                  />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="report-details"
              className="text-sm font-black text-slate-950"
            >
              Précisions (facultatif)
            </label>
            <textarea
              id="report-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Explique en quelques mots ce qui pose problème…"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-red-400"
            />
          </div>

          {formError && (
            <p className="text-sm font-bold text-red-700">{formError}</p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={reportMutation.isPending}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {reportMutation.isPending
                ? 'Envoi…'
                : 'Envoyer le signalement'}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('idle')
                setFormError('')
              }}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {mode === 'block' && authorId && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-bold leading-relaxed text-slate-700">
            Bloquer l’auteur de ce point ? Tu ne verras plus ses signalements
            sur la carte ni dans les listes. Il ne sera pas prévenu.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={blockMutation.isPending}
              onClick={() => blockMutation.mutate(authorId)}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-[#d94a0b] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b93607] disabled:opacity-60"
            >
              {blockMutation.isPending
                ? 'Blocage…'
                : 'Confirmer le blocage'}
            </button>

            <button
              type="button"
              onClick={() => setMode('idle')}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
