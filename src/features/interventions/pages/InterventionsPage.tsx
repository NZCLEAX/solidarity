
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  deleteIntervention,
  getInterventions,
  type Intervention,
} from '@/features/interventions/api/interventions'

import { getCurrentProfile } from '@/features/auth/api/profile'

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

function getDateParts(
  value: string | null,
  locale: string
) {
  if (!value) {
    return { day: '–', month: '' }
  }

  const [year, month, day] = value.split('-').map(Number)

  const date = new Date(year, month - 1, day)

  if (Number.isNaN(date.getTime())) {
    return { day: value, month: '' }
  }

  return {
    day: String(date.getDate()),
    month: new Intl.DateTimeFormat(locale, { month: 'short' })
      .format(date)
      .replace('.', ''),
  }
}

// « 10:00:00 » → « 10:00 »
function shortTime(value: string | null) {
  return value ? value.slice(0, 5) : ''
}

function formatTimeRange(
  start: string | null,
  end: string | null
) {
  if (!start && !end) {
    return 'Horaire non renseigné'
  }

  if (start && end) {
    return `${shortTime(start)} – ${shortTime(end)}`
  }

  return shortTime(start || end) || 'Horaire non renseigné'
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
      return 'Prévue'
    case 'en_cours':
      return 'En cours'
    case 'declaree':
      return 'Déclarée'
    case 'terminee':
    case 'realisee':
      return 'Terminée'
    case 'annulee':
      return 'Annulée'
    case 'expiree':
      return 'Date passée'
    default:
      return 'Non renseigné'
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case 'prevue':
      return 'text-blue-600'

    case 'en_cours':
      return 'text-orange-600'

    case 'terminee':
      return 'text-emerald-600'

    case 'annulee':
      return 'text-red-600'

    case 'expiree':
      return 'text-amber-600'

    default:
      return 'text-slate-500'
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

  const queryClient = useQueryClient()

  const { data: profile } = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteIntervention,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['interventions'],
      })
    },
    onError: (error) => {
      window.alert(
        (error as Error)?.message ||
          "Impossible de supprimer l'intervention."
      )
    },
  })

  // Admin / modérateur, ou l'association qui a déclaré l'intervention.
  function canManageIntervention(intervention: Intervention) {
    if (
      profile?.role === 'admin' ||
      profile?.role === 'moderateur'
    ) {
      return true
    }

    return (
      profile?.role === 'association' &&
      Boolean(profile.association_id) &&
      profile.association_id === intervention.association_id
    )
  }

  function handleDeleteIntervention(intervention: Intervention) {
    if (
      !window.confirm(
        'Supprimer définitivement cette intervention ?'
      )
    ) {
      return
    }

    deleteMutation.mutate(intervention.id)
  }

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

  const tabs: Array<{ value: DateFilter; label: string }> = [
    { value: 'upcoming', label: `À venir (${upcomingCount})` },
    { value: 'history', label: `Historique (${historyCount})` },
    { value: 'all', label: 'Toutes' },
  ]

  return (
    <div
      dir={i18n.dir()}
      className="min-w-0 overflow-x-hidden px-4 pb-10 pt-6"
    >
      <div className="mx-auto w-full max-w-3xl">

        {/* EN-TÊTE */}

        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-950">
            {t(
              'interventions.title',
              'Interventions'
            )}
          </h1>

          <Link
            to="/interventions/new"
            className="inline-flex shrink-0 items-center rounded-lg bg-[#d94a0b] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#b93607]"
          >
            {t(
              'interventions.newIntervention',
              '+ Nouvelle intervention'
            )}
          </Link>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          {t(
            'interventions.description',
            'Suivi des interventions déclarées par les associations : distributions, bénévoles mobilisés et repas distribués.'
          )}
        </p>

        {/* FILTRE TEMPOREL */}

        <div className="mt-5 grid grid-cols-3 rounded-lg border border-slate-300 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setDateFilter(tab.value)}
              className={`rounded-md py-2 text-sm font-medium transition ${
                dateFilter === tab.value
                  ? 'bg-slate-100 text-slate-950'
                  : 'text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* RECHERCHE ET FILTRES */}

        <div className="mt-3 flex gap-2">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            aria-label="Rechercher une intervention"
            placeholder="Rechercher : type d’aide, point, commentaire…"
            className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#d94a0b]"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            aria-label="Statut"
            className="min-h-11 w-36 shrink-0 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900"
          >
            <option value="all">Tous les statuts</option>
            <option value="prevue">Prévue</option>
            <option value="en_cours">En cours</option>
            <option value="declaree">Déclarée</option>
            <option value="terminee">Terminée</option>
            <option value="expiree">Date passée</option>
            <option value="annulee">Annulée</option>
            <option value="non_renseigne">
              Non renseigné
            </option>
          </select>
        </div>

        {/* RÉSUMÉ */}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-y border-slate-200 py-2 text-sm text-slate-600">
          <span>
            {filteredInterventions.length} affichée(s) ·{' '}
            {upcomingCount} prévue(s) · {totalRepas} repas ·{' '}
            {totalBenevoles} bénévole(s) · {pointsCouverts}{' '}
            point(s) couvert(s)
          </span>

          {(searchTerm ||
            statusFilter !== 'all' ||
            dateFilter !== 'upcoming') && (
            <button
              type="button"
              onClick={resetFilters}
              className="font-medium text-[#d94a0b]"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* CHARGEMENT */}

        {isLoading && (
          <p className="mt-6 text-sm text-slate-500">
            Chargement des interventions...
          </p>
        )}

        {isError && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {(error as Error)?.message ||
              'Erreur lors du chargement des interventions.'}
          </div>
        )}

        {!isLoading &&
          !isError &&
          filteredInterventions.length === 0 && (
            <div className="mt-8 text-center">
              <p className="font-semibold text-slate-950">
                Aucune intervention trouvée
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {dateFilter === 'upcoming'
                  ? 'Aucune intervention à venir pour le moment.'
                  : 'Aucune intervention ne correspond aux filtres.'}
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 text-sm font-semibold text-[#d94a0b]"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

        {/* LISTE DES INTERVENTIONS (AGENDA) */}

        {!isLoading &&
          !isError &&
          filteredInterventions.length > 0 && (
            <div className="mt-4 space-y-3">
              {filteredInterventions.map((intervention) => {
                const effectiveStatus = getEffectiveStatus(
                  intervention,
                  now
                )

                const dateParts = getDateParts(
                  intervention.date_intervention,
                  locale
                )

                const canManage =
                  canManageIntervention(intervention)

                const meta = [
                  intervention.association_nom,
                  `${intervention.nombre_repas ?? 0} repas`,
                  `${intervention.nombre_benevoles ?? 0} bénévole${
                    (intervention.nombre_benevoles ?? 0) > 1
                      ? 's'
                      : ''
                  }`,
                ]
                  .filter(Boolean)
                  .join(' · ')

                return (
                  <article
                    key={intervention.id}
                    className="flex min-w-0 gap-4 rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="w-12 shrink-0 text-center">
                      <p className="text-2xl font-bold leading-none text-slate-950">
                        {dateParts.day}
                      </p>

                      <p className="mt-1 text-xs uppercase text-slate-500">
                        {dateParts.month}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="break-words font-semibold text-slate-950">
                          {formatAidType(
                            intervention.type_aide
                          )}
                        </h2>

                        <span
                          className={`shrink-0 text-xs font-medium ${getStatusClass(
                            effectiveStatus
                          )}`}
                        >
                          ● {getStatusLabel(effectiveStatus)}
                        </span>
                      </div>

                      <p className="mt-1 break-words text-sm text-slate-600">
                        {formatTimeRange(
                          intervention.heure_debut,
                          intervention.heure_fin
                        )}{' '}
                        ·{' '}
                        {intervention.points?.adresse ||
                          'Point non renseigné'}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {meta}
                      </p>

                      {intervention.commentaire && (
                        <p className="mt-2 break-words text-sm italic text-slate-500">
                          « {intervention.commentaire} »
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 whitespace-nowrap text-sm font-semibold">
                        <Link
                          to="/carte"
                          className="text-[#d94a0b]"
                        >
                          Voir sur la carte
                        </Link>

                        {intervention.point_id && (
                          <Link
                            to={`/points/${intervention.point_id}`}
                            className="text-slate-600"
                          >
                            Voir le point
                          </Link>
                        )}

                        {canManage && (
                          <Link
                            to={`/interventions/${intervention.id}/edit`}
                            className="text-slate-600"
                          >
                            Modifier
                          </Link>
                        )}

                        {canManage && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteIntervention(intervention)
                            }
                            disabled={deleteMutation.isPending}
                            className="ml-auto text-red-600 disabled:opacity-50"
                          >
                            {deleteMutation.isPending &&
                            deleteMutation.variables === intervention.id
                              ? 'Suppression...'
                              : 'Supprimer'}
                          </button>
                        )}
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
