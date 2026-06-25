import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { getPointById, updatePoint } from '@/features/points/api/points'
import {
  pointUpdateSchema,
  type PointUpdateValues as PointUpdate,
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

export default function EditPointPage() {
  const { pointId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const requiredPointId = pointId as string

  const { data: point, isLoading, isError, error } = useQuery({
    queryKey: ['point', requiredPointId],
    queryFn: () => getPointById(requiredPointId),
    enabled: Boolean(requiredPointId),
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PointUpdate>({
    resolver: zodResolver(pointUpdateSchema),
  })

  useEffect(() => {
    if (point) {
      reset({
        adresse: point.adresse || '',
        latitude: point.latitude ?? undefined,
        longitude: point.longitude ?? undefined,
        nombrePersonnesEstime: point.nombre_personnes_estime ?? undefined,
        typologie: point.typologie || '',
        niveauUrgence: point.niveau_urgence || 'moyenne',
        statut: point.statut || 'signale',
        besoins: point.besoins ? point.besoins.split(',').map((b) => b.trim()) : [],
        commentaire: point.commentaire || '',
      })
    }
  }, [point, reset])

  const mutation = useMutation({
    mutationFn: (data: PointUpdate) => updatePoint(requiredPointId, data),
    onSuccess: () => {
      void logSecurityEvent({
        action: 'report.update.success',
        resource: 'points',
        outcome: 'success',
        details: { mode: 'edit', point_id: requiredPointId },
      })
      // Invalidate queries to refetch data on other pages
      void queryClient.invalidateQueries({ queryKey: ['points'] })
      void queryClient.invalidateQueries({ queryKey: ['point', requiredPointId] })
      navigate('/points')
    },
    onError: (err) => {
      void logSecurityEvent({
        action: 'report.update.attempt',
        resource: 'points',
        outcome: 'failure',
        details: { error: err.message, mode: 'edit' },
      })
    },
  })

  const onSubmit: SubmitHandler<PointUpdate> = (data) => {
    mutation.mutate(data)
  }

  if (isLoading) {
    return <div className="rounded-xl bg-white p-6 text-slate-600">Chargement du point...</div>
  }

  if (isError || !point) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {(error as Error)?.message || 'Point introuvable.'}
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <button
        type="button"
        onClick={() => navigate('/points')}
        className="mb-4 text-sm text-slate-600 hover:text-slate-900"
      >
        ← Retour aux points
      </button>

      <h1 className="text-3xl font-bold text-slate-950">Modifier un point de precarite</h1>
      <p className="mt-2 text-slate-600">Mets a jour les informations du point sélectionné.</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Adresse ou lieu *</label>
          <input
            type="text"
            {...register('adresse')}
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
          <label className="block text-sm font-medium text-slate-700">Statut *</label>
          <select
            {...register('statut')}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="signale">Signalé</option>
            <option value="a_confirmer">À confirmer</option>
            <option value="confirme">Confirmé</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="archive">Archivé</option>
          </select>
          {errors.statut && <p className="mt-1 text-sm text-red-600">{errors.statut.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Besoins observés *</label>
          <Controller
            name="besoins"
            control={control}
            defaultValue={[]}
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
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {errors.typologie && <p className="mt-1 text-sm text-red-600">{errors.typologie.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Commentaire</label>
          <textarea
            {...register('commentaire')}
            rows={4}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {errors.commentaire && <p className="mt-1 text-sm text-red-600">{errors.commentaire.message}</p>}
        </div>

        {mutation.isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {(mutation.error as Error).message || 'Erreur lors de la mise a jour du point.'}
          </div>
        ) : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Mise a jour...' : 'Mettre a jour'}
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
