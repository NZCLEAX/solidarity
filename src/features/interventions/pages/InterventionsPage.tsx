import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getInterventions } from '@/features/interventions/api/interventions'

function formatDate(value: string | null) {
  if (!value) return 'Non renseignée'
  return new Date(value).toLocaleDateString('fr-FR')
}

function formatTime(value: string | null) {
  if (!value) return '--:--'
  return value.slice(0, 5)
}

function formatStatut(value: string | null) {
  if (!value) return 'Déclarée'

  const labels: Record<string, string> = {
    declaree: 'Déclarée',
    planifiee: 'Planifiée',
    en_cours: 'En cours',
    terminee: 'Terminée',
    annulee: 'Annulée',
  }

  return labels[value] || value
}

export default function InterventionsPage() {
  const {
    data: interventions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['interventions'],
    queryFn: getInterventions,
  })

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Interventions
          </h1>
          <p className="mt-2 text-slate-600">
            Liste des interventions déclarées par les associations.
          </p>
        </div>

        <Link
          to="/interventions/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Nouvelle intervention
        </Link>
      </div>

      {isLoading && (
        <div className="rounded-xl bg-white p-6 text-slate-600">
          Chargement des interventions...
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {(error as Error).message ||
            'Erreur lors du chargement des interventions.'}
        </div>
      )}

      {!isLoading && !isError && interventions.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-slate-500">
          Aucune intervention déclarée pour le moment.
        </div>
      )}

      {!isLoading && !isError && interventions.length > 0 && (
        <div className="grid gap-4">
          {interventions.map((intervention) => (
            <article
              key={intervention.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    {intervention.type_aide || 'Intervention'}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Point concerné :{' '}
                    {intervention.points?.adresse || 'Point non renseigné'}
                  </p>
                </div>

                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  {formatStatut(intervention.statut)}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">Date</p>
                  <p className="mt-1 font-semibold">
                    {formatDate(intervention.date_intervention)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">
                    Horaires
                  </p>
                  <p className="mt-1 font-semibold">
                    {formatTime(intervention.heure_debut)} -{' '}
                    {formatTime(intervention.heure_fin)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">Repas</p>
                  <p className="mt-1 font-semibold">
                    {intervention.nombre_repas ?? 'Non renseigné'}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">
                    Bénévoles
                  </p>
                  <p className="mt-1 font-semibold">
                    {intervention.nombre_benevoles ?? 'Non renseigné'}
                  </p>
                </div>
              </div>

              {intervention.commentaire &&
                intervention.commentaire.trim().length > 0 && (
                  <p className="mt-4 text-sm text-slate-700">
                    <span className="font-medium">Commentaire :</span>{' '}
                    {intervention.commentaire}
                  </p>
                )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}