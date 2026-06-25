import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { createPoint } from '@/features/points/api/points'
import {
  pointSubmissionSchema,
  type PointSubmissionValues as PointSubmission,
} from '@/features/security/model/schemas'
import { logSecurityEvent } from '@/features/security/services/security-audit'

const besoinOptions = [
  'Repas',
  'Eau',
  'Hygiène',
  'Vêtements',
  'Couvertures',
  'Soins',
  'Autre',
]

export default function CreatePointPage() {
  const navigate = useNavigate()
  const { can } = usePermissions()
  const canCreateReport = can('report.create')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PointSubmission>({
    resolver: zodResolver(pointSubmissionSchema),
    defaultValues: {
      adresse: '',
      typologie: '',
      niveauUrgence: 'moyenne',
      besoins: [],
      commentaire: '',
    },
  })

  const [serverError, setServerError] = useState<string | null>(null)

  const onSubmit: SubmitHandler<PointSubmission> = async (data) => {
    setServerError(null)

    if (!canCreateReport) {
      setServerError('Votre role ne peut pas creer de signalement.')
      void logSecurityEvent({
        action: 'report.create.attempt',
        resource: 'points',
        outcome: 'denied',
        details: { reason: 'role_not_allowed' },
      })
      return
    }

    try {
      await createPoint({
        ...data,
        typologie: data.typologie || '',
      })

      void logSecurityEvent({
        action: 'report.create.success',
        resource: 'points',
        outcome: 'success',
        details: { message_length: data.commentaire?.length ?? 0 },
      })

      navigate('/points')
    } catch (err: any) {
      setServerError(err.message || 'Erreur lors de la creation du point.')
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/points')}
          className="mb-4 text-sm text-slate-600 hover:text-slate-900"
        >
          ← Retour aux points
        </button>

        <h1 className="text-3xl font-bold text-slate-950">Signaler un point de precarite</h1>
        <p className="mt-2 text-slate-600">
          Crée un nouveau point afin qu’il puisse être suivi par les acteurs du terrain.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Adresse ou lieu *</label>
          <input
            type="text"
            {...register('adresse')}
            placeholder="Ex : Gare du Nord, Paris 10e"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {errors.adresse && <p className="mt-1 text-sm text-red-600">{errors.adresse.message}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Latitude *</label>
            <input
              type="number"
              step="any"
              {...register('latitude', { valueAsNumber: true })}
              placeholder="48.8809"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {errors.latitude && <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Longitude *</label>
            <input
              type="number"
              step="any"
              {...register('longitude', { valueAsNumber: true })}
              placeholder="2.3553"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {errors.longitude && <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nombre de personnes estime *
            </label>
            <input
              type="number"
              min="1"
              {...register('nombrePersonnesEstime', { valueAsNumber: true })}
              placeholder="Ex : 20"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            {errors.nombrePersonnesEstime && (
              <p className="mt-1 text-sm text-red-600">{errors.nombrePersonnesEstime.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Niveau d'urgence *</label>
            <select
              {...register('niveauUrgence')}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
              <option value="critique">Critique</option>
            </select>
            {errors.niveauUrgence && <p className="mt-1 text-sm text-red-600">{errors.niveauUrgence.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Besoins observés *</label>
          <Controller
            name="besoins"
            control={control}
            render={({ field }) => (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {besoinOptions.map((besoin) => (
                  <label
                    key={besoin}
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                      field.value.includes(besoin)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={field.value.includes(besoin)}
                      onChange={() => {
                        const newValue = field.value.includes(besoin)
                          ? field.value.filter((item: string) => item !== besoin)
                          : [...field.value, besoin]
                        field.onChange(newValue)
                      }}
                    />
                    {besoin}
                  </label>
                ))}
              </div>
            )}
          />
          {errors.besoins && <p className="mt-1 text-sm text-red-600">{errors.besoins.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Typologie</label>
          <input
            type="text"
            {...register('typologie')}
            placeholder="Ex : familles, hommes seuls, migrants..."
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Commentaire</label>
          <textarea
            {...register('commentaire')}
            placeholder="Observations complémentaires..."
            rows={4}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        {serverError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        ) : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Signalement...' : 'Signaler le point'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/points')}
            className="rounded-lg border border-slate-300 px-5 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}