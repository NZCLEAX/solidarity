import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { getPointById, updatePoint } from '@/features/points/api/points'
import { pointUpdateSchema, type PointUpdate } from '@/features/security/model/schemas'
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

  const [point, setPoint] = useState<Point | null>(null)
  const [adresse, setAdresse] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [nombrePersonnesEstime, setNombrePersonnesEstime] = useState('')
  const [typologie, setTypologie] = useState('')
  const [niveauUrgence, setNiveauUrgence] = useState<'basse' | 'moyenne' | 'haute' | 'critique'>('moyenne')
  const [statut, setStatut] = useState<'signale' | 'a_confirmer' | 'confirme' | 'actif' | 'inactif' | 'archive'>('signale')
  const [besoins, setBesoins] = useState<string[]>([])
  const [commentaire, setCommentaire] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPoint = async () => {
      if (!pointId) {
        setError('Identifiant du point introuvable.')
        setLoading(false)
        return
      }

      try {
        const data = await getPointById(pointId)
        setPoint(data)
        setAdresse(data.adresse || '')
        setLatitude(data.latitude?.toString() || '')
        setLongitude(data.longitude?.toString() || '')
        setNombrePersonnesEstime(data.nombre_personnes_estime?.toString() || '')
        setTypologie(data.typologie || '')
        setNiveauUrgence(
          (data.niveau_urgence as 'basse' | 'moyenne' | 'haute' | 'critique') || 'moyenne'
        )
        setStatut(
          (data.statut as
            | 'signale'
            | 'a_confirmer'
            | 'confirme'
            | 'actif'
            | 'inactif'
            | 'archive') || 'signale'
        )
        setBesoins(
          data.besoins ? data.besoins.split(',').map((besoin) => besoin.trim()) : []
        )
        setCommentaire(data.commentaire || '')
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du point.')
      } finally {
        setLoading(false)
      }
    }

    loadPoint()
  }, [pointId])

  const toggleBesoin = (besoin: string) => {
    setBesoins((current) =>
      current.includes(besoin)
        ? current.filter((item) => item !== besoin)
        : [...current, besoin]
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSaving(true)

    if (!pointId) {
      setError('Identifiant du point introuvable.')
      setSaving(false)
      return
    }

    const parsed = pointUpdateSchema.safeParse({
      adresse,
      latitude: Number(latitude),
      longitude: Number(longitude),
      nombrePersonnesEstime: Number(nombrePersonnesEstime),
      typologie,
      niveauUrgence,
      statut,
      besoins,
      commentaire,
    })

    if (!parsed.success) {
      const errorMessage = parsed.error.issues[0]?.message ?? 'Point invalide'
      setError(errorMessage)
      void logSecurityEvent({
        action: 'report.update.validation_failed',
        resource: 'points',
        outcome: 'failure',
        details: { error: errorMessage, mode: 'edit' },
      })
      setSaving(false)
      return
    }

    try {
      await updatePoint(pointId, {
        adresse: parsed.data.adresse,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        nombrePersonnesEstime: parsed.data.nombrePersonnesEstime,
        typologie: parsed.data.typologie || '',
        niveauUrgence: parsed.data.niveauUrgence,
        statut: parsed.data.statut,
        besoins: parsed.data.besoins,
        commentaire: parsed.data.commentaire || '',
      })

      void logSecurityEvent({
        action: 'report.update.success',
        resource: 'points',
        outcome: 'success',
        details: { mode: 'edit', point_id: pointId },
      })

      navigate('/points')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise a jour du point.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="rounded-xl bg-white p-6 text-slate-600">Chargement du point...</div>
  }

  if (!point) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error || 'Point introuvable.'}
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
                          ? field.value.filter((item) => item !== besoin)
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
