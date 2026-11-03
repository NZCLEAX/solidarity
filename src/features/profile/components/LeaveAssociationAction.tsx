import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { leaveMyAssociation } from '@/features/associations/api/associations'

// Bouton « Quitter mon association » affiché aux bénévoles rattachés,
// dans la section « Mon rôle » de la page Espace.
export default function LeaveAssociationAction({
  associationName,
}: {
  associationName: string | null
}) {
  const queryClient = useQueryClient()
  const [confirming, setConfirming] = useState(false)

  const mutation = useMutation({
    mutationFn: leaveMyAssociation,
    onSuccess: async () => {
      setConfirming(false)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['current-profile'] }),
        queryClient.invalidateQueries({
          queryKey: ['my-association-join-requests'],
        }),
        queryClient.invalidateQueries({ queryKey: ['points'] }),
      ])
    },
  })

  const name = associationName || 'ton association'

  return (
    <div className="mt-3">
      {mutation.error && (
        <p
          role="alert"
          className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {(mutation.error as Error).message}
        </p>
      )}

      {!confirming ? (
        <button
          type="button"
          onClick={() => {
            mutation.reset()
            setConfirming(true)
          }}
          className="text-sm font-semibold text-red-600"
        >
          Quitter mon association
        </button>
      ) : (
        <div>
          <p className="text-sm text-slate-600">
            Quitter {name} ? Tu n’auras plus accès à ses outils terrain
            (carte, planning, interventions). Tu pourras ensuite demander à
            rejoindre une autre association.
          </p>

          <div className="mt-3 flex items-center gap-4">
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
              className="min-h-11 flex-1 rounded-lg bg-[#d94a0b] px-4 text-sm font-semibold text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending
                ? 'En cours...'
                : 'Confirmer et quitter'}
            </button>

            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-sm font-medium text-slate-600"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
