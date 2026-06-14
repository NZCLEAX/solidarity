import { useMemo, useState, type FormEvent } from 'react'

import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { reportFormSchema } from '@/features/security/model/schemas'
import { logSecurityEvent } from '@/features/security/services/security-audit'

const WINDOW_MS = 60_000
const MAX_REPORTS_PER_WINDOW = 3
const STORAGE_KEY = 'solidarity_report_timestamps'

function readTimestamps(now: number): number[] {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as number[]
    return parsed.filter((value) => now - value <= WINDOW_MS)
  } catch {
    return []
  }
}

function writeTimestamps(values: number[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
}

export function PointsPage() {
  const { can } = usePermissions()
  const canCreateReport = can('report.create')

  const [message, setMessage] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const remaining = useMemo(() => {
    const current = readTimestamps(Date.now())
    return Math.max(0, MAX_REPORTS_PER_WINDOW - current.length)
  }, [feedback])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = reportFormSchema.safeParse({ message })
    if (!parsed.success) {
      const errorMessage = parsed.error.issues[0]?.message ?? 'Signalement invalide'
      setValidationError(errorMessage)
      setFeedback(null)
      void logSecurityEvent({
        action: 'report.create.validation_failed',
        resource: 'points',
        outcome: 'failure',
        details: { error: errorMessage },
      })
      return
    }

    setValidationError(null)

    if (!canCreateReport) {
      setFeedback('Votre role ne peut pas creer de signalement.')
      void logSecurityEvent({
        action: 'report.create.attempt',
        resource: 'points',
        outcome: 'denied',
        details: { reason: 'role_not_allowed' },
      })
      return
    }

    const now = Date.now()
    const current = readTimestamps(now)

    if (current.length >= MAX_REPORTS_PER_WINDOW) {
      setFeedback('Quota atteint: maximum 3 signalements par minute.')
      void logSecurityEvent({
        action: 'report.create.rate_limited',
        resource: 'points',
        outcome: 'denied',
        details: { window_ms: WINDOW_MS, max_reports: MAX_REPORTS_PER_WINDOW },
      })
      return
    }

    const next = [...current, now]
    writeTimestamps(next)
    setMessage('')
    setFeedback('Signalement valide et prepare (simulation front).')

    void logSecurityEvent({
      action: 'report.create.success',
      resource: 'points',
      outcome: 'success',
      details: { message_length: parsed.data.message.length },
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Points de collecte</h1>
      <p className="mt-2 text-sm text-gray-500">Validation stricte et quota anti-spam.</p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm font-medium text-gray-800">Quota actuel</p>
        <p className="mt-1 text-sm text-gray-600">Signalements restants cette minute: {remaining}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
        <label htmlFor="report" className="block text-sm font-medium text-gray-700">
          Nouveau signalement
        </label>
        <textarea
          id="report"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="mt-2 min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Decrivez le signalement..."
        />

        <button
          type="submit"
          disabled={!canCreateReport}
          className="mt-3 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Envoyer
        </button>

        {validationError ? <p className="mt-3 text-sm text-red-600">{validationError}</p> : null}
        {feedback ? <p className="mt-3 text-sm text-gray-700">{feedback}</p> : null}
      </form>
    </div>
  )
}
