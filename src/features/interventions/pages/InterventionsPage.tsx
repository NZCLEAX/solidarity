import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { getInterventions } from '@/features/interventions/api/interventions'

const LOCALES: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
  ar: 'ar',
}

function normalizeText(
  value: string | null | undefined
) {
  return value?.toLowerCase().trim() || ''
}

function getStatusClass(value: string | null) {
  switch (value) {
    case 'prevue':
      return 'bg-blue-50 text-blue-700 ring-blue-200'

    case 'declaree':
      return 'bg-indigo-50 text-indigo-700 ring-indigo-200'

    case 'realisee':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200'

    case 'annulee':
      return 'bg-red-50 text-red-700 ring-red-200'

    default:
      return 'bg-slate-50 text-slate-700 ring-slate-200'
  }
}

export default function InterventionsPage() {
  const { t, i18n } = useTranslation()

  const language = (
    i18n.resolvedLanguage ??
    i18n.language ??
    'fr'
  )
    .toLowerCase()
    .split('-')[0]

  const locale =
    LOCALES[language] ?? 'fr-FR'

  const [searchTerm, setSearchTerm] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState('all')

  const {
    data: interventions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['interventions'],
    queryFn: getInterventions,
  })

  function formatDate(
    value: string | null
  ) {
    if (!value) {
      return t(
        'interventions.dateNotProvided',
        'Date non renseignée'
      )
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return new Intl.DateTimeFormat(
      locale,
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    ).format(date)
  }

  function formatTimeRange(
    start: string | null,
    end: string | null
  ) {
    if (!start && !end) {
      return t(
        'interventions.timeNotProvided',
        'Horaire non renseigné'
      )
    }

    if (start && end) {
      return `${start} - ${end}`
    }

    return (
      start ||
      end ||
      t(
        'interventions.timeNotProvided',
        'Horaire non renseigné'
      )
    )
  }

  function formatStatus(
    value: string | null
  ) {
    switch (value) {
      case 'prevue':
        return t(
          'interventions.statusPlanned',
          'Prévue'
        )

      case 'declaree':
        return t(
          'interventions.statusDeclared',
          'Déclarée'
        )

      case 'realisee':
        return t(
          'interventions.statusCompleted',
          'Réalisée'
        )

      case 'annulee':
        return t(
          'interventions.statusCancelled',
          'Annulée'
        )

      default:
        return (
          value ||
          t(
            'interventions.notProvided',
            'Non renseigné'
          )
        )
    }
  }

  function formatAidType(
    value: string | null | undefined
  ) {
    switch (value) {
      case 'Distribution de repas':
        return t(
          'interventions.aidMeals',
          'Distribution de repas'
        )

      case "Distribution d'eau":
        return t(
          'interventions.aidWater',
          "Distribution d'eau"
        )

      case 'Distribution de vêtements':
        return t(
          'interventions.aidClothing',
          'Distribution de vêtements'
        )

      case 'Maraude':
        return t(
          'interventions.aidOutreach',
          'Maraude'
        )

      case 'Soins':
        return t(
          'interventions.aidCare',
          'Soins'
        )

      case 'Accompagnement social':
        return t(
          'interventions.aidSocialSupport',
          'Accompagnement social'
        )

      case 'Autre':
        return t(
          'interventions.aidOther',
          'Autre'
        )

      default:
        return (
          value ||
          t(
            'interventions.intervention',
            'Intervention'
          )
        )
    }
  }

  const filteredInterventions =
    useMemo(() => {
      const search =
        normalizeText(searchTerm)

      return interventions.filter(
        (intervention) => {
          const pointAddress =
            intervention.points?.adresse ||
            ''

          const translatedAid =
            formatAidType(
              intervention.type_aide
            )

          const translatedStatus =
            formatStatus(
              intervention.statut
            )

          const content = [
            intervention.type_aide,
            translatedAid,
            pointAddress,
            intervention.commentaire,
            intervention.statut,
            translatedStatus,
            intervention.date_intervention,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          const matchesSearch =
            search.length === 0 ||
            content.includes(search)

          const normalizedStatus =
            intervention.statut ||
            'non_renseigne'

          const matchesStatus =
            statusFilter === 'all' ||
            normalizedStatus ===
              statusFilter

          return (
            matchesSearch &&
            matchesStatus
          )
        }
      )
    }, [
      interventions,
      searchTerm,
      statusFilter,
      i18n.resolvedLanguage,
      i18n.language,
    ])

  const totalRepas =
    filteredInterventions.reduce(
      (total, intervention) =>
        total +
        (intervention.nombre_repas ??
          0),
      0
    )

  const totalBenevoles =
    filteredInterventions.reduce(
      (total, intervention) =>
        total +
        (intervention.nombre_benevoles ??
          0),
      0
    )

  const pointsCouverts = new Set(
    filteredInterventions
      .map(
        (intervention) =>
          intervention.point_id
      )
      .filter(Boolean)
  ).size

  const upcomingCount =
    filteredInterventions.filter(
      (intervention) =>
        intervention.statut === 'prevue'
    ).length

  function resetFilters() {
    setSearchTerm('')
    setStatusFilter('all')
  }

  return (
    <div
      dir={i18n.dir()}
      className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-6 sm:px-6 lg:px-8 xl:px-10"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
              {t(
                'interventions.fieldActions',
                'Actions terrain'
              )}
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl xl:text-5xl">
              {t(
                'interventions.title',
                'Interventions'
              )}
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {t(
                'interventions.description',
                'Suivi des interventions déclarées par les associations : distributions, bénévoles mobilisés et repas distribués.'
              )}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/interventions/new"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700"
            >
              {t(
                'interventions.newIntervention',
                '+ Nouvelle intervention'
              )}
            </Link>
          </div>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {t(
                'interventions.title',
                'Interventions'
              )}
            </p>

            <p className="mt-3 text-4xl font-black text-slate-950">
              {filteredInterventions.length}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              {t(
                'interventions.actionsDisplayed',
                'Action(s) affichée(s)'
              )}
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              {t(
                'interventions.planned',
                'Prévues'
              )}
            </p>

            <p className="mt-3 text-4xl font-black text-blue-700">
              {upcomingCount}
            </p>

            <p className="mt-2 text-sm font-medium text-blue-600">
              {t(
                'interventions.toOrganize',
                'À organiser'
              )}
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
              {t(
                'interventions.mealsDistributed',
                'Repas distribués'
              )}
            </p>

            <p className="mt-3 text-4xl font-black text-emerald-700">
              {totalRepas}
            </p>

            <p className="mt-2 text-sm font-medium text-emerald-600">
              {t(
                'interventions.totalDeclared',
                'Total déclaré'
              )}
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-orange-200 bg-orange-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
              {t(
                'interventions.volunteers',
                'Bénévoles'
              )}
            </p>

            <p className="mt-3 text-4xl font-black text-orange-700">
              {totalBenevoles}
            </p>

            <p className="mt-2 text-sm font-medium text-orange-600">
              {t(
                'interventions.mobilized',
                'Mobilisé(s)'
              )}
            </p>
          </article>
        </section>

        <section className="mb-6 rounded-[2rem] border border-[#eadfd6] bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 xl:grid-cols-[1fr_260px_auto] xl:items-end">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                {t(
                  'interventions.searchLabel',
                  'Rechercher une intervention'
                )}
              </label>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder={t(
                  'interventions.searchPlaceholder',
                  'Type d’aide, point concerné, commentaire...'
                )}
                className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                {t(
                  'interventions.status',
                  'Statut'
                )}
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
              >
                <option value="all">
                  {t(
                    'interventions.allStatuses',
                    'Tous les statuts'
                  )}
                </option>

                <option value="prevue">
                  {t(
                    'interventions.statusPlanned',
                    'Prévue'
                  )}
                </option>

                <option value="declaree">
                  {t(
                    'interventions.statusDeclared',
                    'Déclarée'
                  )}
                </option>

                <option value="realisee">
                  {t(
                    'interventions.statusCompleted',
                    'Réalisée'
                  )}
                </option>

                <option value="annulee">
                  {t(
                    'interventions.statusCancelled',
                    'Annulée'
                  )}
                </option>

                <option value="non_renseigne">
                  {t(
                    'interventions.notProvided',
                    'Non renseigné'
                  )}
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              {t(
                'interventions.reset',
                'Réinitialiser'
              )}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500">
            <span>
              {t(
                'interventions.interventionsDisplayed',
                '{{count}} intervention(s) affichée(s)',
                {
                  count:
                    filteredInterventions.length,
                }
              )}
            </span>

            <span>•</span>

            <span>
              {t(
                'interventions.pointsCovered',
                '{{count}} point(s) couvert(s)',
                {
                  count: pointsCouverts,
                }
              )}
            </span>
          </div>
        </section>

        {isLoading && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
            {t(
              'interventions.loading',
              'Chargement des interventions...'
            )}
          </div>
        )}

        {isError && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
            {(error as Error)?.message ||
              t(
                'interventions.loadingError',
                'Erreur lors du chargement des interventions.'
              )}
          </div>
        )}

        {!isLoading &&
          !isError &&
          filteredInterventions.length ===
            0 && (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-black text-slate-950">
                {t(
                  'interventions.noneFound',
                  'Aucune intervention trouvée'
                )}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {t(
                  'interventions.noneFoundDescription',
                  'Essaie de modifier ta recherche ou de créer une nouvelle intervention.'
                )}
              </p>

              {(searchTerm ||
                statusFilter !==
                  'all') && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#d94a0b] px-5 text-sm font-black text-white"
                >
                  {t(
                    'interventions.resetFilters',
                    'Réinitialiser les filtres'
                  )}
                </button>
              )}
            </div>
          )}

        {!isLoading &&
          !isError &&
          filteredInterventions.length >
            0 && (
            <div className="grid gap-5">
              {filteredInterventions.map(
                (intervention) => (
                  <article
                    key={intervention.id}
                    className="rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
                                {formatAidType(
                                  intervention.type_aide
                                )}
                              </h2>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusClass(
                                  intervention.statut
                                )}`}
                              >
                                {formatStatus(
                                  intervention.statut
                                )}
                              </span>
                            </div>

                            <p className="mt-2 text-sm font-medium text-slate-500">
                              {t(
                                'interventions.concernedPoint',
                                'Point concerné :'
                              )}{' '}

                              <span className="font-bold text-slate-700">
                                {intervention
                                  .points
                                  ?.adresse ||
                                  t(
                                    'interventions.pointNotProvided',
                                    'Point non renseigné'
                                  )}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                              {t(
                                'interventions.date',
                                'Date'
                              )}
                            </p>

                            <p className="mt-2 font-black text-slate-950">
                              {formatDate(
                                intervention.date_intervention
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                              {t(
                                'interventions.schedule',
                                'Horaires'
                              )}
                            </p>

                            <p className="mt-2 font-black text-slate-950">
                              {formatTimeRange(
                                intervention.heure_debut,
                                intervention.heure_fin
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-emerald-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                              {t(
                                'interventions.meals',
                                'Repas'
                              )}
                            </p>

                            <p className="mt-2 text-2xl font-black text-emerald-700">
                              {intervention.nombre_repas ??
                                0}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-orange-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                              {t(
                                'interventions.volunteers',
                                'Bénévoles'
                              )}
                            </p>

                            <p className="mt-2 text-2xl font-black text-orange-700">
                              {intervention.nombre_benevoles ??
                                0}
                            </p>
                          </div>
                        </div>

                        {intervention.commentaire &&
                          intervention.commentaire.trim()
                            .length >
                            0 && (
                            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                              <p className="mb-2 text-sm font-bold text-slate-700">
                                {t(
                                  'interventions.comment',
                                  'Commentaire'
                                )}
                              </p>

                              <p className="text-sm leading-relaxed text-slate-600">
                                {
                                  intervention.commentaire
                                }
                              </p>
                            </div>
                          )}
                      </div>

                      <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[190px]">
                        {intervention.point_id && (
                          <Link
                            to={`/points/${intervention.point_id}`}
                            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                          >
                            {t(
                              'interventions.viewPoint',
                              'Voir le point'
                            )}
                          </Link>
                        )}

                        <Link
                          to="/carte"
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#d94a0b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#b93607]"
                        >
                          {t(
                            'interventions.viewOnMap',
                            'Voir sur la carte'
                          )}
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
      </div>
    </div>
  )
}