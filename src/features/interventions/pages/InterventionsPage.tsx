
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  getInterventions,
  type Intervention,
} from '@/features/interventions/api/interventions'

import {
  isInterventionExpired,
  isUpcomingIntervention,
} from '@/features/interventions/utils/interventionDates'

type DateFilter = 'upcoming' | 'history' | 'all'

const LOCALES: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
}

function normalizeText(
  value: string | null | undefined
) {
  return value?.toLowerCase().trim() || ''
}

function formatDate(
  value: string | null,
  locale: string
) {
  if (!value) {
    return 'Date non renseignÃ©e'
  }

  const [year, month, day] = value.split('-').map(Number)

  const date = new Date(year, month - 1, day)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatTimeRange(
  start: string | null,
  end: string | null
) {
  if (!start && !end) {
    return 'Horaire non renseignÃ©'
  }

  if (start && end) {
    return `${start} - ${end}`
  }

  return start || end || 'Horaire non renseignÃ©'
}

function formatAidType(value: string | null) {
  return value?.trim() || 'Intervention'
}

function getEffectiveStatus(
  intervention: Intervention,
  now: Date
) {
  if (
    intervention.statut === 'annulee'
  ) {
    return 'annulee'
  }

  if (
    intervention.statut === 'terminee' 
  ) {
    return 'terminee'
  }

  if (isInterventionExpired(intervention, now)) {
    return 'expiree'
  }

  return intervention.statut || 'non_renseigne'
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'prevue':
      return 'PrÃ©vue'
    case 'en_cours':
      return 'En cours'
    case 'declaree':
      return 'DÃ©clarÃ©e'
    case 'terminee':
    case 'realisee':
      return 'TerminÃ©e'
    case 'annulee':
      return 'AnnulÃ©e'
    case 'expiree':
      return 'Date passÃ©e'
    default:
      return 'Non renseignÃ©'
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case 'prevue':
      return 'bg-blue-50 text-blue-700 ring-blue-200'

    case 'en_cours':
      return 'bg-orange-50 text-orange-700 ring-orange-200'

    case 'terminee':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200'

    case 'annulee':
      return 'bg-red-50 text-red-700 ring-red-200'

    case 'expiree':
      return 'bg-amber-50 text-amber-700 ring-amber-200'

    default:
      return 'bg-slate-100 text-slate-700 ring-slate-200'
  }
}

function isHistoryIntervention(
  intervention: Intervention,
  now: Date
) {
  return (
    isInterventionExpired(intervention, now) ||
    intervention.statut === 'terminee' ||
    
    intervention.statut === 'annulee'
  )
}

