import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getPointById, updatePoint, type Point } from '@/features/points/api/points'
import { pointUpdateSchema } from '@/features/security/model/schemas'
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
        onSubmit={handleSubmit}
        className="mt-6 space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Adresse ou lieu *</label>
          <input
            type="text"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Latitude *</label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Longitude *</label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
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
              value={nombrePersonnesEstime}
              onChange={(e) => setNombrePersonnesEstime(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Niveau d'urgence *</label>
            <select
              value={niveauUrgence}
              onChange={(e) =>
                setNiveauUrgence(
                  e.target.value as 'basse' | 'moyenne' | 'haute' | 'critique'
                )
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
              <option value="critique">Critique</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Statut *</label>
          <select
            value={statut}
            onChange={(e) =>
              setStatut(
                e.target.value as
                  | 'signale'
                  | 'a_confirmer'
                  | 'confirme'
                  | 'actif'
                  | 'inactif'
                  | 'archive'
              )
            }
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="signale">Signalé</option>
            <option value="a_confirmer">À confirmer</option>
            <option value="confirme">Confirmé</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="archive">Archivé</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Besoins observés *</label>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {besoinOptions.map((besoin) => (
              <label
                key={besoin}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${
                  besoins.includes(besoin)
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={besoins.includes(besoin)}
                  onChange={() => toggleBesoin(besoin)}
                  className="mr-2"
                />
                {besoin}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Typologie</label>
          <input
            type="text"
            value={typologie}
            onChange={(e) => setTypologie(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Commentaire</label>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Mise a jour...' : 'Mettre a jour'}
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
