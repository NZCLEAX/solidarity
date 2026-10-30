import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
  useParams,
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
  ArrowLeft,
} from 'lucide-react'

import { getPoints } from '@/features/points/api/points'

import FormSection, {
  chipClass,
  formFieldClass as fieldClass,
  formFooterClass,
  formLabelClass as labelClass,
} from '@/shared/components/FormSection'

import {
  createIntervention,
  getInterventionById,
  getInterventions,
  updateIntervention,
  type CreateInterventionInput,
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

  // Modification d'une intervention existante
  // (/interventions/:interventionId/edit).
  const { interventionId } = useParams()
  const isEdit = Boolean(interventionId)

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

  const {
    data: existingIntervention,
    isLoading: existingLoading,
    isError: existingError,
    error: existingErrorDetails,
  } = useQuery({
    queryKey: ['intervention', interventionId],
    queryFn: () =>
      getInterventionById(interventionId as string),
    enabled: isEdit,
  })

  // Pré-remplit le formulaire en mode modification.
  useEffect(() => {
    if (!existingIntervention) {
      return
    }

    setPointId(existingIntervention.point_id ?? '')
    setDateIntervention(
      existingIntervention.date_intervention ?? ''
    )
    setHeureDebut(
      existingIntervention.heure_debut?.slice(0, 5) ?? ''
    )
    setHeureFin(
      existingIntervention.heure_fin?.slice(0, 5) ?? ''
    )
    setTypesAide(
      (existingIntervention.type_aide ?? '')
        .split(',')
        .map((type: string) => type.trim())
        .filter(Boolean)
    )
    setNombreRepas(
      String(existingIntervention.nombre_repas ?? 0)
    )
    setNombreBenevoles(
      existingIntervention.nombre_benevoles
        ? String(existingIntervention.nombre_benevoles)
        : ''
    )
    setCommentaire(existingIntervention.commentaire ?? '')
  }, [existingIntervention])
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
            pointId &&
          intervention.id !== interventionId
      )
    }, [
      interventions,
      pointId,
      interventionId,
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
      mutationFn: (input: CreateInterventionInput) =>
        isEdit
          ? updateIntervention(
              interventionId as string,
              input
            )
          : createIntervention(input),

      onSuccess:
        async () => {
          await queryClient.invalidateQueries(
            {
              queryKey: [
                'interventions',
              ],
            }
          )

          if (isEdit) {
            await queryClient.invalidateQueries({
              queryKey: ['intervention', interventionId],
            })
          }

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
            selectedId &&
          intervention.id !== interventionId
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

  // Date courte pour le récapitulatif : « dim. 1 nov. »
  function formatShortDate(value: string) {
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date)
  }

  const coveragePercent =
    selectedPoint?.nombre_personnes_estime
      ? Math.min(
          100,
          Math.round(
            (repasDejaCouverts /
              selectedPoint.nombre_personnes_estime) *
              100
          )
        )
      : 0

  const volunteersLabel = t(
    'createIntervention.volunteers',
    'Bénévoles'
  ).toLowerCase()

  const summary = [
    dateIntervention
      ? formatShortDate(dateIntervention)
      : null,
    heureDebut && heureFin
      ? `${heureDebut} – ${heureFin}`
      : null,
    selectedTypesAide
      .map((option) => formatAidLabel(option.value))
      .join(', ') || null,
    repasSelected && nombreRepas
      ? `${nombreRepas} repas`
      : null,
    nombreBenevoles
      ? `${nombreBenevoles} ${
          Number(nombreBenevoles) === 1
            ? volunteersLabel.replace(/s$/, '')
            : volunteersLabel
        }`
      : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const pageTitle = isEdit
    ? t('createIntervention.editTitle', 'Modifier l’intervention')
    : t('createIntervention.title', 'Déclarer une intervention')

  if (isEdit && (existingLoading || existingError)) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-8">
        {existingLoading ? (
          <p className="text-sm text-slate-500">
            Chargement de l’intervention...
          </p>
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {(existingErrorDetails as Error)?.message ||
              'Impossible de charger cette intervention.'}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      dir={i18n.dir()}
      className="min-w-0 px-4 pt-4"
    >
      <div className="mx-auto w-full max-w-xl">
        <Link
          to="/interventions"
          className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft
            size={16}
            className={i18n.dir() === 'rtl' ? 'rotate-180' : ''}
          />
          {t('createIntervention.back', 'Retour aux interventions')}
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-950">
          {pageTitle}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {t(
            'createIntervention.description',
            'Renseigne les informations de l’intervention réalisée sur un point afin d’assurer un suivi clair des actions de terrain.'
          )}
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-5"
        >
          {/* 1. POINT CONCERNÉ */}

          <FormSection
            number={1}
            title={t(
              'createIntervention.concernedPoint',
              'Point concerné'
            )}
          >
            {pointsLoading && (
              <p className="mb-2 text-sm text-slate-500">
                {t(
                  'createIntervention.loadingPoints',
                  'Chargement des points...'
                )}
              </p>
            )}

            {pointsError && (
              <p className="mb-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {(pointsErrorDetails as Error)?.message ||
                  t(
                    'createIntervention.pointsError',
                    'Impossible de charger les points.'
                  )}
              </p>
            )}

            <select
              value={pointId}
              disabled={isPointFromMapValid}
              aria-label={t(
                'createIntervention.concernedPoint',
                'Point concerné'
              )}
              onChange={(event) =>
                handlePointChange(event.target.value)
              }
              className={fieldClass}
            >
              <option value="">
                {t(
                  'createIntervention.selectPoint',
                  'Sélectionner un point'
                )}
              </option>

              {points.map((point) => (
                <option key={point.id} value={point.id}>
                  {formatPointLabel(point.adresse)}
                </option>
              ))}
            </select>

            {isPointFromMapValid && (
              <p className="mt-1 text-xs text-slate-500">
                Point sélectionné automatiquement depuis la carte.
              </p>
            )}

            {selectedPoint && (
              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <p>
                  {selectedPoint.nombre_personnes_estime ?? 0}{' '}
                  {t(
                    'createIntervention.estimatedPeople',
                    'Personnes estimées'
                  ).toLowerCase()}{' '}
                  · {t('createIntervention.urgency', 'Urgence').toLowerCase()}{' '}
                  <span className="font-medium text-orange-600">
                    {formatUrgency(
                      selectedPoint.niveau_urgence
                    ).toLowerCase()}
                  </span>{' '}
                  · {t('createIntervention.needs', 'Besoins').toLowerCase()} :{' '}
                  {formatNeeds(selectedPoint.besoins).toLowerCase()}
                </p>

                <p>
                  {t(
                    'createIntervention.mealCoverage',
                    'Couverture repas'
                  )}{' '}
                  : {repasDejaCouverts}{' '}
                  {t(
                    'createIntervention.alreadyCovered',
                    'Déjà couverts'
                  ).toLowerCase()}{' '}
                  / {selectedPoint.nombre_personnes_estime ?? 0} ·{' '}
                  <span className="font-medium text-slate-900">
                    {repasRestants}{' '}
                    {t(
                      'createIntervention.remaining',
                      'Restants'
                    ).toLowerCase()}
                  </span>
                </p>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-[#d94a0b]"
                    style={{ width: `${coveragePercent}%` }}
                  />
                </div>

                <p className="text-xs text-slate-500">
                  {t('createIntervention.mealsSuggestion', {
                    count: repasRestants,
                    defaultValue:
                      'Prévois environ {{count}} repas/eaux pour compléter le besoin restant.',
                  })}
                </p>

                <div className="pt-2">
                  <p className="font-medium text-slate-700">
                    {t(
                      'createIntervention.associationsPositioned',
                      'Associations déjà positionnées'
                    )}
                  </p>

                  {interventionsLoading ? (
                    <p className="text-slate-500">
                      {t(
                        'createIntervention.loadingInterventions',
                        'Chargement des interventions...'
                      )}
                    </p>
                  ) : selectedPointInterventions.length === 0 ? (
                    <p className="text-slate-500">
                      {t(
                        'createIntervention.noAssociation',
                        'Aucune association positionnée pour le moment.'
                      )}
                    </p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {selectedPointInterventions.map(
                        (intervention) => (
                          <li
                            key={intervention.id}
                            className="text-slate-600"
                          >
                            <span className="font-medium text-slate-900">
                              {intervention.association_nom ||
                                t(
                                  'createIntervention.association',
                                  'Association'
                                )}
                            </span>{' '}
                            ·{' '}
                            {formatStoredAidTypes(
                              intervention.type_aide
                            )}{' '}
                            ·{' '}
                            {formatDatePreview(
                              intervention.date_intervention
                            )}
                            {hasRepas(intervention.type_aide) && (
                              <>
                                {' '}
                                ·{' '}
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
                              </>
                            )}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </FormSection>

          {/* 2. DATE ET HORAIRES */}

          <FormSection
            number={2}
            title={t(
              'createIntervention.dateAndTime',
              'Date et horaires'
            )}
          >
            <label className={labelClass}>
              {t('createIntervention.date', 'Date')}
            </label>

            <input
              type="date"
              value={dateIntervention}
              onChange={(event) =>
                setDateIntervention(event.target.value)
              }
              className={fieldClass}
            />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  {t(
                    'createIntervention.startTime',
                    'Heure de début'
                  )}
                </label>

                <input
                  type="time"
                  value={heureDebut}
                  onChange={(event) =>
                    setHeureDebut(event.target.value)
                  }
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  {t('createIntervention.endTime', 'Heure de fin')}
                </label>

                <input
                  type="time"
                  value={heureFin}
                  onChange={(event) =>
                    setHeureFin(event.target.value)
                  }
                  className={fieldClass}
                />
              </div>
            </div>
          </FormSection>

          {/* 3. TYPE D'AIDE */}

          <FormSection
            number={3}
            title={t(
              'createIntervention.aidTypesSummary',
              'Types d’aide'
            )}
          >
            <div className="flex flex-wrap gap-2">
              {typeAideOptions.map((option) => {
                const selected = typesAide.includes(option.value)
                const Icon = option.icon

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleTypeAide(option.value)}
                    className={chipClass(selected)}
                  >
                    {selected ? (
                      <Check size={15} />
                    ) : (
                      <Icon size={15} />
                    )}
                    {formatAidLabel(option.value)}
                  </button>
                )
              })}
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {t(
                'createIntervention.severalChoices',
                'Plusieurs choix possibles.'
              )}
            </p>
          </FormSection>

          {/* 4. MOYENS MOBILISÉS */}

          <FormSection
            number={4}
            title={t(
              'createIntervention.resources',
              'Moyens mobilisés'
            )}
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  {t(
                    'createIntervention.numberOfMeals',
                    'Nombre de repas'
                  )}
                </label>

                <input
                  type="number"
                  min="0"
                  value={nombreRepas}
                  disabled={!repasSelected}
                  onChange={(event) =>
                    setNombreRepas(event.target.value)
                  }
                  placeholder={
                    repasSelected
                      ? t(
                          'createIntervention.remainingPlaceholder',
                          {
                            count: repasRestants,
                            defaultValue: 'Restants : {{count}}',
                          }
                        )
                      : t(
                          'createIntervention.mealsNotSelected',
                          'Repas non sélectionné'
                        )
                  }
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  {t(
                    'createIntervention.numberOfVolunteers',
                    'Nombre de bénévoles'
                  )}
                </label>

                <input
                  type="number"
                  min="1"
                  value={nombreBenevoles}
                  onChange={(event) =>
                    setNombreBenevoles(event.target.value)
                  }
                  placeholder={t(
                    'createIntervention.volunteersPlaceholder',
                    'Ex : 6'
                  )}
                  className={fieldClass}
                />
              </div>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {repasSelected
                ? t(
                    'createIntervention.tipDescription',
                    'Pour les repas, le champ se remplit avec le nombre restant à couvrir. Pour les soins, vêtements, eau ou maraude, le nombre de repas reste à 0.'
                  )
                : t(
                    'createIntervention.mealsDisabled',
                    'Ce champ est désactivé car tu n’as pas sélectionné Repas.'
                  )}
            </p>

            <label className={`${labelClass} mt-4`}>
              {t('createIntervention.comment', 'Commentaire')}
            </label>

            <textarea
              rows={3}
              value={commentaire}
              onChange={(event) =>
                setCommentaire(event.target.value)
              }
              placeholder={t(
                'createIntervention.commentPlaceholder',
                'Informations complémentaires...'
              )}
              className={`${fieldClass} py-2`}
            />
          </FormSection>

          {/* RÉCAPITULATIF + VALIDATION
              (au-dessus de la barre de navigation sur téléphone) */}

          <div className={formFooterClass}>
            {error && (
              <p
                role="alert"
                className="mb-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <p className="text-sm text-slate-600">
              {summary ||
                t(
                  'createIntervention.summaryDescription',
                  'Aperçu de l’intervention avant validation.'
                )}
            </p>

            <div className="mt-2 flex items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-11 flex-1 rounded-lg bg-[#d94a0b] px-4 text-sm font-semibold text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? t(
                      'createIntervention.submitting',
                      'Déclaration en cours...'
                    )
                  : isEdit
                    ? t(
                        'createIntervention.saveChanges',
                        'Enregistrer les modifications'
                      )
                    : t(
                        'createIntervention.submit',
                        "Déclarer l'intervention"
                      )}
              </button>

              <Link
                to="/interventions"
                className="text-sm font-medium text-slate-600"
              >
                {t('createIntervention.cancel', 'Annuler')}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
