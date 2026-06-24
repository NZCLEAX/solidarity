import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { usePermissions } from '@/features/auth/hooks/usePermissions'
import { createPoint } from '@/features/points/api/points'
import { pointSubmissionSchema } from '@/features/security/model/schemas'
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

  const [adresse, setAdresse] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [nombrePersonnesEstime, setNombrePersonnesEstime] = useState('')
  const [typologie, setTypologie] = useState('')
  const [niveauUrgence, setNiveauUrgence] = useState<'basse' | 'moyenne' | 'haute' | 'critique'>('moyenne')
  const [besoins, setBesoins] = useState<string[]>([])
  const [commentaire, setCommentaire] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
    setLoading(true)

    if (!canCreateReport) {
      setError('Votre role ne peut pas creer de signalement.')
      void logSecurityEvent({
        action: 'report.create.attempt',
        resource: 'points',
        outcome: 'denied',
        details: { reason: 'role_not_allowed' },
      })
      setLoading(false)
      return
    }

    const parsed = pointSubmissionSchema.safeParse({
      adresse,
      latitude: Number(latitude),
      longitude: Number(longitude),
      nombrePersonnesEstime: Number(nombrePersonnesEstime),
      typologie,
      niveauUrgence,
      besoins,
      commentaire,
    })

    if (!parsed.success) {
      const errorMessage = parsed.error.issues[0]?.message ?? 'Signalement invalide'
      setError(errorMessage)
      void logSecurityEvent({
        action: 'report.create.validation_failed',
        resource: 'points',
        outcome: 'failure',
        details: { error: errorMessage },
      })
      setLoading(false)
      return
    }

    try {
      await createPoint({
        adresse: parsed.data.adresse,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        nombrePersonnesEstime: parsed.data.nombrePersonnesEstime,
        typologie: parsed.data.typologie || '',
        niveauUrgence: parsed.data.niveauUrgence,
        besoins: parsed.data.besoins,
        commentaire: parsed.data.commentaire || '',
      })

      void logSecurityEvent({
        action: 'report.create.success',
        resource: 'points',
        outcome: 'success',
        details: { message_length: parsed.data.commentaire?.length ?? 0 },
      })

      navigate('/points')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la creation du point.')
    } finally {
      setLoading(false)
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
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Adresse ou lieu *</label>
          <input
            type="text"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            placeholder="Ex : Gare du Nord, Paris 10e"
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
              placeholder="48.8809"
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
              placeholder="2.3553"
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
              placeholder="Ex : 20"
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
            placeholder="Ex : familles, hommes seuls, migrants..."
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Commentaire</label>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Observations complémentaires..."
            rows={4}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !canCreateReport}
            className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Creation...' : 'Créer le point'}
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
