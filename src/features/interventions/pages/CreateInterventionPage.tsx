import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { useTranslation } from 'react-i18next'

import {
  Utensils,
  Droplets,
  Shirt,
  Footprints,
  HeartPulse,
  Handshake,
  MoreHorizontal,
  Check,
} from 'lucide-react'

import { getPoints } from '@/features/points/api/points'

import {
  createIntervention,
  getInterventions,
} from '@/features/interventions/api/interventions'

const typeAideOptions = [
  {
    value: 'Distribution de repas',
    icon: Utensils,
  },
  {
    value: "Distribution d'eau",
    icon: Droplets,
  },
  {
    value: 'Distribution de vêtements',
    icon: Shirt,
  },
  {
    value: 'Maraude',
    icon: Footprints,
  },
  {
    value: 'Soins',
    icon: HeartPulse,
  },
  {
    value: 'Accompagnement social',
    icon: Handshake,
  },
  {
    value: 'Autre',
    icon: MoreHorizontal,
  },
]

const LOCALES: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
  ar: 'ar',
}

function hasRepas(
  typeAide: string | null | undefined
) {
  return (
    typeAide
      ?.toLowerCase()
      .includes('repas') ?? false
  )
}

export default function CreateInterventionPage() {
  const { t, i18n } = useTranslation()

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [searchParams] = useSearchParams()

  const pointIdFromUrl =
    searchParams.get('pointId')

  const language = (
    i18n.resolvedLanguage ??
    i18n.language ??
    'fr'
  )
    .toLowerCase()
    .split('-')[0]

  const locale =
    LOCALES[language] ?? 'fr-FR'

  const [pointId, setPointId] =
    useState('')

  const [
    dateIntervention,
    setDateIntervention,
  ] = useState('')

  const [
    heureDebut,
    setHeureDebut,
  ] = useState('')

  const [
    heureFin,
    setHeureFin,
  ] = useState('')

  const [
    typesAide,
    setTypesAide,
  ] = useState<string[]>([
    'Distribution de repas',
  ])

  const [
    nombreRepas,
    setNombreRepas,
  ] = useState('')

  const [
    nombreBenevoles,
    setNombreBenevoles,
  ] = useState('')

  const [
    commentaire,
    setCommentaire,
  ] = useState('')

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  )

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
  } = useQuery({
    queryKey: ['interventions'],
    queryFn: getInterventions,
  })
