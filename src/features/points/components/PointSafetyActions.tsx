import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check } from 'lucide-react'

import {
  REPORT_REASONS,
  blockUser,
  getCurrentUserId,
  reportPoint,
  type ReportReason,
} from '@/features/moderation/api/contentReports'
import {
  chipClass,
  formFieldClass,
  formLabelClass,
} from '@/shared/components/FormSection'

type Mode = 'idle' | 'report' | 'block'

type PointSafetyActionsProps = {
  pointId: string
  authorId: string | null
  // Version courte pour la fiche de la carte (sans texte d'explication).
  compact?: boolean
}

const primaryButtonClass =
  'min-h-11 flex-1 rounded-lg bg-[#d94a0b] px-4 text-sm font-semibold text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:opacity-60'

const cancelButtonClass = 'text-sm font-medium text-slate-600'

// Bloc « Signaler ce contenu / Bloquer l'auteur » affiché sur la fiche
// d'un point (règle App Store 1.2 sur le contenu des utilisateurs).
// Même style que les formulaires PULSE : section à plat, pastilles.
export default function PointSafetyActions({
  pointId,
  authorId,
  compact = false,
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

  if (isLoading) {
    return null
  }

  // Sur ses propres signalements : pas de « Signaler » ni de « Bloquer »
  // (on ne se signale pas et on ne se bloque pas soi-même).
  if (authorId && authorId === currentUserId) {
    return (
      <p
        className={
          compact
            ? 'mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500'
            : 'mt-6 border-t border-slate-200 py-5 text-sm text-slate-500'
        }
      >
        C’est toi qui as signalé ce point. « Signaler » et « Bloquer
        l’auteur » apparaissent sur les points des autres utilisateurs.
      </p>
    )
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

  const errorMessage =
    formError ||
    (reportMutation.error as Error | null)?.message ||
    (blockMutation.error as Error | null)?.message ||
    ''

  return (
    <section
      id={compact ? undefined : 'signaler'}
      className={
        compact
          ? 'mt-4 border-t border-slate-200 pt-3'
          : 'mt-6 scroll-mt-28 border-t border-slate-200 py-5'
      }
    >
      <h2
        className={
          compact
            ? 'text-sm font-semibold text-slate-950'
            : 'text-base font-semibold text-slate-950'
        }
      >
        Un problème avec ce contenu ?
      </h2>

      {!compact && (
        <p className="mt-1 text-sm text-slate-500">
          Signale un contenu inapproprié, faux ou offensant : l’équipe de
          modération l’examinera rapidement. Tu peux aussi bloquer son
          auteur pour ne plus voir ses signalements.
        </p>
      )}

      {reported && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-700">
          <Check size={15} />
          Merci, ton signalement a été transmis à l’équipe de modération.
        </p>
      )}

      {blocked && (
        <p className="mt-3 text-sm font-medium text-emerald-700">
          <Check size={15} className="mr-1.5 inline align-[-2px]" />
          Auteur bloqué : ses signalements n’apparaîtront plus sur ta carte
          ni dans tes listes.{' '}
          <Link to="/carte" className="font-semibold text-[#d94a0b]">
            Retour à la carte
          </Link>
        </p>
      )}

      {errorMessage && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      )}

      {mode === 'idle' && (!reported || canBlock) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
          {!reported && (
            <button
              type="button"
              onClick={() => {
                reportMutation.reset()
                setMode('report')
              }}
              className="text-red-600"
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
              className="text-slate-600"
            >
              Bloquer l’auteur
            </button>
          )}
        </div>
      )}

      {mode === 'idle' && !authorId && !reported && (
        <p className="mt-2 text-xs text-slate-500">
          Auteur inconnu pour ce point : le blocage n’est pas disponible,
          mais tu peux le signaler.
        </p>
      )}

      {mode === 'report' && (
        <form onSubmit={handleReportSubmit} className="mt-4">
          <p className={formLabelClass}>Motif du signalement</p>

          <div className="flex flex-wrap gap-2">
            {REPORT_REASONS.map((item) => {
              const selected = reason === item

              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setReason(item)
                    setFormError('')
                  }}
                  className={chipClass(selected)}
                >
                  {selected && <Check size={15} />}
                  {item}
                </button>
              )
            })}
          </div>

          <label
            htmlFor="report-details"
            className={`${formLabelClass} mt-4`}
          >
            Précisions (facultatif)
          </label>

          <textarea
            id="report-details"
            rows={3}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            maxLength={500}
            placeholder="Explique en quelques mots ce qui pose problème…"
            className={`${formFieldClass} py-2`}
          />

          <div className="mt-4 flex items-center gap-4">
            <button
              type="submit"
              disabled={reportMutation.isPending}
              className={primaryButtonClass}
            >
              {reportMutation.isPending
                ? 'Envoi en cours...'
                : 'Envoyer le signalement'}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('idle')
                setFormError('')
              }}
              className={cancelButtonClass}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {mode === 'block' && authorId && (
        <div className="mt-4">
          <p className="text-sm text-slate-600">
            Bloquer l’auteur de ce point ? Tu ne verras plus ses
            signalements sur la carte ni dans les listes. Il ne sera pas
            prévenu.
          </p>

          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              disabled={blockMutation.isPending}
              onClick={() => blockMutation.mutate(authorId)}
              className={primaryButtonClass}
            >
              {blockMutation.isPending
                ? 'Blocage en cours...'
                : 'Confirmer le blocage'}
            </button>

            <button
              type="button"
              onClick={() => setMode('idle')}
              className={cancelButtonClass}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