export default function InterventionsPage() {
  const { t, i18n } = useTranslation()

  const language = (
    i18n.resolvedLanguage ||
    i18n.language ||
    'fr'
  )
    .toLowerCase()
    .split('-')[0]

  const locale = LOCALES[language] || 'fr-FR'

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] =
    useState<DateFilter>('upcoming')

  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    function refreshClock() {
      setNow(new Date())
    }

    const interval = window.setInterval(refreshClock, 60000)

    window.addEventListener('focus', refreshClock)
    document.addEventListener(
      'visibilitychange',
      refreshClock
    )

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refreshClock)
      document.removeEventListener(
        'visibilitychange',
        refreshClock
      )
    }
  }, [])

  const {
    data: interventions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['interventions'],
    queryFn: getInterventions,
    refetchOnWindowFocus: true,
  })

  const upcomingCount = useMemo(() => {
    return interventions.filter((intervention) =>
      isUpcomingIntervention(intervention, now)
    ).length
  }, [interventions, now])

  const historyCount = useMemo(() => {
    return interventions.filter((intervention) =>
      isHistoryIntervention(intervention, now)
    ).length
  }, [interventions, now])

  const filteredInterventions = useMemo(() => {
    const search = normalizeText(searchTerm)

    return interventions
      .filter((intervention) => {
        const effectiveStatus = getEffectiveStatus(
          intervention,
          now
        )

        const content = [
          intervention.type_aide,
          intervention.points?.adresse,
          intervention.association_nom,
          intervention.commentaire,
          intervention.statut,
          getStatusLabel(effectiveStatus),
          intervention.date_intervention,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        const matchesSearch =
          search.length === 0 ||
          content.includes(search)

        const matchesStatus =
          statusFilter === 'all' ||
          effectiveStatus === statusFilter

        const matchesDate =
          dateFilter === 'all' ||
          (dateFilter === 'upcoming'
            ? isUpcomingIntervention(intervention, now)
            : isHistoryIntervention(intervention, now))

        return (
          matchesSearch &&
          matchesStatus &&
          matchesDate
        )
      })
      .sort((a, b) => {
        const dateA =
          `${a.date_intervention || ''} ${a.heure_debut || ''}`

        const dateB =
          `${b.date_intervention || ''} ${b.heure_debut || ''}`

        return dateA.localeCompare(dateB)
      })
  }, [
    interventions,
    searchTerm,
    statusFilter,
    dateFilter,
    now,
  ])

  const totalRepas = filteredInterventions.reduce(
    (total, intervention) =>
      total + (intervention.nombre_repas ?? 0),
    0
  )

  const totalBenevoles = filteredInterventions.reduce(
    (total, intervention) =>
      total + (intervention.nombre_benevoles ?? 0),
    0
  )

  const pointsCouverts = new Set(
    filteredInterventions
      .map((intervention) => intervention.point_id)
      .filter(Boolean)
  ).size

  function resetFilters() {
    setSearchTerm('')
    setStatusFilter('all')
    setDateFilter('upcoming')
  }

  return (
    <div
      dir={i18n.dir()}
      className="min-h-[100dvh] min-w-0 overflow-x-hidden bg-[#faf8f4] px-4 py-6 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[1600px]">

        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
              {t(
                'interventions.fieldActions',
                'Actions terrain'
              )}
            </p>

            <h1 className="mt-2 break-words text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {t(
                'interventions.title',
                'Interventions'
              )}
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {t(
                'interventions.description',
                'Suivi des interventions dÃ©clarÃ©es par les associations : distributions, bÃ©nÃ©voles mobilisÃ©s et repas distribuÃ©s.'
              )}
            </p>
          </div>

          <Link
            to="/interventions/new"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-center text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
          >
            {t(
              'interventions.newIntervention',
              '+ Nouvelle intervention'
            )}
          </Link>
        </div>

        {/* FILTRE TEMPOREL */}

        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setDateFilter('upcoming')}
            className={`min-h-12 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
              dateFilter === 'upcoming'
                ? 'border-[#d94a0b] bg-[#d94a0b] text-white'
                : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            Ã€ venir ({upcomingCount})
          </button>

          <button
            type="button"
            onClick={() => setDateFilter('history')}
            className={`min-h-12 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
              dateFilter === 'history'
                ? 'border-[#d94a0b] bg-[#d94a0b] text-white'
                : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            Historique ({historyCount})
          </button>

          <button
            type="button"
            onClick={() => setDateFilter('all')}
            className={`min-h-12 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
              dateFilter === 'all'
                ? 'border-[#d94a0b] bg-[#d94a0b] text-white'
                : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            Toutes les interventions
          </button>
        </section>

        {/* STATISTIQUES */}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Interventions affichÃ©es
            </p>
            <p className="mt-3 text-4xl font-black text-slate-950">
              {filteredInterventions.length}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Selon les filtres sÃ©lectionnÃ©s
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              PrÃ©vues
            </p>
            <p className="mt-3 text-4xl font-black text-blue-700">
              {upcomingCount}
            </p>
            <p className="mt-2 text-sm text-blue-600">
              Interventions Ã  venir
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
              Repas
            </p>
            <p className="mt-3 text-4xl font-black text-emerald-700">
              {totalRepas}
            </p>
            <p className="mt-2 text-sm text-emerald-600">
              Total des interventions affichÃ©es
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-orange-200 bg-orange-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
              BÃ©nÃ©voles
            </p>
            <p className="mt-3 text-4xl font-black text-orange-700">
              {totalBenevoles}
            </p>
            <p className="mt-2 text-sm text-orange-600">
              Effectifs dÃ©clarÃ©s
            </p>
          </article>
        </section>

        {/* RECHERCHE ET FILTRES */}

        <section className="mb-6 rounded-[2rem] border border-[#eadfd6] bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 xl:grid-cols-[1fr_260px_auto] xl:items-end">
            <div className="min-w-0">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Rechercher une intervention
              </label>

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Type dâ€™aide, point, commentaire..."
                className="min-h-12 w-full min-w-0 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#d94a0b]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Statut
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
              >
                <option value="all">Tous les statuts</option>
                <option value="prevue">PrÃ©vue</option>
                <option value="en_cours">En cours</option>
                <option value="declaree">DÃ©clarÃ©e</option>
                <option value="terminee">TerminÃ©e</option>
                <option value="expiree">Date passÃ©e</option>
                <option value="annulee">AnnulÃ©e</option>
                <option value="non_renseigne">
                  Non renseignÃ©
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="min-h-12 rounded-2xl border border-slate-300 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700"
            >
              RÃ©initialiser
            </button>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            {filteredInterventions.length} intervention(s)
            affichÃ©e(s) â€¢ {pointsCouverts} point(s)
            couvert(s)
          </p>
        </section>

        {/* CHARGEMENT */}

        {isLoading && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-600">
            Chargement des interventions...
          </div>
        )}

        {isError && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700">
            {(error as Error)?.message ||
              'Erreur lors du chargement des interventions.'}
          </div>
        )}

        {!isLoading &&
          !isError &&
          filteredInterventions.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <h2 className="text-xl font-black text-slate-950">
                Aucune intervention trouvÃ©e
              </h2>

              <p className="mt-3 text-sm text-slate-500">
                {dateFilter === 'upcoming'
                  ? 'Aucune intervention Ã  venir pour le moment.'
                  : 'Aucune intervention ne correspond aux filtres.'}
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 min-h-11 rounded-xl bg-[#d94a0b] px-5 text-sm font-bold text-white"
              >
                RÃ©initialiser les filtres
              </button>
            </div>
          )}

        {/* LISTE DES INTERVENTIONS */}

        {!isLoading &&
          !isError &&
          filteredInterventions.length > 0 && (
            <div className="grid gap-5">
              {filteredInterventions.map((intervention) => {
                const effectiveStatus = getEffectiveStatus(
                  intervention,
                  now
                )

                return (
                  <article
                    key={intervention.id}
                    className="min-w-0 rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="break-words text-xl font-black text-slate-950 sm:text-2xl">
                            {formatAidType(
                              intervention.type_aide
                            )}
                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusClass(
                              effectiveStatus
                            )}`}
                          >
                            {getStatusLabel(effectiveStatus)}
                          </span>
                        </div>

                        <p className="mt-3 break-words text-sm text-slate-600">
                          Point concernÃ© :{' '}
                          <span className="font-bold text-slate-700">
                            {intervention.points?.adresse ||
                              'Point non renseignÃ©'}
                          </span>
                        </p>

                        {intervention.association_nom && (
                          <p className="mt-2 text-sm text-slate-500">
                            Association :{' '}
                            {intervention.association_nom}
                          </p>
                        )}

                        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-bold uppercase text-slate-500">
                              Date
                            </p>
                            <p className="mt-2 font-black text-slate-950">
                              {formatDate(
                                intervention.date_intervention,
                                locale
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-bold uppercase text-slate-500">
                              Horaires
                            </p>
                            <p className="mt-2 font-black text-slate-950">
                              {formatTimeRange(
                                intervention.heure_debut,
                                intervention.heure_fin
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-emerald-50 p-4">
                            <p className="text-xs font-bold uppercase text-emerald-600">
                              Repas
                            </p>
                            <p className="mt-2 text-2xl font-black text-emerald-700">
                              {intervention.nombre_repas ?? 0}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-orange-50 p-4">
                            <p className="text-xs font-bold uppercase text-orange-600">
                              BÃ©nÃ©voles
                            </p>
                            <p className="mt-2 text-2xl font-black text-orange-700">
                              {intervention.nombre_benevoles ?? 0}
                            </p>
                          </div>
                        </div>

                        {intervention.commentaire?.trim() && (
                          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                            <p className="mb-2 text-sm font-bold text-slate-700">
                              Commentaire
                            </p>
                            <p className="break-words text-sm leading-relaxed text-slate-600">
                              {intervention.commentaire}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[190px]">
                        {intervention.point_id && (
                          <Link
                            to={`/points/${intervention.point_id}`}
                            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700"
                          >
                            Voir le point
                          </Link>
                        )}

                        <Link
                          to="/carte"
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#d94a0b] px-5 py-3 text-center text-sm font-bold text-white"
                        >
                          Voir sur la carte
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

      </div>
    </div>
  )
}

