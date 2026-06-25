import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { getPoints } from '@/features/points/api/points'
import { createIntervention } from '@/features/interventions/api/interventions'
import {
  interventionSubmissionSchema,
  type InterventionSubmissionValues as InterventionSubmission,
} from '@/features/security/model/schemas'
import { logSecurityEvent } from '@/features/security/services/security-audit'

const typeAideOptions = [
  'Distribution de repas',
  'Distribution d’eau',
  'Distribution de vêtements',
  'Maraude',
  'Soins',
  'Accompagnement social',
  'Autre',
]

export default function CreateInterventionPage() {
  const navigate = useNavigate()
  const { can } = usePermissions()
  const queryClient = useQueryClient()
  const canManageInterventions = can('interventions.manage')

  const { data: points = [], isLoading: pointsLoading } = useQuery({
    queryKey: ['points'],
    queryFn: getPoints,
  })
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InterventionSubmission>({
    resolver: zodResolver(interventionSubmissionSchema),
    defaultValues: {
      typeAide: 'Distribution de repas',
      commentaire: '',
    },
  })

  const mutation = useMutation({
    mutationFn: createIntervention,
    onSuccess: (data) => {
      void logSecurityEvent({
        action: 'intervention.create.success',
        resource: 'interventions',
        outcome: 'success',
        details: {
          point_id: data.point_id,
          date_intervention: data.date_intervention,
        },
      })
      void queryClient.invalidateQueries({ queryKey: ['interventions'] })
      navigate('/interventions')
    },
    onError: (err) => {
      setServerError(err.message || "Erreur lors de la déclaration de l'intervention.")
      void logSecurityEvent({
        action: 'intervention.create.attempt',
        resource: 'interventions',
        outcome: 'failure',
        details: { error: err.message },
      })
    },
  })

  const onSubmit: SubmitHandler<InterventionSubmission> = (data) => {
    setServerError(null)

    if (!canManageInterventions) {
      setServerError('Votre role ne peut pas declarer une intervention.')
      void logSecurityEvent({
        action: 'intervention.create.attempt',
        resource: 'interventions',
        outcome: 'denied',
        details: { reason: 'role_not_allowed' },
      })
      return
    }

    mutation.mutate(data)
  }

  return (
    <div className="max-w-3xl">
      <button
        type="button"
        onClick={() => navigate('/interventions')}
        className="mb-4 text-sm text-slate-600 hover:text-slate-900"
      >
        ← Retour aux interventions
      </button>

      <h1 className="text-3xl font-bold text-slate-950">Déclarer une intervention</h1>
      <p className="mt-2 text-slate-600">
        Renseigne les informations de l’intervention réalisée sur un point.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Point concerné *</label>

          <select
            {...register('pointId')}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            disabled={pointsLoading}
          >
            <option value="">
              {pointsLoading ? 'Chargement des points...' : 'Sélectionner un point'}
            </option>

            {points.map((point) => (
              <option key={point.id} value={point.id}>
                {point.adresse || 'Point sans adresse'}
              </option>
            ))}
          </select>
          {errors.pointId && <p className="mt-1 text-sm text-red-600">{errors.pointId.message}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Date *</label>
            <input
              type="date"
              {...register('dateIntervention')}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {errors.dateIntervention && <p className="mt-1 text-sm text-red-600">{errors.dateIntervention.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Heure de début *</label>
            <input
              type="time"
              {...register('heureDebut')}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {errors.heureDebut && <p className="mt-1 text-sm text-red-600">{errors.heureDebut.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Heure de fin *</label>
            <input
              type="time"
              {...register('heureFin')}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {errors.heureFin && <p className="mt-1 text-sm text-red-600">{errors.heureFin.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Type d'aide *</label>
          <select
            {...register('typeAide')}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            {typeAideOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.typeAide && <p className="mt-1 text-sm text-red-600">{errors.typeAide.message}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nombre de repas *</label>
            <input
              type="number"
              min="0"
              {...register('nombreRepas', { valueAsNumber: true })}
              placeholder="Ex : 80"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {errors.nombreRepas && <p className="mt-1 text-sm text-red-600">{errors.nombreRepas.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Nombre de bénévoles *</label>
            <input
              type="number"
              min="1"
              {...register('nombreBenevoles', { valueAsNumber: true })}
              placeholder="Ex : 6"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {errors.nombreBenevoles && <p className="mt-1 text-sm text-red-600">{errors.nombreBenevoles.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Commentaire</label>
          <textarea
            {...register('commentaire')}
            rows={4}
            placeholder="Informations complémentaires..."
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {errors.commentaire && <p className="mt-1 text-sm text-red-600">{errors.commentaire.message}</p>}
        </div>

        {(serverError || errors.root) && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError || errors.root?.message}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Déclaration...' : 'Déclarer'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/interventions')}
            className="rounded-lg border border-slate-300 px-5 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}