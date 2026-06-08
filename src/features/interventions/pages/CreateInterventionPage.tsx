import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPoints } from '@/features/points/api/points'
import { createIntervention } from '@/features/interventions/api/interventions'

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

  const { data: points = [], isLoading: pointsLoading } = useQuery({
    queryKey: ['points'],
    queryFn: getPoints,
  })

  const [pointId, setPointId] = useState('')
  const [dateIntervention, setDateIntervention] = useState('')
  const [heureDebut, setHeureDebut] = useState('')
  const [heureFin, setHeureFin] = useState('')
  const [typeAide, setTypeAide] = useState('Distribution de repas')
  const [nombreRepas, setNombreRepas] = useState('')
  const [nombreBenevoles, setNombreBenevoles] = useState('')
  const [commentaire, setCommentaire] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    if (!pointId) {
      setError('Sélectionne un point concerné par l’intervention.')
      setLoading(false)
      return
    }

    if (!dateIntervention) {
      setError('La date d’intervention est obligatoire.')
      setLoading(false)
      return
    }

    if (!heureDebut || !heureFin) {
      setError('Les heures de début et de fin sont obligatoires.')
      setLoading(false)
      return
    }

    if (heureFin <= heureDebut) {
      setError('L’heure de fin doit être après l’heure de début.')
      setLoading(false)
      return
    }

    const parsedNombreRepas = Number(nombreRepas)
    const parsedNombreBenevoles = Number(nombreBenevoles)

    if (Number.isNaN(parsedNombreRepas) || parsedNombreRepas < 0) {
      setError('Le nombre de repas doit être valide.')
      setLoading(false)
      return
    }

    if (Number.isNaN(parsedNombreBenevoles) || parsedNombreBenevoles <= 0) {
      setError('Le nombre de bénévoles doit être supérieur à 0.')
      setLoading(false)
      return
    }

    try {
      await createIntervention({
        pointId,
        dateIntervention,
        heureDebut,
        heureFin,
        typeAide,
        nombreRepas: parsedNombreRepas,
        nombreBenevoles: parsedNombreBenevoles,
        commentaire,
      })

      navigate('/interventions')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la déclaration de l’intervention.')
    } finally {
      setLoading(false)
    }
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

      <h1 className="text-3xl font-bold text-slate-950">
        Déclarer une intervention
      </h1>
      <p className="mt-2 text-slate-600">
        Renseigne les informations de l’intervention réalisée sur un point.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Point concerné *
          </label>

          <select
            value={pointId}
            onChange={(event) => setPointId(event.target.value)}
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
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Date *
            </label>
            <input
              type="date"
              value={dateIntervention}
              onChange={(event) => setDateIntervention(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Heure de début *
            </label>
            <input
              type="time"
              value={heureDebut}
              onChange={(event) => setHeureDebut(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Heure de fin *
            </label>
            <input
              type="time"
              value={heureFin}
              onChange={(event) => setHeureFin(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Type d’aide *
          </label>

          <select
            value={typeAide}
            onChange={(event) => setTypeAide(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            {typeAideOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nombre de repas *
            </label>
            <input
              type="number"
              min="0"
              value={nombreRepas}
              onChange={(event) => setNombreRepas(event.target.value)}
              placeholder="Ex : 80"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Nombre de bénévoles *
            </label>
            <input
              type="number"
              min="1"
              value={nombreBenevoles}
              onChange={(event) => setNombreBenevoles(event.target.value)}
              placeholder="Ex : 6"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Commentaire
          </label>
          <textarea
            value={commentaire}
            onChange={(event) => setCommentaire(event.target.value)}
            rows={4}
            placeholder="Informations complémentaires..."
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Déclaration...' : 'Déclarer l’intervention'}
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