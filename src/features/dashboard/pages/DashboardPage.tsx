import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPoints } from '@/features/points/api/points'
import { getInterventions } from '@/features/interventions/api/interventions'
import { formatDate, formatLabel, formatTime } from '../../../utils/formatters'

export default function DashboardPage() {
  const {
    data: points = [],
    isLoading: pointsLoading,
    isError: pointsError,
    error: pointsErrorDetails,
  } = useQuery({
    queryKey: ['points'],
    queryFn: getPoints,
  })

  const {
    data: interventions = [],
    isLoading: interventionsLoading,
    isError: interventionsError,
    error: interventionsErrorDetails,
  } = useQuery({
    queryKey: ['interventions'],
    queryFn: getInterventions,
  })

  const isLoading = pointsLoading || interventionsLoading
  const hasError = pointsError || interventionsError

  const stats = useMemo(() => {
    const pointsActifs = points.filter((point) => point.actif !== false)

    const pointsUrgents = pointsActifs.filter(
      (point) =>
        point.niveau_urgence === 'haute' || point.niveau_urgence === 'critique'
    )

    const pointsCritiques = pointsActifs.filter(
      (point) => point.niveau_urgence === 'critique'
    )

    const pointsNonVerifies = pointsActifs.filter(
      (point) => point.niveau_fiabilite === 'non_verifie'
    )

    const pointsGeolocalises = pointsActifs.filter((point) => {
      const latitude = Number(point.latitude)
      const longitude = Number(point.longitude)

      return (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        !(latitude === 0 && longitude === 0)
      )
    })

    const totalPersonnesEstimees = pointsActifs.reduce(
      (total, point) => total + (point.nombre_personnes_estime || 0),
      0
    )

    const totalRepas = interventions.reduce(
      (total, intervention) => total + (intervention.nombre_repas || 0),
      0
    )

    const totalBenevoles = interventions.reduce(
      (total, intervention) => total + (intervention.nombre_benevoles || 0),
      0
    )

    const derniersPoints = [...pointsActifs]
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 4)

    const dernieresInterventions = [...interventions]
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 4)

    const pointsPrioritaires = [...pointsActifs]
      .filter(
        (point) =>
          point.niveau_urgence === 'haute' || point.niveau_urgence === 'critique'
      )
      .slice(0, 4)

    return { pointsActifs, pointsUrgents, pointsCritiques, pointsNonVerifies, pointsGeolocalises, totalPersonnesEstimees, totalRepas, totalBenevoles, derniersPoints, dernieresInterventions, pointsPrioritaires }

  }, [points, interventions])

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-6 text-slate-600">
        Chargement du tableau de bord...
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {(pointsErrorDetails as Error)?.message ||
          (interventionsErrorDetails as Error)?.message ||
          'Erreur lors du chargement du tableau de bord.'}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Tableau de bord
          </h1>
          <p className="mt-2 text-slate-600">
            Vue métier de coordination des points et interventions.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/points/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Nouveau point
          </Link>

          <Link
            to="/interventions/new"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            + Intervention
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Points actifs</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {stats.pointsActifs.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {stats.pointsGeolocalises.length} géolocalisé(s)
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Points urgents</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {stats.pointsUrgents.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {stats.pointsCritiques.length} critique(s)
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Personnes estimées</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {stats.totalPersonnesEstimees}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Sur les points actifs
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Points non vérifiés</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {stats.pointsNonVerifies.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            À confirmer sur le terrain
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Interventions déclarées</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {stats.dernieresInterventions.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Repas distribués</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {stats.totalRepas}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Bénévoles mobilisés</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {stats.totalBenevoles}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">
              Points prioritaires
            </h2>

            <Link
              to="/points"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Voir tous
            </Link>
          </div>

          {stats.pointsPrioritaires.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Aucun point prioritaire pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.pointsPrioritaires.map((point) => (
                <Link
                  key={point.id}
                  to={`/points/${point.id}`}
                  className="block rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {point.adresse || 'Adresse non renseignée'}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {point.nombre_personnes_estime ?? 'Non renseigné'} personne(s)
                        estimée(s)
                      </p>
                    </div>

                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                      {formatLabel(point.niveau_urgence)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">
              Dernières interventions
            </h2>

            <Link
              to="/interventions"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Voir toutes
            </Link>
          </div>

          {stats.dernieresInterventions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Aucune intervention déclarée pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.dernieresInterventions.map((intervention) => (
                <article
                  key={intervention.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {intervention.type_aide || 'Intervention'}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {intervention.points?.adresse ||
                          'Point non renseigné'}
                      </p>
                    </div>

                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                      {formatLabel(intervention.statut)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">
                    {formatDate(intervention.date_intervention)} —{' '}
                    {formatTime(intervention.heure_debut)} à{' '}
                    {formatTime(intervention.heure_fin)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">
          Derniers points signalés
        </h2>

        {stats.derniersPoints.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            Aucun point signalé pour le moment.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {stats.derniersPoints.map((point) => (
              <Link
                key={point.id}
                to={`/points/${point.id}`}
                className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
              >
                <p className="font-semibold text-slate-950">
                  {point.adresse || 'Adresse non renseignée'}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {point.besoins || 'Besoins non renseignés'}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-700">
                    {formatLabel(point.statut)}
                  </span>

                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                    {formatLabel(point.niveau_urgence)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}