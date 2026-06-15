import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPoints } from '@/features/points/api/points'
import { getInterventions } from '@/features/interventions/api/interventions'
import {
  formatPointLabel,
  getStatusBadgeClass,
  getUrgencyBadgeClass,
} from '@/shared/utils/pointStyles'

function formatDate(value: string | null) {
  if (!value) return 'Date non renseignée'

  return new Intl.DateTimeFormat('fr-FR').format(new Date(value))
}

function formatTimeRange(start: string | null, end: string | null) {
  if (!start && !end) return 'Horaire non renseigné'
  if (start && end) return `${start} à ${end}`
  return start || end || 'Horaire non renseigné'
}

export default function DashboardPage() {
  const {
    data: points = [],
    isLoading: isLoadingPoints,
    isError: isPointsError,
    error: pointsError,
  } = useQuery({
    queryKey: ['points'],
    queryFn: getPoints,
  })

  const {
    data: interventions = [],
    isLoading: isLoadingInterventions,
    isError: isInterventionsError,
    error: interventionsError,
  } = useQuery({
    queryKey: ['interventions'],
    queryFn: getInterventions,
  })

  const activePoints = points.filter((point) => point.actif !== false)
  const geolocatedPoints = activePoints.filter(
    (point) =>
      point.latitude !== null &&
      point.longitude !== null &&
      !(point.latitude === 0 && point.longitude === 0)
  )

  const urgentPoints = activePoints.filter(
    (point) =>
      point.niveau_urgence === 'critique' || point.niveau_urgence === 'haute'
  )

  const criticalPoints = activePoints.filter(
    (point) => point.niveau_urgence === 'critique'
  )

  const unverifiedPoints = activePoints.filter(
    (point) =>
      point.statut === 'signale' || point.niveau_fiabilite === 'non_verifie'
  )

  const estimatedPeopleCount = activePoints.reduce(
    (total, point) => total + (point.nombre_personnes_estime ?? 0),
    0
  )

  const mealsCount = interventions.reduce(
    (total, intervention) => total + (intervention.nombre_repas ?? 0),
    0
  )

  const volunteersCount = interventions.reduce(
    (total, intervention) => total + (intervention.nombre_benevoles ?? 0),
    0
  )

  const priorityPoints = urgentPoints.slice(0, 4)
  const latestInterventions = interventions.slice(0, 4)
  const latestPoints = points.slice(0, 6)

  const stats = [
    {
      label: 'Points actifs',
      value: activePoints.length,
      helper: `${geolocatedPoints.length} géolocalisé(s)`,
      tone: 'default',
    },
    {
      label: 'Points urgents',
      value: urgentPoints.length,
      helper: `${criticalPoints.length} critique(s)`,
      tone: 'red',
    },
    {
      label: 'Personnes estimées',
      value: estimatedPeopleCount,
      helper: 'Sur les points actifs',
      tone: 'green',
    },
    {
      label: 'Points non vérifiés',
      value: unverifiedPoints.length,
      helper: 'À confirmer sur le terrain',
      tone: 'orange',
    },
  ]

  const interventionStats = [
    {
      label: 'Interventions déclarées',
      value: interventions.length,
      helper: 'Actions terrain enregistrées',
    },
    {
      label: 'Repas distribués',
      value: mealsCount,
      helper: 'Total déclaré',
    },
    {
      label: 'Bénévoles mobilisés',
      value: volunteersCount,
      helper: 'Sur les interventions',
    },
  ]

  const isLoading = isLoadingPoints || isLoadingInterventions
  const isError = isPointsError || isInterventionsError

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto w-full max-w-[1720px]">
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Coordination
            </p>

            <h1 className="dashboard-title">Tableau de bord</h1>

            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Vue métier de coordination des points de précarité, des besoins
              prioritaires et des interventions terrain.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/points/new" className="dashboard-button-primary">
              + Nouveau point
            </Link>

            <Link
              to="/interventions/new"
              className="dashboard-button-secondary"
            >
              + Intervention
            </Link>
          </div>
        </div>

        {isLoading && (
          <div className="dashboard-card p-8 text-slate-600">
            Chargement du tableau de bord...
          </div>
        )}

        {isError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
            {(pointsError as Error)?.message ||
              (interventionsError as Error)?.message ||
              'Erreur lors du chargement du tableau de bord.'}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className={[
                    'rounded-3xl border p-6 shadow-sm',
                    stat.tone === 'red'
                      ? 'border-red-200 bg-red-50'
                      : stat.tone === 'green'
                        ? 'border-emerald-200 bg-emerald-50'
                        : stat.tone === 'orange'
                          ? 'border-orange-200 bg-orange-50'
                          : 'border-slate-200 bg-white',
                  ].join(' ')}
                >
                  <p className="text-sm font-semibold text-slate-600">
                    {stat.label}
                  </p>

                  <p
                    className={[
                      'mt-4 text-4xl font-black leading-none tracking-tight',
                      stat.tone === 'red'
                        ? 'text-red-600'
                        : stat.tone === 'green'
                          ? 'text-emerald-700'
                          : stat.tone === 'orange'
                            ? 'text-orange-700'
                            : 'text-slate-950',
                    ].join(' ')}
                  >
                    {stat.value}
                  </p>

                  <p className="mt-3 text-sm font-medium text-slate-500">
                    {stat.helper}
                  </p>
                </article>
              ))}
            </section>

            <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {interventionStats.map((stat) => (
                <article key={stat.label} className="dashboard-card p-6">
                  <p className="text-sm font-semibold text-slate-600">
                    {stat.label}
                  </p>

                  <p className="mt-4 text-4xl font-black leading-none tracking-tight text-slate-950">
                    {stat.value}
                  </p>

                  <p className="mt-3 text-sm font-medium text-slate-500">
                    {stat.helper}
                  </p>
                </article>
              ))}
            </section>

            <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1fr]">
              <article className="dashboard-card p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="dashboard-section-title">
                      Points prioritaires
                    </h2>
                    <p className="dashboard-muted mt-1">
                      Points critiques ou urgents à suivre rapidement.
                    </p>
                  </div>

                  <Link
                    to="/points"
                    className="shrink-0 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    Voir tous
                  </Link>
                </div>

                {priorityPoints.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    Aucun point prioritaire pour le moment.
                  </div>
                )}

                {priorityPoints.length > 0 && (
                  <div className="grid gap-3">
                    {priorityPoints.map((point) => (
                      <Link
                        key={point.id}
                        to={`/points/${point.id}`}
                        className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-orange-200 hover:bg-orange-50/40"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-bold text-slate-950">
                              {point.adresse || 'Adresse non renseignée'}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {point.nombre_personnes_estime ??
                                'Non renseigné'}{' '}
                              personne(s) estimée(s)
                            </p>
                          </div>

                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${getUrgencyBadgeClass(
                              point.niveau_urgence
                            )}`}
                          >
                            {formatPointLabel(point.niveau_urgence)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </article>

              <article className="dashboard-card p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="dashboard-section-title">
                      Dernières interventions
                    </h2>
                    <p className="dashboard-muted mt-1">
                      Historique récent des actions déclarées.
                    </p>
                  </div>

                  <Link
                    to="/interventions"
                    className="shrink-0 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    Voir toutes
                  </Link>
                </div>

                {latestInterventions.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    Aucune intervention déclarée pour le moment.
                  </div>
                )}

                {latestInterventions.length > 0 && (
                  <div className="grid gap-3">
                    {latestInterventions.map((intervention) => (
                      <article
                        key={intervention.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-bold text-slate-950">
                              {intervention.type_aide || 'Intervention'}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {intervention.points?.adresse ||
                                'Point non renseigné'}
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-600">
                              {formatDate(intervention.date_intervention)} —{' '}
                              {formatTimeRange(
                                intervention.heure_debut,
                                intervention.heure_fin
                              )}
                            </p>
                          </div>

                          <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 ring-1 ring-indigo-100">
                            {intervention.statut || 'Non renseigné'}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </article>
            </section>

            <section className="mt-6 dashboard-card p-6">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="dashboard-section-title">
                    Derniers points signalés
                  </h2>
                  <p className="dashboard-muted mt-1">
                    Les derniers signalements enregistrés dans la plateforme.
                  </p>
                </div>

                <Link
                  to="/points"
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Voir tous
                </Link>
              </div>

              {latestPoints.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  Aucun point signalé pour le moment.
                </div>
              )}

              {latestPoints.length > 0 && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                  {latestPoints.map((point) => (
                    <Link
                      key={point.id}
                      to={`/points/${point.id}`}
                      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-orange-200 hover:bg-orange-50/40"
                    >
                      <h3 className="font-bold text-slate-950">
                        {point.adresse || 'Adresse non renseignée'}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        {point.besoins || 'Besoins non renseignés'}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusBadgeClass(
                            point.statut
                          )}`}
                        >
                          {formatPointLabel(point.statut)}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getUrgencyBadgeClass(
                            point.niveau_urgence
                          )}`}
                        >
                          {formatPointLabel(point.niveau_urgence)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}