useEffect(() => {
  if (
    !pointIdFromUrl ||
    points.length === 0
  ) {
    return
  }

  const point = points.find(
    (item) =>
      String(item.id) ===
      String(pointIdFromUrl)
  )

  if (!point) {
    return
  }

  setPointId(
    String(point.id)
  )

  const interventionsDuPoint =
    interventions.filter(
      (intervention) =>
        String(intervention.point_id) ===
        String(point.id)
    )

  const repasCouverts =
    interventionsDuPoint
      .filter(
        (intervention) =>
          hasRepas(
            intervention.type_aide
          )
      )
      .reduce(
        (
          total,
          intervention
        ) =>
          total +
          (intervention.nombre_repas ??
            0),
        0
      )

  const restant =
    Math.max(
      (point.nombre_personnes_estime ??
        0) -
        repasCouverts,
      0
    )

  setNombreRepas(
    String(restant)
  )
}, [
  pointIdFromUrl,
  points,
  interventions,
])
  const isPointFromMapValid =
    Boolean(
      pointIdFromUrl &&
        points.some(
          (point) =>
            point.id ===
            pointIdFromUrl
        )
    )

  useEffect(() => {
    if (
      !pointIdFromUrl ||
      points.length === 0
    ) {
      return
    }

    const point =
      points.find(
        (item) =>
          item.id ===
          pointIdFromUrl
      )

    if (!point) {
      return
    }

    setPointId(
      pointIdFromUrl
    )

    const interventionsDuPoint =
      interventions.filter(
        (intervention) =>
          intervention.point_id ===
          pointIdFromUrl
      )

    const repasCouverts =
      interventionsDuPoint
        .filter(
          (intervention) =>
            hasRepas(
              intervention.type_aide
            )
        )
        .reduce(
          (
            total,
            intervention
          ) =>
            total +
            (intervention.nombre_repas ??
              0),
          0
        )

    const restant =
      Math.max(
        (point.nombre_personnes_estime ??
          0) -
          repasCouverts,
        0
      )

    setNombreRepas(
      String(restant)
    )
  }, [
    pointIdFromUrl,
    points,
    interventions,
  ])

  const selectedPoint =
    useMemo(() => {
      return (
        points.find(
          (point) =>
            point.id === pointId
        ) ?? null
      )
    }, [
      points,
      pointId,
    ])

  const selectedPointInterventions =
    useMemo(() => {
      return interventions.filter(
        (intervention) =>
          intervention.point_id ===
          pointId
      )
    }, [
      interventions,
      pointId,
    ])

  const repasDejaCouverts =
    useMemo(() => {
      return selectedPointInterventions
        .filter(
          (intervention) =>
            hasRepas(
              intervention.type_aide
            )
        )
        .reduce(
          (
            total,
            intervention
          ) =>
            total +
            (intervention.nombre_repas ??
              0),
          0
        )
    }, [
      selectedPointInterventions,
    ])

  const repasRestants =
    useMemo(() => {
      return Math.max(
        (selectedPoint
          ?.nombre_personnes_estime ??
          0) -
          repasDejaCouverts,
        0
      )
    }, [
      selectedPoint,
      repasDejaCouverts,
    ])

  const selectedTypesAide =
    useMemo(() => {
      return typeAideOptions.filter(
        (option) =>
          typesAide.includes(
            option.value
          )
      )
    }, [typesAide])

  const repasSelected =
    useMemo(() => {
      return typesAide.some(
        (type) =>
          hasRepas(type)
      )
    }, [typesAide])

  function formatPointLabel(
    adresse:
      | string
      | null
      | undefined
  ) {
    return (
      adresse?.trim() ||
      t(
        'createIntervention.addressNotProvided',
        'Adresse non renseignée'
      )
    )
  }

  function formatDatePreview(
    date:
      | string
      | null
      | undefined
  ) {
    if (!date) {
      return t(
        'createIntervention.notProvidedFeminine',
        'Non renseignée'
      )
    }

    const parsedDate =
      new Date(date)

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date
    }

    return new Intl.DateTimeFormat(
      locale
    ).format(parsedDate)
  }

  function formatUrgency(
    value:
      | string
      | null
      | undefined
  ) {
    switch (
      value
        ?.toLowerCase()
        .trim()
    ) {
      case 'basse':
        return t(
          'createIntervention.urgencyLow',
          'Basse'
        )

      case 'moyenne':
        return t(
          'createIntervention.urgencyMedium',
          'Moyenne'
        )

      case 'haute':
        return t(
          'createIntervention.urgencyHigh',
          'Haute'
        )

      case 'critique':
        return t(
          'createIntervention.urgencyCritical',
          'Critique'
        )

      default:
        return (
          value ||
          t(
            'createIntervention.notProvidedFeminine',
            'Non renseignée'
          )
        )
    }
  }

  function formatNeed(
    value: string
  ) {
    switch (
      value.trim()
    ) {
      case 'Repas':
        return t(
          'createIntervention.needMeals',
          'Repas'
        )

      case 'Eau':
        return t(
          'createIntervention.needWater',
          'Eau'
        )

      case 'Hygiène':
        return t(
          'createIntervention.needHygiene',
          'Hygiène'
        )

      case 'Vêtements':
        return t(
          'createIntervention.needClothing',
          'Vêtements'
        )

      case 'Couvertures':
        return t(
          'createIntervention.needBlankets',
          'Couvertures'
        )

      case 'Soins':
        return t(
          'createIntervention.needCare',
          'Soins'
        )

      case 'Autre':
        return t(
          'createIntervention.needOther',
          'Autre'
        )

      default:
        return value.trim()
    }
  }

  function formatNeeds(
    value:
      | string
      | null
      | undefined
  ) {
    if (!value) {
      return t(
        'createIntervention.notProvidedPlural',
        'Non renseignés'
      )
    }

    return String(value)
      .split(',')
      .map((need) =>
        formatNeed(need)
      )
      .join(', ')
  }

  function formatAidLabel(
    value: string
  ) {
    switch (value) {
      case 'Distribution de repas':
        return t(
          'createIntervention.aidMeals',
          'Repas'
        )

      case "Distribution d'eau":
        return t(
          'createIntervention.aidWater',
          'Eau'
        )

      case 'Distribution de vêtements':
        return t(
          'createIntervention.aidClothing',
          'Vêtements'
        )

      case 'Maraude':
        return t(
          'createIntervention.aidOutreach',
          'Maraude'
        )

      case 'Soins':
        return t(
          'createIntervention.aidCare',
          'Soins'
        )

      case 'Accompagnement social':
        return t(
          'createIntervention.aidSupport',
          'Accompagnement'
        )

      case 'Autre':
        return t(
          'createIntervention.aidOther',
          'Autre'
        )

      default:
        return value
    }
  }

  function formatStoredAidTypes(
    value:
      | string
      | null
      | undefined
  ) {
    if (!value) {
      return t(
        'createIntervention.aidNotProvided',
        'Aide non renseignée'
      )
    }

    return value
      .split(',')
      .map((type) =>
        formatAidLabel(
          type.trim()
        )
      )
      .join(', ')
  }

  const createMutation =
    useMutation({
      mutationFn:
        createIntervention,

      onSuccess:
        async () => {
          await queryClient.invalidateQueries(
            {
              queryKey: [
                'interventions',
              ],
            }
          )

          navigate(
            '/interventions'
          )
        },
    })

  const isSubmitting =
    createMutation.isPending

  function toggleTypeAide(
    value: string
  ) {
    setTypesAide(
      (currentTypes) =>
        currentTypes.includes(
          value
        )
          ? currentTypes.filter(
              (type) =>
                type !== value
            )
          : [
              ...currentTypes,
              value,
            ]
    )
  }

  function handlePointChange(
    selectedId: string
  ) {
    setPointId(
      selectedId
    )

    const point =
      points.find(
        (item) =>
          item.id ===
          selectedId
      )

    if (!point) {
      setNombreRepas('')
      return
    }

    const interventionsDuPoint =
      interventions.filter(
        (intervention) =>
          intervention.point_id ===
          selectedId
      )

    const repasCouverts =
      interventionsDuPoint
        .filter(
          (intervention) =>
            hasRepas(
              intervention.type_aide
            )
        )
        .reduce(
          (
            total,
            intervention
          ) =>
            total +
            (intervention.nombre_repas ??
              0),
          0
        )

    const restant =
      Math.max(
        (point.nombre_personnes_estime ??
          0) -
          repasCouverts,
        0
      )

    setNombreRepas(
      String(restant)
    )
  }

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    setError(null)

    if (!pointId) {
      setError(
        t(
          'createIntervention.errorPoint',
          'Veuillez sélectionner un point concerné.'
        )
      )

      return
    }

    if (!dateIntervention) {
      setError(
        t(
          'createIntervention.errorDate',
          "Veuillez renseigner la date de l'intervention."
        )
      )

      return
    }

    if (!heureDebut) {
      setError(
        t(
          'createIntervention.errorStartTime',
          "Veuillez renseigner l'heure de début."
        )
      )

      return
    }

    if (!heureFin) {
      setError(
        t(
          'createIntervention.errorEndTime',
          "Veuillez renseigner l'heure de fin."
        )
      )

      return
    }

    if (
      heureFin <=
      heureDebut
    ) {
      setError(
        t(
          'createIntervention.errorTimeOrder',
          "L'heure de fin doit être après l'heure de début."
        )
      )

      return
    }

    if (
      typesAide.length ===
      0
    ) {
      setError(
        t(
          'createIntervention.errorAidType',
          "Veuillez sélectionner au moins un type d'aide."
        )
      )

      return
    }

    if (
      repasSelected &&
      (!nombreRepas ||
        Number(
          nombreRepas
        ) < 0)
    ) {
      setError(
        t(
          'createIntervention.errorMeals',
          'Veuillez renseigner un nombre de repas valide.'
        )
      )

      return
    }

    if (
      !nombreBenevoles ||
      Number(
        nombreBenevoles
      ) <= 0
    ) {
      setError(
        t(
          'createIntervention.errorVolunteers',
          'Veuillez renseigner un nombre de bénévoles valide.'
        )
      )

      return
    }

    try {
      await createMutation.mutateAsync(
        {
          pointId,
          dateIntervention,
          heureDebut,
          heureFin,

          typeAide:
            typesAide.join(
              ', '
            ),

          nombreRepas:
            repasSelected
              ? Number(
                  nombreRepas
                )
              : 0,

          nombreBenevoles:
            Number(
              nombreBenevoles
            ),

          commentaire:
            commentaire.trim() ||
            undefined,
        }
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t(
              'createIntervention.declarationError',
              'Une erreur est survenue lors de la déclaration.'
            )
      )
    }
  }

  return (
    <div
      dir={i18n.dir()}
      className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-6 sm:px-6 lg:px-8 xl:px-10"
    >
      <div className="mx-auto w-full max-w-[1500px]">

        <div className="mb-5">
          <Link
            to="/interventions"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <span>
              {i18n.dir() ===
              'rtl'
                ? '→'
                : '←'}
            </span>

            <span>
              {t(
                'createIntervention.back',
                'Retour aux interventions'
              )}
            </span>
          </Link>
        </div>

        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#d94a0b]">
            {t(
              'createIntervention.fieldIntervention',
              'Intervention terrain'
            )}
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl xl:text-5xl">
            {t(
              'createIntervention.title',
              'Déclarer une intervention'
            )}
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {t(
              'createIntervention.description',
              'Renseigne les informations de l’intervention réalisée sur un point afin d’assurer un suivi clair des actions de terrain.'
            )}
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px] 2xl:grid-cols-[minmax(0,1.45fr)_340px]">

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-6"
          >

            <section className="rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
                  {t(
                    'createIntervention.concernedPoint',
                    'Point concerné'
                  )}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t(
                    'createIntervention.concernedPointDescription',
                    'Sélectionne le point sur lequel l’intervention a été réalisée.'
                  )}
                </p>
              </div>

              {pointsLoading && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {t(
                    'createIntervention.loadingPoints',
                    'Chargement des points...'
                  )}
                </div>
              )}

              {pointsError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {(pointsErrorDetails as Error)
                    ?.message ||
                    t(
                      'createIntervention.pointsError',
                      'Impossible de charger les points.'
                    )}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  {t(
                    'createIntervention.concernedPoint',
                    'Point concerné'
                  )}{' '}
                  *
                </label>

                <select
                  value={
                    pointId
                  }
                  disabled={
                    isPointFromMapValid
                  }
                  onChange={(
                    event
                  ) =>
                    handlePointChange(
                      event.target.value
                    )
                  }
                  className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-600"
                >
                  <option value="">
                    {t(
                      'createIntervention.selectPoint',
                      'Sélectionner un point'
                    )}
                  </option>

                  {points.map(
                    (point) => (
                      <option
                        key={
                          point.id
                        }
                        value={
                          point.id
                        }
                      >
                        {formatPointLabel(
                          point.adresse
                        )}
                      </option>
                    )
                  )}
                </select>

                {isPointFromMapValid && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Point sélectionné automatiquement depuis la carte.
                  </p>
                )}
              </div>

              {selectedPoint && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                  <p className="text-sm font-black text-emerald-800">
                    {t(
                      'createIntervention.selectedPoint',
                      'Point sélectionné'
                    )}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-emerald-700">
                    {formatPointLabel(
                      selectedPoint.adresse
                    )}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">

                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-black uppercase text-slate-500">
                        {t(
                          'createIntervention.estimatedPeople',
                          'Personnes estimées'
                        )}
                      </p>

                      <p className="mt-1 text-3xl font-black text-slate-950">
                        {selectedPoint
                          .nombre_personnes_estime ??
                          0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-black uppercase text-slate-500">
                        {t(
                          'createIntervention.urgency',
                          'Urgence'
                        )}
                      </p>

                      <p className="mt-1 text-lg font-black text-orange-700">
                        {formatUrgency(
                          selectedPoint.niveau_urgence
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-black uppercase text-slate-500">
                        {t(
                          'createIntervention.needs',
                          'Besoins'
                        )}
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-950">
                        {formatNeeds(
                          selectedPoint.besoins
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-4">
                    <p className="text-xs font-black uppercase text-slate-500">
                      {t(
                        'createIntervention.mealCoverage',
                        'Couverture repas'
                      )}
                    </p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-bold text-slate-500">
                          {t(
                            'createIntervention.totalNeed',
                            'Besoin total'
                          )}
                        </p>

                        <p className="text-2xl font-black text-slate-950">
                          {selectedPoint
                            .nombre_personnes_estime ??
                            0}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-500">
                          {t(
                            'createIntervention.alreadyCovered',
                            'Déjà couverts'
                          )}
                        </p>

                        <p className="text-2xl font-black text-emerald-700">
                          {
                            repasDejaCouverts
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-500">
                          {t(
                            'createIntervention.remaining',
                            'Restants'
                          )}
                        </p>

                        <p className="text-2xl font-black text-orange-700">
                          {
                            repasRestants
                          }
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      {t(
                        'createIntervention.mealsSuggestion',
                        {
                          count:
                            repasRestants,

                          defaultValue:
                            'Prévois environ {{count}} repas/eaux pour compléter le besoin restant.',
                        }
                      )}
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-4">
                    <p className="text-xs font-black uppercase text-slate-500">
                      {t(
                        'createIntervention.associationsPositioned',
                        'Associations déjà positionnées'
                      )}
                    </p>

                    {interventionsLoading ? (
                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        {t(
                          'createIntervention.loadingInterventions',
                          'Chargement des interventions...'
                        )}
                      </p>
                    ) : selectedPointInterventions.length ===
                      0 ? (
                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        {t(
                          'createIntervention.noAssociation',
                          'Aucune association positionnée pour le moment.'
                        )}
                      </p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {selectedPointInterventions.map(
                          (
                            intervention
                          ) => (
                            <div
                              key={
                                intervention.id
                              }
                              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                            >
                              <p className="text-sm font-black text-slate-950">
                                {intervention.association_nom ||
                                  t(
                                    'createIntervention.association',
                                    'Association'
                                  )}
                              </p>

                              <p className="mt-1 text-xs font-semibold text-slate-600">
                                {formatStoredAidTypes(
                                  intervention.type_aide
                                )}{' '}
                                —{' '}
                                {formatDatePreview(
                                  intervention.date_intervention
                                )}
                              </p>

                              {hasRepas(
                                intervention.type_aide
                              ) && (
                                <p className="mt-1 text-xs font-bold text-orange-700">
                                  {t(
                                    'createIntervention.plannedMeals',
                                    {
                                      count:
                                        intervention.nombre_repas ??
                                        0,

                                      defaultValue:
                                        '{{count}} repas prévus',
                                    }
                                  )}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm sm:p-6">

              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
                  {t(
                    'createIntervention.information',
                    'Informations de l’intervention'
                  )}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t(
                    'createIntervention.informationDescription',
                    'Indique la date, les horaires et les types d’aide apportés.'
                  )}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    {t(
                      'createIntervention.date',
                      'Date'
                    )}{' '}
                    *
                  </label>

                  <input
                    type="date"
                    value={
                      dateIntervention
                    }
                    onChange={(
                      event
                    ) =>
                      setDateIntervention(
                        event
                          .target
                          .value
                      )
                    }
                    className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    {t(
                      'createIntervention.startTime',
                      'Heure de début'
                    )}{' '}
                    *
                  </label>

                  <input
                    type="time"
                    value={
                      heureDebut
                    }
                    onChange={(
                      event
                    ) =>
                      setHeureDebut(
                        event
                          .target
                          .value
                      )
                    }
                    className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    {t(
                      'createIntervention.endTime',
                      'Heure de fin'
                    )}{' '}
                    *
                  </label>

                  <input
                    type="time"
                    value={
                      heureFin
                    }
                    onChange={(
                      event
                    ) =>
                      setHeureFin(
                        event
                          .target
                          .value
                      )
                    }
                    className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-3 block text-sm font-bold text-slate-700">
                  {t(
                    'createIntervention.aidTypes',
                    'Type d’aide * — plusieurs choix possibles'
                  )}
                </label>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4">
                  {typeAideOptions.map(
                    (
                      option
                    ) => {
                      const isActive =
                        typesAide.includes(
                          option.value
                        )

                      const Icon =
                        option.icon

                      return (
                        <button
                          key={
                            option.value
                          }
                          type="button"
                          onClick={() =>
                            toggleTypeAide(
                              option.value
                            )
                          }
                          aria-pressed={
                            isActive
                          }
                          className={`relative flex min-h-[110px] flex-col items-center justify-center rounded-[1.4rem] border px-3 py-4 text-center transition ${
                            isActive
                              ? 'border-[#d94a0b] bg-orange-50 shadow-sm ring-4 ring-orange-100'
                              : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/40'
                          }`}
                        >
                          {isActive && (
                            <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#d94a0b] text-white">
                              <Check
                                size={
                                  14
                                }
                                strokeWidth={
                                  3
                                }
                                aria-hidden="true"
                              />
                            </span>
                          )}

                          <Icon
                            size={
                              30
                            }
                            strokeWidth={
                              1.8
                            }
                            aria-hidden="true"
                            className={
                              isActive
                                ? 'text-[#d94a0b]'
                                : 'text-slate-500'
                            }
                          />

                          <span
                            className={`mt-3 text-sm font-bold ${
                              isActive
                                ? 'text-[#d94a0b]'
                                : 'text-slate-900'
                            }`}
                          >
                            {formatAidLabel(
                              option.value
                            )}
                          </span>
                        </button>
                      )
                    }
                  )}
                </div>

                {typesAide.length >
                  0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedTypesAide.map(
                      (
                        option
                      ) => {
                        const Icon =
                          option.icon

                        return (
                          <span
                            key={
                              option.value
                            }
                            className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 ring-1 ring-orange-200"
                          >
                            <Icon
                              size={
                                14
                              }
                              strokeWidth={
                                2
                              }
                              aria-hidden="true"
                            />

                            {formatAidLabel(
                              option.value
                            )}
                          </span>
                        )
                      }
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm sm:p-6">

              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
                  {t(
                    'createIntervention.resources',
                    'Moyens mobilisés'
                  )}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t(
                    'createIntervention.resourcesDescription',
                    'Renseigne les quantités mobilisées pendant l’intervention.'
                  )}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    {t(
                      'createIntervention.numberOfMeals',
                      'Nombre de repas'
                    )}{' '}
                    {repasSelected
                      ? '*'
                      : ''}
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      nombreRepas
                    }
                    disabled={
                      !repasSelected
                    }
                    onChange={(
                      event
                    ) =>
                      setNombreRepas(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder={
                      repasSelected
                        ? t(
                            'createIntervention.remainingPlaceholder',
                            {
                              count:
                                repasRestants,

                              defaultValue:
                                'Restants : {{count}}',
                            }
                          )
                        : t(
                            'createIntervention.mealsNotSelected',
                            'Repas non sélectionné'
                          )
                    }
                    className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100 disabled:bg-slate-100 disabled:text-slate-400"
                  />

                  {!repasSelected && (
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {t(
                        'createIntervention.mealsDisabled',
                        'Ce champ est désactivé car tu n’as pas sélectionné Repas.'
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    {t(
                      'createIntervention.numberOfVolunteers',
                      'Nombre de bénévoles'
                    )}{' '}
                    *
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      nombreBenevoles
                    }
                    onChange={(
                      event
                    ) =>
                      setNombreBenevoles(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder={t(
                      'createIntervention.volunteersPlaceholder',
                      'Ex : 6'
                    )}
                    className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  {t(
                    'createIntervention.comment',
                    'Commentaire'
                  )}
                </label>

                <textarea
                  value={
                    commentaire
                  }
                  onChange={(
                    event
                  ) =>
                    setCommentaire(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder={t(
                    'createIntervention.commentPlaceholder',
                    'Informations complémentaires...'
                  )}
                  rows={5}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </section>

            {(error ||
              createMutation.isError) && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error ||
                  (createMutation.error as Error)
                    ?.message ||
                  t(
                    'createIntervention.genericError',
                    'Une erreur est survenue.'
                  )}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">

              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#544cf0] px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? t(
                      'createIntervention.submitting',
                      'Déclaration en cours...'
                    )
                  : t(
                      'createIntervention.submit',
                      "Déclarer l'intervention"
                    )}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/interventions'
                  )
                }
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                {t(
                  'createIntervention.cancel',
                  'Annuler'
                )}
              </button>
            </div>
          </form>

          <aside className="space-y-6">

            <section className="rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm sm:p-6 xl:sticky xl:top-24">

              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-950">
                  {t(
                    'createIntervention.summary',
                    'Résumé'
                  )}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {t(
                    'createIntervention.summaryDescription',
                    'Aperçu de l’intervention avant validation.'
                  )}
                </p>
              </div>

              <div className="space-y-4">

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {t(
                      'createIntervention.point',
                      'Point'
                    )}
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {selectedPoint
                      ? formatPointLabel(
                          selectedPoint.adresse
                        )
                      : t(
                          'createIntervention.notSelected',
                          'Non sélectionné'
                        )}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {t(
                      'createIntervention.mealCoverage',
                      'Couverture repas'
                    )}
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">

                    <div>
                      <p className="text-lg font-black text-slate-950">
                        {selectedPoint
                          ?.nombre_personnes_estime ??
                          0}
                      </p>

                      <p className="text-[10px] font-bold text-slate-500">
                        {t(
                          'createIntervention.need',
                          'Besoin'
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-lg font-black text-emerald-700">
                        {
                          repasDejaCouverts
                        }
                      </p>

                      <p className="text-[10px] font-bold text-slate-500">
                        {t(
                          'createIntervention.covered',
                          'Couvert'
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-lg font-black text-orange-700">
                        {
                          repasRestants
                        }
                      </p>

                      <p className="text-[10px] font-bold text-slate-500">
                        {t(
                          'createIntervention.remainingSingular',
                          'Restant'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {t(
                      'createIntervention.date',
                      'Date'
                    )}
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {dateIntervention
                      ? formatDatePreview(
                          dateIntervention
                        )
                      : t(
                          'createIntervention.notProvidedFeminine',
                          'Non renseignée'
                        )}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {t(
                      'createIntervention.schedule',
                      'Horaires'
                    )}
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {heureDebut ||
                      '--:--'}{' '}
                    →{' '}
                    {heureFin ||
                      '--:--'}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {t(
                      'createIntervention.aidTypesSummary',
                      'Types d’aide'
                    )}
                  </p>

                  {selectedTypesAide.length ===
                  0 ? (
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {t(
                        'createIntervention.notProvided',
                        'Non renseigné'
                      )}
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedTypesAide.map(
                        (
                          option
                        ) => {
                          const Icon =
                            option.icon

                          return (
                            <span
                              key={
                                option.value
                              }
                              className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 ring-1 ring-orange-200"
                            >
                              <Icon
                                size={
                                  14
                                }
                                strokeWidth={
                                  2
                                }
                                aria-hidden="true"
                              />

                              {formatAidLabel(
                                option.value
                              )}
                            </span>
                          )
                        }
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                      {t(
                        'createIntervention.declaredMeals',
                        'Repas déclarés'
                      )}
                    </p>

                    <p className="mt-2 text-2xl font-black text-emerald-700">
                      {repasSelected
                        ? nombreRepas ||
                          '0'
                        : '0'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                      {t(
                        'createIntervention.volunteers',
                        'Bénévoles'
                      )}
                    </p>

                    <p className="mt-2 text-2xl font-black text-indigo-700">
                      {nombreBenevoles ||
                        '0'}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <p className="text-sm font-bold text-orange-800">
                    {t(
                      'createIntervention.tip',
                      'Conseil'
                    )}
                  </p>

                  <p className="mt-2 text-sm leading-relaxed text-orange-700">
                    {t(
                      'createIntervention.tipDescription',
                      'Pour les repas, le champ se remplit avec le nombre restant à couvrir. Pour les soins, vêtements, eau ou maraude, le nombre de repas reste à 0.'
                    )}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}