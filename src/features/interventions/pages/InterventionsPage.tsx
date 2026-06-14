import { useState, type FormEvent } from 'react'

import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { interventionCommentSchema } from '@/features/security/model/schemas'
import { logSecurityEvent } from '@/features/security/services/security-audit'

export function InterventionsPage() {
  const { can } = usePermissions()
  const canComment = can('interventions.comment')

  const [comment, setComment] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = interventionCommentSchema.safeParse({ comment })
    if (!parsed.success) {
      const errorMessage = parsed.error.issues[0]?.message ?? 'Commentaire invalide'
      setValidationError(errorMessage)
      setFeedback(null)
      void logSecurityEvent({
        action: 'intervention.comment.validation_failed',
        resource: 'interventions',
        outcome: 'failure',
        details: { error: errorMessage },
      })
      return
    }

    if (!canComment) {
      setFeedback('Votre role ne peut pas commenter une intervention.')
      void logSecurityEvent({
        action: 'intervention.comment.attempt',
        resource: 'interventions',
        outcome: 'denied',
        details: { reason: 'role_not_allowed' },
      })
      return
    }

    setValidationError(null)
    setComment('')
    setFeedback('Commentaire valide et prepare (simulation front).')

    void logSecurityEvent({
      action: 'intervention.comment.success',
      resource: 'interventions',
      outcome: 'success',
      details: { comment_length: parsed.data.comment.length },
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Interventions</h1>
      <p className="mt-2 text-sm text-gray-500">Operations terrain selon votre role.</p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>
            Prendre et mettre a jour des interventions: {can('interventions.manage') ? 'autorise' : 'interdit'}
          </li>
          <li>Commenter une intervention: {canComment ? 'autorise' : 'interdit'}</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          Commenter une intervention
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="mt-2 min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Votre commentaire..."
        />

        <button
          type="submit"
          disabled={!canComment}
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
