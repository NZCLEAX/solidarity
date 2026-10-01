import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import {
  getInterventions,
  type Intervention,
} from '@/features/interventions/api/interventions'

import { getCurrentProfile } from '@/features/auth/api/profile'

import {
  isAssociationValidated,
  isVolunteerValidated,
} from '@/features/auth/utils/permissions'

import {
  getLanguage,
  type AppLanguage,
} from '@/shared/i18n/i18n'

type PeriodMode = 'today' | 'week' | 'month'
type AssociationScope = 'mine' | 'all'

const LOCALES: Record<AppLanguage, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
  ar: 'ar',
}

const PLANNING_TRANSLATIONS = {
  fr: {
    loading: 'Chargement du planning...',
    loadError: 'Impossible de charger le planning.',

    terrainOrganisation: 'Organisation terrain',
    title: 'Planning',

    description:
      'Visualise les actions prévues et organise les interventions terrain.',

    declareIntervention:
      'Déclarer une intervention',

    myAssociation:
      'Mon association',

    allAssociations:
      'Toutes les associations',

    actions: 'Actions',
    meals: 'Repas',
    volunteers: 'Bénévoles',

    today: 'Aujourd’hui',
    week: 'Semaine',
    month: 'Mois',

    backToToday:
      'Revenir à aujourd’hui',

    filters: 'Filtres',

    allAidTypes:
      'Tous les types d’aide',

    allStatuses:
      'Tous les statuts',

    resetFilters:
      'Réinitialiser les filtres',

    terrainActions:
      'Actions terrain',

    todayInterventions:
      'Interventions du jour',

    weekInterventions:
      'Interventions de la semaine',

    monthInterventions:
      'Interventions du mois',

    noIntervention:
      'Aucune intervention',

    noActionPeriod:
      'Aucune action n’est prévue sur cette période.',

    intervention:
      'Intervention',

    association:
      'Association',

    addressMissing:
      'Adresse non renseignée',

    viewPoint:
      'Voir le point',

    onMap:
      'Sur la carte',

    status: {
      planned: 'Prévue',
      ongoing: 'En cours',
      completed: 'Terminée',
      cancelled: 'Annulée',
      unknown: 'Non renseigné',
    },
  },

  en: {
    loading:
      'Loading planning...',

    loadError:
      'Unable to load the planning.',

    terrainOrganisation:
      'Field organisation',

    title:
      'Planning',

    description:
      'View scheduled actions and organise field interventions.',

    declareIntervention:
      'Declare an intervention',

    myAssociation:
      'My association',

    allAssociations:
      'All associations',

    actions:
      'Actions',

    meals:
      'Meals',

    volunteers:
      'Volunteers',

    today:
      'Today',

    week:
      'Week',

    month:
      'Month',

    backToToday:
      'Back to today',

    filters:
      'Filters',

    allAidTypes:
      'All aid types',

    allStatuses:
      'All statuses',

    resetFilters:
      'Reset filters',

    terrainActions:
      'Field actions',

    todayInterventions:
      "Today's interventions",

    weekInterventions:
      "This week's interventions",

    monthInterventions:
      "This month's interventions",

    noIntervention:
      'No intervention',

    noActionPeriod:
      'No action is scheduled for this period.',

    intervention:
      'Intervention',

    association:
      'Association',

    addressMissing:
      'Address not provided',

    viewPoint:
      'View point',

    onMap:
      'On the map',

    status: {
      planned: 'Planned',
      ongoing: 'Ongoing',
      completed: 'Completed',
      cancelled: 'Cancelled',
      unknown: 'Not provided',
    },
  },

  es: {
    loading:
      'Cargando la planificación...',

    loadError:
      'No se puede cargar la planificación.',

    terrainOrganisation:
      'Organización sobre el terreno',

    title:
      'Planificación',

    description:
      'Consulta las acciones previstas y organiza las intervenciones sobre el terreno.',

    declareIntervention:
      'Declarar una intervención',

    myAssociation:
      'Mi asociación',

    allAssociations:
      'Todas las asociaciones',

    actions:
      'Acciones',

    meals:
      'Comidas',

    volunteers:
      'Voluntarios',

    today:
      'Hoy',

    week:
      'Semana',

    month:
      'Mes',

    backToToday:
      'Volver a hoy',

    filters:
      'Filtros',

    allAidTypes:
      'Todos los tipos de ayuda',

    allStatuses:
      'Todos los estados',

    resetFilters:
      'Restablecer filtros',

    terrainActions:
      'Acciones sobre el terreno',

    todayInterventions:
      'Intervenciones de hoy',

    weekInterventions:
      'Intervenciones de la semana',

    monthInterventions:
      'Intervenciones del mes',

    noIntervention:
      'Ninguna intervención',

    noActionPeriod:
      'No hay ninguna acción prevista para este período.',

    intervention:
      'Intervención',

    association:
      'Asociación',

    addressMissing:
      'Dirección no indicada',

    viewPoint:
      'Ver el punto',

    onMap:
      'En el mapa',

    status: {
      planned: 'Prevista',
      ongoing: 'En curso',
      completed: 'Finalizada',
      cancelled: 'Cancelada',
      unknown: 'No indicado',
    },
  },

  ar: {
    loading:
      'جارٍ تحميل التخطيط...',

    loadError:
      'تعذر تحميل التخطيط.',

    terrainOrganisation:
      'تنظيم العمل الميداني',

    title:
      'التخطيط',

    description:
      'اعرض الأنشطة المخطط لها ونظّم التدخلات الميدانية.',

    declareIntervention:
      'إضافة تدخل',

    myAssociation:
      'جمعيتي',

    allAssociations:
      'جميع الجمعيات',

    actions:
      'الأنشطة',

    meals:
      'الوجبات',

    volunteers:
      'المتطوعون',

    today:
      'اليوم',

    week:
      'الأسبوع',

    month:
      'الشهر',

    backToToday:
      'العودة إلى اليوم',

    filters:
      'الفلاتر',

    allAidTypes:
      'جميع أنواع المساعدة',

    allStatuses:
      'جميع الحالات',

    resetFilters:
      'إعادة ضبط الفلاتر',

    terrainActions:
      'الأنشطة الميدانية',

    todayInterventions:
      'تدخلات اليوم',

    weekInterventions:
      'تدخلات الأسبوع',

    monthInterventions:
      'تدخلات الشهر',

    noIntervention:
      'لا توجد تدخلات',

    noActionPeriod:
      'لا توجد أنشطة مخطط لها خلال هذه الفترة.',

    intervention:
      'تدخل',

    association:
      'جمعية',

    addressMissing:
      'العنوان غير محدد',

    viewPoint:
      'عرض النقطة',

    onMap:
      'على الخريطة',

    status: {
      planned: 'مخطط له',
      ongoing: 'جارٍ',
      completed: 'مكتمل',
      cancelled: 'ملغى',
      unknown: 'غير محدد',
    },
  },
} as const

function startOfDay(date: Date) {
  const copy = new Date(date)

  copy.setHours(
    0,
    0,
    0,
    0
  )

  return copy
}

function startOfWeek(date: Date) {
  const copy =
    startOfDay(date)

  const day =
    copy.getDay()

  const diff =
    copy.getDate() -
    day +
    (day === 0 ? -6 : 1)

  copy.setDate(diff)

  return copy
}

function endOfWeek(date: Date) {
  const start =
    startOfWeek(date)

  const end =
    new Date(start)

  end.setDate(
    start.getDate() + 6
  )

  end.setHours(
    23,
    59,
    59,
    999
  )

  return end
}

function startOfMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  )
}

function endOfMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  )
}

function addDays(
  date: Date,
  amount: number
) {
  const copy =
    new Date(date)

  copy.setDate(
    copy.getDate() + amount
  )

  return copy
}

function addMonths(
  date: Date,
  amount: number
) {
  const copy =
    new Date(date)

  copy.setMonth(
    copy.getMonth() + amount
  )

  return copy
}

function sameDay(
  a: Date,
  b: Date
) {
  return (
    a.getFullYear() ===
      b.getFullYear() &&
    a.getMonth() ===
      b.getMonth() &&
    a.getDate() ===
      b.getDate()
  )
}

function getInterventionDate(
  intervention: Intervention
) {
  if (
    !intervention.date_intervention
  ) {
    return null
  }

  const date =
    new Date(
      `${intervention.date_intervention}T00:00:00`
    )

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null
  }

  return date
}

function formatDayTitle(
  date: Date,
  language: AppLanguage
) {
  return date.toLocaleDateString(
    LOCALES[language],
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }
  )
}

function formatShortDay(
  date: Date,
  language: AppLanguage
) {
  return date
    .toLocaleDateString(
      LOCALES[language],
      {
        weekday: 'short',
      }
    )
    .replace('.', '')
}

function formatMonth(
  date: Date,
  language: AppLanguage
) {
  return date.toLocaleDateString(
    LOCALES[language],
    {
      month: 'long',
      year: 'numeric',
    }
  )
}

function formatWeekdayNarrow(
  date: Date,
  language: AppLanguage
) {
  return date.toLocaleDateString(
    LOCALES[language],
    {
      weekday: 'narrow',
    }
  )
}

function formatStatus(
  status: Intervention['statut'],
  language: AppLanguage
) {
  const t =
    PLANNING_TRANSLATIONS[
      language
    ].status

  switch (status) {
    case 'prevue':
      return t.planned

    case 'en_cours':
      return t.ongoing

    case 'terminee':
      return t.completed

    case 'annulee':
      return t.cancelled

    default:
      return t.unknown
  }
}

function formatAidType(
  type: string | null,
  language: AppLanguage
) {
  if (!type) {
    return PLANNING_TRANSLATIONS[
      language
    ].intervention
  }

  const value =
    type.toLowerCase()

  const labels = {
    fr: {
      meals:
        'Distribution de repas',

      water:
        'Distribution d’eau',

      clothes:
        'Distribution de vêtements',

      outreach:
        'Maraude',

      care:
        'Soins',

      social:
        'Accompagnement social',

      other:
        'Autre',
    },

    en: {
      meals:
        'Meal distribution',

      water:
        'Water distribution',

      clothes:
        'Clothing distribution',

      outreach:
        'Outreach',

      care:
        'Care',

      social:
        'Social support',

      other:
        'Other',
    },

    es: {
      meals:
        'Distribución de comidas',

      water:
        'Distribución de agua',

      clothes:
        'Distribución de ropa',

      outreach:
        'Marauda solidaria',

      care:
        'Atención',

      social:
        'Acompañamiento social',

      other:
        'Otro',
    },

    ar: {
      meals:
        'توزيع الوجبات',

      water:
        'توزيع المياه',

      clothes:
        'توزيع الملابس',

      outreach:
        'جولة ميدانية',

      care:
        'رعاية',

      social:
        'مرافقة اجتماعية',

      other:
        'أخرى',
    },
  } as const

  const t =
    labels[language]

  if (
    value.includes('repas')
  ) {
    return t.meals
  }

  if (
    value.includes('eau')
  ) {
    return t.water
  }

  if (
    value.includes('vêtement') ||
    value.includes('vetement')
  ) {
    return t.clothes
  }

  if (
    value.includes('maraude')
  ) {
    return t.outreach
  }

  if (
    value.includes('soin')
  ) {
    return t.care
  }

  if (
    value.includes(
      'accompagnement'
    )
  ) {
    return t.social
  }

  if (value === 'autre') {
    return t.other
  }

  /*
   * Si une association a écrit
   * un type personnalisé,
   * on conserve sa valeur.
   */
  return type
}

function formatActionCount(
  count: number,
  language: AppLanguage
) {
  if (language === 'en') {
    return `${count} ${
      count === 1
        ? 'action'
        : 'actions'
    }`
  }

  if (language === 'es') {
    return `${count} ${
      count === 1
        ? 'acción'
        : 'acciones'
    }`
  }

  if (language === 'ar') {
    return `${count} ${
      count === 1
        ? 'إجراء'
        : 'إجراءات'
    }`
  }

  return `${count} action${
    count > 1 ? 's' : ''
  }`
}

function getStatusClass(
  status: Intervention['statut']
) {
  switch (status) {
    case 'prevue':
      return 'bg-blue-50 text-blue-700 ring-blue-200'

    case 'en_cours':
      return 'bg-orange-50 text-orange-700 ring-orange-200'

    case 'terminee':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200'

    case 'annulee':
      return 'bg-red-50 text-red-700 ring-red-200'

    default:
      return 'bg-slate-100 text-slate-600 ring-slate-200'
  }
}

function getTypeClass(
  type: string | null
) {
  const value =
    type?.toLowerCase() ?? ''

  if (
    value.includes('repas')
  ) {
    return 'bg-orange-50 text-orange-700'
  }

  if (
    value.includes('eau')
  ) {
    return 'bg-blue-50 text-blue-700'
  }

  if (
    value.includes('soin')
  ) {
    return 'bg-red-50 text-red-700'
  }

  if (
    value.includes('vêtement') ||
    value.includes('vetement')
  ) {
    return 'bg-purple-50 text-purple-700'
  }

  return 'bg-slate-100 text-slate-700'
}

function sortInterventions(
  interventions: Intervention[]
) {
  return [
    ...interventions,
  ].sort((a, b) => {
    const dateA =
      `${a.date_intervention ?? ''} ${a.heure_debut ?? ''}`

    const dateB =
      `${b.date_intervention ?? ''} ${b.heure_debut ?? ''}`

    return dateA.localeCompare(
      dateB
    )
  })
}

export default function PlanningPage() {
  /*
   * =========================================================
   * LANGUE
   * =========================================================
   */

  const [
    language,
    setLanguage,
  ] = useState<AppLanguage>(
    () => getLanguage()
  )

  /*
   * =========================================================
   * PLANNING
   * =========================================================
   */

  const [
    periodMode,
    setPeriodMode,
  ] =
    useState<PeriodMode>(
      'today'
    )

  const [
    currentDate,
    setCurrentDate,
  ] =
    useState(
      new Date()
    )

  const [
    associationScope,
    setAssociationScope,
  ] =
    useState<AssociationScope>(
      'mine'
    )

  const [
    filtersOpen,
    setFiltersOpen,
  ] =
    useState(false)

  const [
    associationFilter,
    setAssociationFilter,
  ] =
    useState('all')

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState('all')

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState('all')

  /*
   * =========================================================
   * SYNCHRONISATION DE LA LANGUE
   * =========================================================
   */

  useEffect(() => {
    function syncLanguage() {
      const nextLanguage =
        getLanguage()

      setLanguage(
        (current) =>
          current ===
          nextLanguage
            ? current
            : nextLanguage
      )
    }

    syncLanguage()

    /*
     * Changement depuis un
     * autre onglet.
     */
    function handleStorage(
      event: StorageEvent
    ) {
      if (
        event.key ===
        'pulse-language'
      ) {
        syncLanguage()
      }
    }

    window.addEventListener(
      'storage',
      handleStorage
    )

    /*
     * Changement depuis
     * Réglages dans l'onglet
     * actuel.
     */
    const observer =
      new MutationObserver(
        syncLanguage
      )

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          'lang',
        ],
      }
    )

    return () => {
      window.removeEventListener(
        'storage',
        handleStorage
      )

      observer.disconnect()
    }
  }, [])

  const t =
    PLANNING_TRANSLATIONS[
      language
    ]

  /*
   * =========================================================
   * PROFIL
   * =========================================================
   */

  const {
    data: profile,
    isLoading:
      profileLoading,
    isError:
      profileError,
  } = useQuery({
    queryKey: [
      'current-profile',
    ],

    queryFn:
      getCurrentProfile,
  })

  /*
   * =========================================================
   * INTERVENTIONS
   * =========================================================
   */

  const {
    data:
      interventions = [],

    isLoading:
      interventionsLoading,

    isError:
      interventionsError,

    error:
      interventionsErrorObject,
  } = useQuery({
    queryKey: [
      'interventions',
    ],

    queryFn:
      getInterventions,
  })

  const role =
    profile?.role

  const isAssociation =
    role === 'association' &&
    isAssociationValidated(
      profile
    )

  const isVolunteer =
    role === 'benevole' &&
    isVolunteerValidated(
      profile
    )

  const isGlobalViewer =
    role === 'admin' ||
    role === 'moderateur'

  const canCreateIntervention =
    isAssociation ||
    isGlobalViewer

  /*
   * =========================================================
   * RÈGLE MÉTIER
   *
   * bénévole :
   * uniquement son association
   *
   * association :
   * son association par défaut
   * + possibilité de voir toutes
   *
   * admin / modérateur :
   * toutes
   * =========================================================
   */

  const roleScopedInterventions =
    useMemo(() => {
      if (!profile) {
        return []
      }

      if (isVolunteer) {
        return interventions.filter(
          (intervention) =>
            intervention.association_id ===
            profile.association_id
        )
      }

      if (isAssociation) {
        if (
          associationScope ===
          'mine'
        ) {
          return interventions.filter(
            (intervention) =>
              intervention.association_id ===
              profile.association_id
          )
        }

        return interventions
      }

      if (
        isGlobalViewer
      ) {
        return interventions
      }

      return []
    }, [
      interventions,
      profile,
      isVolunteer,
      isAssociation,
      isGlobalViewer,
      associationScope,
    ])

  /*
   * =========================================================
   * ASSOCIATIONS DISPONIBLES
   * =========================================================
   */

  const availableAssociations =
    useMemo(() => {
      const values =
        roleScopedInterventions
          .map(
            (
              intervention
            ) =>
              intervention.association_nom
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(
                value &&
                  value.trim()
              )
          )

      return Array.from(
        new Set(values)
      ).sort((a, b) =>
        a.localeCompare(
          b,
          LOCALES[
            language
          ]
        )
      )
    }, [
      roleScopedInterventions,
      language,
    ])

  /*
   * =========================================================
   * TYPES DISPONIBLES
   * =========================================================
   */

  const availableTypes =
    useMemo(() => {
      const values =
        roleScopedInterventions
          .map(
            (
              intervention
            ) =>
              intervention.type_aide
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(
                value &&
                  value.trim()
              )
          )

      return Array.from(
        new Set(values)
      ).sort((a, b) =>
        a.localeCompare(
          b,
          LOCALES[
            language
          ]
        )
      )
    }, [
      roleScopedInterventions,
      language,
    ])

  /*
   * =========================================================
   * FILTRES
   * =========================================================
   */

  const filteredInterventions =
    useMemo(() => {
      return roleScopedInterventions.filter(
        (
          intervention
        ) => {
          const associationMatches =
            associationFilter ===
              'all' ||
            intervention.association_nom ===
              associationFilter

          const typeMatches =
            typeFilter ===
              'all' ||
            intervention.type_aide ===
              typeFilter

          const statusMatches =
            statusFilter ===
              'all' ||
            intervention.statut ===
              statusFilter

          return (
            associationMatches &&
            typeMatches &&
            statusMatches
          )
        }
      )
    }, [
      roleScopedInterventions,
      associationFilter,
      typeFilter,
      statusFilter,
    ])

  /*
   * =========================================================
   * PÉRIODE
   * =========================================================
   */

  const periodInterventions =
    useMemo(() => {
      const target =
        startOfDay(
          currentDate
        )

      const filtered =
        filteredInterventions.filter(
          (
            intervention
          ) => {
            const date =
              getInterventionDate(
                intervention
              )

            if (!date) {
              return false
            }

            if (
              periodMode ===
              'today'
            ) {
              return sameDay(
                date,
                target
              )
            }

            if (
              periodMode ===
              'week'
            ) {
              const start =
                startOfWeek(
                  target
                )

              const end =
                endOfWeek(
                  target
                )

              return (
                date >= start &&
                date <= end
              )
            }

            const start =
              startOfMonth(
                target
              )

            const end =
              endOfMonth(
                target
              )

            return (
              date >= start &&
              date <= end
            )
          }
        )

      return sortInterventions(
        filtered
      )
    }, [
      filteredInterventions,
      currentDate,
      periodMode,
    ])

  /*
   * =========================================================
   * STATISTIQUES
   * =========================================================
   */

  const totalRepas =
    periodInterventions.reduce(
      (
        total,
        intervention
      ) =>
        total +
        (
          intervention.nombre_repas ??
          0
        ),
      0
    )

  const totalBenevoles =
    periodInterventions.reduce(
      (
        total,
        intervention
      ) =>
        total +
        (
          intervention.nombre_benevoles ??
          0
        ),
      0
    )

  /*
   * =========================================================
   * SEMAINE
   * =========================================================
   */

  const weekDays =
    useMemo(() => {
      const start =
        startOfWeek(
          currentDate
        )

      return Array.from(
        {
          length: 7,
        },
        (_, index) =>
          addDays(
            start,
            index
          )
      )
    }, [currentDate])

  /*
   * Sert uniquement à générer
   * les noms L / M / M...
   * dans la bonne langue.
   */
  const calendarWeekDays =
    useMemo(() => {
      const start =
        startOfWeek(
          new Date(
            2026,
            0,
            5
          )
        )

      return Array.from(
        {
          length: 7,
        },
        (_, index) =>
          addDays(
            start,
            index
          )
      )
    }, [])

  /*
   * =========================================================
   * MOIS
   * =========================================================
   */

  const monthDays =
    useMemo(() => {
      const firstDay =
        startOfMonth(
          currentDate
        )

      const lastDay =
        endOfMonth(
          currentDate
        )

      const numberOfDays =
        lastDay.getDate()

      return Array.from(
        {
          length:
            numberOfDays,
        },
        (_, index) => {
          return new Date(
            firstDay.getFullYear(),
            firstDay.getMonth(),
            index + 1
          )
        }
      )
    }, [currentDate])

  const monthOffset =
    useMemo(() => {
      const firstDay =
        startOfMonth(
          currentDate
        )

      const day =
        firstDay.getDay()

      return day === 0
        ? 6
        : day - 1
    }, [currentDate])

  /*
   * =========================================================
   * INTERVENTIONS D'UN JOUR
   * =========================================================
   */

  function getDayInterventions(
    day: Date
  ) {
    return filteredInterventions.filter(
      (
        intervention
      ) => {
        const date =
          getInterventionDate(
            intervention
          )

        if (!date) {
          return false
        }

        return sameDay(
          date,
          day
        )
      }
    )
  }

  /*
   * =========================================================
   * NAVIGATION PÉRIODE
   * =========================================================
   */

  function previousPeriod() {
    if (
      periodMode ===
      'today'
    ) {
      setCurrentDate(
        (date) =>
          addDays(
            date,
            -1
          )
      )

      return
    }

    if (
      periodMode ===
      'week'
    ) {
      setCurrentDate(
        (date) =>
          addDays(
            date,
            -7
          )
      )

      return
    }

    setCurrentDate(
      (date) =>
        addMonths(
          date,
          -1
        )
    )
  }

  function nextPeriod() {
    if (
      periodMode ===
      'today'
    ) {
      setCurrentDate(
        (date) =>
          addDays(
            date,
            1
          )
      )

      return
    }

    if (
      periodMode ===
      'week'
    ) {
      setCurrentDate(
        (date) =>
          addDays(
            date,
            7
          )
      )

      return
    }

    setCurrentDate(
      (date) =>
        addMonths(
          date,
          1
        )
    )
  }

  /*
   * =========================================================
   * RESET FILTRES
   * =========================================================
   */

  function resetFilters() {
    setAssociationFilter(
      'all'
    )

    setTypeFilter(
      'all'
    )

    setStatusFilter(
      'all'
    )
  }

  const activeFilters =
    (
      associationFilter !==
      'all'
        ? 1
        : 0
    ) +
    (
      typeFilter !==
      'all'
        ? 1
        : 0
    ) +
    (
      statusFilter !==
      'all'
        ? 1
        : 0
    )

  const loading =
    profileLoading ||
    interventionsLoading

  const hasError =
    profileError ||
    interventionsError

  /*
   * =========================================================
   * CHARGEMENT
   * =========================================================
   */

  if (loading) {
    return (
      <div
        dir={
          language === 'ar'
            ? 'rtl'
            : 'ltr'
        }
        className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-6"
      >
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-[#eadfd6] bg-white p-8 font-semibold text-slate-500 shadow-sm">
            {t.loading}
          </div>
        </div>
      </div>
    )
  }

  /*
   * =========================================================
   * ERREUR
   * =========================================================
   */

  if (hasError) {
    return (
      <div
        dir={
          language === 'ar'
            ? 'rtl'
            : 'ltr'
        }
        className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-6"
      >
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 font-semibold text-red-700">
            {interventionsErrorObject instanceof
            Error
              ? interventionsErrorObject.message
              : t.loadError}
          </div>
        </div>
      </div>
    )
  }

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <div
      dir={
        language === 'ar'
          ? 'rtl'
          : 'ltr'
      }
      className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-10"
    >
      <div className="mx-auto max-w-7xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d94a0b] sm:text-sm">
                {
                  t.terrainOrganisation
                }
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {t.title}
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500">
                {
                  t.description
                }
              </p>
            </div>

            {canCreateIntervention && (
              <Link
                to="/interventions/new"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#d94a0b] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#b93607]"
              >
                +{' '}
                {
                  t.declareIntervention
                }
              </Link>
            )}
          </div>
        </header>

        {/* =================================================
            ASSOCIATION SCOPE
        ================================================= */}

        {isAssociation && (
          <section className="mb-4">
            <div className="grid grid-cols-2 rounded-2xl bg-slate-200/70 p-1">
              <button
                type="button"
                onClick={() => {
                  setAssociationScope(
                    'mine'
                  )

                  setAssociationFilter(
                    'all'
                  )
                }}
                className={`min-h-11 rounded-xl px-3 text-sm font-black transition ${
                  associationScope ===
                  'mine'
                    ? 'bg-white text-[#d94a0b] shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                {
                  t.myAssociation
                }
              </button>

              <button
                type="button"
                onClick={() => {
                  setAssociationScope(
                    'all'
                  )

                  setAssociationFilter(
                    'all'
                  )
                }}
                className={`min-h-11 rounded-xl px-3 text-sm font-black transition ${
                  associationScope ===
                  'all'
                    ? 'bg-white text-[#d94a0b] shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                {
                  t.allAssociations
                }
              </button>
            </div>
          </section>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-2xl border border-[#eadfd6] bg-white p-3 shadow-sm sm:p-4">
            <p className="text-xl font-black text-slate-950 sm:text-2xl">
              {
                periodInterventions.length
              }
            </p>

            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
              {t.actions}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3 shadow-sm sm:p-4">
            <p className="text-xl font-black text-orange-700 sm:text-2xl">
              {totalRepas}
            </p>

            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-orange-600">
              {t.meals}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 shadow-sm sm:p-4">
            <p className="text-xl font-black text-emerald-700 sm:text-2xl">
              {
                totalBenevoles
              }
            </p>

            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-emerald-600">
              {
                t.volunteers
              }
            </p>
          </div>
        </section>

        {/* =================================================
            PERIOD
        ================================================= */}

        <section className="mb-4">
          <div className="grid grid-cols-3 rounded-2xl bg-slate-200/70 p-1">
            <button
              type="button"
              onClick={() =>
                setPeriodMode(
                  'today'
                )
              }
              className={`min-h-11 rounded-xl text-xs font-black sm:text-sm ${
                periodMode ===
                'today'
                  ? 'bg-white text-[#d94a0b] shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              {t.today}
            </button>

            <button
              type="button"
              onClick={() =>
                setPeriodMode(
                  'week'
                )
              }
              className={`min-h-11 rounded-xl text-xs font-black sm:text-sm ${
                periodMode ===
                'week'
                  ? 'bg-white text-[#d94a0b] shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              {t.week}
            </button>

            <button
              type="button"
              onClick={() =>
                setPeriodMode(
                  'month'
                )
              }
              className={`min-h-11 rounded-xl text-xs font-black sm:text-sm ${
                periodMode ===
                'month'
                  ? 'bg-white text-[#d94a0b] shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              {t.month}
            </button>
          </div>
        </section>

        {/* =================================================
            DATE NAVIGATION
        ================================================= */}

        <section className="mb-4 flex items-center justify-between rounded-2xl border border-[#eadfd6] bg-white p-2 shadow-sm">
          <button
            type="button"
            onClick={
              previousPeriod
            }
            aria-label="Previous period"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-xl font-black text-slate-700"
          >
            {language === 'ar'
              ? '›'
              : '‹'}
          </button>

          <button
            type="button"
            onClick={() =>
              setCurrentDate(
                new Date()
              )
            }
            className="min-w-0 px-2 text-center"
          >
            <p className="truncate text-sm font-black capitalize text-slate-950">
              {periodMode ===
              'month'
                ? formatMonth(
                    currentDate,
                    language
                  )
                : formatDayTitle(
                    currentDate,
                    language
                  )}
            </p>

            <p className="mt-0.5 text-[11px] font-bold text-[#d94a0b]">
              {
                t.backToToday
              }
            </p>
          </button>

          <button
            type="button"
            onClick={
              nextPeriod
            }
            aria-label="Next period"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-xl font-black text-slate-700"
          >
            {language === 'ar'
              ? '‹'
              : '›'}
          </button>
        </section>

        {/* =================================================
            WEEK SELECTOR
        ================================================= */}

        {periodMode ===
          'week' && (
          <section className="mb-4 grid grid-cols-7 gap-1 sm:gap-2">
            {weekDays.map(
              (day) => {
                const interventionsForDay =
                  getDayInterventions(
                    day
                  )

                const active =
                  sameDay(
                    day,
                    currentDate
                  )

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() =>
                      setCurrentDate(
                        day
                      )
                    }
                    className={`relative min-h-[72px] rounded-xl border px-1 py-2 text-center transition ${
                      active
                        ? 'border-[#d94a0b] bg-orange-50'
                        : 'border-[#eadfd6] bg-white'
                    }`}
                  >
                    <p className="text-[9px] font-black uppercase text-slate-400 sm:text-[11px]">
                      {formatShortDay(
                        day,
                        language
                      )}
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-950">
                      {day.toLocaleDateString(
                        LOCALES[
                          language
                        ],
                        {
                          day: 'numeric',
                        }
                      )}
                    </p>

                    {interventionsForDay.length >
                      0 && (
                      <div className="mx-auto mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d94a0b] px-1 text-[9px] font-black text-white">
                        {
                          interventionsForDay.length
                        }
                      </div>
                    )}
                  </button>
                )
              }
            )}
          </section>
        )}

        {/* =================================================
            MONTH CALENDAR
        ================================================= */}

        {periodMode ===
          'month' && (
          <section className="mb-4 rounded-[1.5rem] border border-[#eadfd6] bg-white p-3 shadow-sm">
            <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-black uppercase text-slate-400">
              {calendarWeekDays.map(
                (day) => (
                  <span
                    key={day.toISOString()}
                  >
                    {formatWeekdayNarrow(
                      day,
                      language
                    )}
                  </span>
                )
              )}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from(
                {
                  length:
                    monthOffset,
                },
                (
                  _,
                  index
                ) => (
                  <div
                    key={`empty-${index}`}
                  />
                )
              )}

              {monthDays.map(
                (day) => {
                  const interventionsForDay =
                    getDayInterventions(
                      day
                    )

                  const active =
                    sameDay(
                      day,
                      currentDate
                    )

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => {
                        setCurrentDate(
                          day
                        )

                        setPeriodMode(
                          'today'
                        )
                      }}
                      className={`relative min-h-12 rounded-xl text-sm font-black transition ${
                        active
                          ? 'bg-[#d94a0b] text-white'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {day.toLocaleDateString(
                        LOCALES[
                          language
                        ],
                        {
                          day: 'numeric',
                        }
                      )}

                      {interventionsForDay.length >
                        0 && (
                        <span
                          className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
                            active
                              ? 'bg-white'
                              : 'bg-[#d94a0b]'
                          }`}
                        />
                      )}
                    </button>
                  )
                }
              )}
            </div>
          </section>
        )}

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mb-6">
          <button
            type="button"
            onClick={() =>
              setFiltersOpen(
                (value) =>
                  !value
              )
            }
            className="flex min-h-11 items-center rounded-xl border border-[#eadfd6] bg-white px-4 text-sm font-black text-slate-700 shadow-sm"
          >
            {t.filters}

            {activeFilters >
              0 && (
              <span className="ml-2 rounded-full bg-[#d94a0b] px-2 py-0.5 text-[10px] text-white">
                {
                  activeFilters
                }
              </span>
            )}
          </button>

          {filtersOpen && (
            <div className="mt-3 rounded-[1.5rem] border border-[#eadfd6] bg-white p-4 shadow-sm">
              <div className="grid gap-3 md:grid-cols-3">
                {(isGlobalViewer ||
                  (
                    isAssociation &&
                    associationScope ===
                      'all'
                  )) && (
                  <select
                    value={
                      associationFilter
                    }
                    onChange={(
                      event
                    ) =>
                      setAssociationFilter(
                        event
                          .target
                          .value
                      )
                    }
                    className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="all">
                      {
                        t.allAssociations
                      }
                    </option>

                    {availableAssociations.map(
                      (
                        association
                      ) => (
                        <option
                          key={
                            association
                          }
                          value={
                            association
                          }
                        >
                          {
                            association
                          }
                        </option>
                      )
                    )}
                  </select>
                )}

                <select
                  value={
                    typeFilter
                  }
                  onChange={(
                    event
                  ) =>
                    setTypeFilter(
                      event
                        .target
                        .value
                    )
                  }
                  className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="all">
                    {
                      t.allAidTypes
                    }
                  </option>

                  {availableTypes.map(
                    (type) => (
                      <option
                        key={
                          type
                        }
                        value={
                          type
                        }
                      >
                        {formatAidType(
                          type,
                          language
                        )}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={
                    statusFilter
                  }
                  onChange={(
                    event
                  ) =>
                    setStatusFilter(
                      event
                        .target
                        .value
                    )
                  }
                  className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="all">
                    {
                      t.allStatuses
                    }
                  </option>

                  <option value="prevue">
                    {
                      t.status
                        .planned
                    }
                  </option>

                  <option value="en_cours">
                    {
                      t.status
                        .ongoing
                    }
                  </option>

                  <option value="terminee">
                    {
                      t.status
                        .completed
                    }
                  </option>

                  <option value="annulee">
                    {
                      t.status
                        .cancelled
                    }
                  </option>
                </select>
              </div>

              {activeFilters >
                0 && (
                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="mt-3 text-sm font-black text-[#d94a0b]"
                >
                  {
                    t.resetFilters
                  }
                </button>
              )}
            </div>
          )}
        </section>

        {/* =================================================
            LIST
        ================================================= */}

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d94a0b]">
                {
                  t.terrainActions
                }
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                {periodMode ===
                'today'
                  ? t.todayInterventions
                  : periodMode ===
                      'week'
                    ? t.weekInterventions
                    : t.monthInterventions}
              </h2>
            </div>

            <span className="shrink-0 text-xs font-black text-slate-400">
              {formatActionCount(
                periodInterventions.length,
                language
              )}
            </span>
          </div>

          {periodInterventions.length ===
          0 ? (
            <div className="rounded-[2rem] border border-dashed border-[#d8cec5] bg-white p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-xl">
                ◦
              </div>

              <h3 className="mt-4 font-black text-slate-950">
                {
                  t.noIntervention
                }
              </h3>

              <p className="mt-2 text-sm font-semibold text-slate-500">
                {
                  t.noActionPeriod
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {periodInterventions.map(
                (
                  intervention
                ) => (
                  <article
                    key={
                      intervention.id
                    }
                    className="rounded-[1.7rem] border border-[#eadfd6] bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${getTypeClass(
                              intervention.type_aide
                            )}`}
                          >
                            {formatAidType(
                              intervention.type_aide,
                              language
                            )}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${getStatusClass(
                              intervention.statut
                            )}`}
                          >
                            {formatStatus(
                              intervention.statut,
                              language
                            )}
                          </span>
                        </div>

                        <h3 className="mt-3 text-lg font-black text-slate-950">
                          {intervention.association_nom ||
                            t.association}
                        </h3>

                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {intervention
                            .points
                            ?.adresse ||
                            t.addressMissing}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-lg font-black text-slate-950">
                          {intervention.heure_debut ||
                            '--:--'}
                        </p>

                        {intervention.heure_fin && (
                          <p className="text-xs font-semibold text-slate-400">
                            →{' '}
                            {
                              intervention.heure_fin
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-2xl bg-orange-50 p-3">
                        <p className="text-lg font-black text-orange-700">
                          {intervention.nombre_repas ??
                            0}
                        </p>

                        <p className="text-[10px] font-black uppercase text-orange-600">
                          {
                            t.meals
                          }
                        </p>
                      </div>

                      <div className="rounded-2xl bg-emerald-50 p-3">
                        <p className="text-lg font-black text-emerald-700">
                          {intervention.nombre_benevoles ??
                            0}
                        </p>

                        <p className="text-[10px] font-black uppercase text-emerald-600">
                          {
                            t.volunteers
                          }
                        </p>
                      </div>
                    </div>

                    {intervention.commentaire && (
                      <p className="mt-3 line-clamp-2 rounded-xl bg-slate-50 p-3 text-xs font-semibold leading-relaxed text-slate-500">
                        {
                          intervention.commentaire
                        }
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {intervention.point_id ? (
                        <Link
                          to={`/points/${intervention.point_id}`}
                          className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-center text-xs font-black text-slate-700"
                        >
                          {
                            t.viewPoint
                          }
                        </Link>
                      ) : (
                        <div />
                      )}

                      <Link
  to={
    intervention.point_id
      ? `/carte?pointId=${encodeURIComponent(
          String(
            intervention.point_id
          )
        )}`
      : '/carte'
  }
  className="flex min-h-11 items-center justify-center rounded-xl bg-[#d94a0b] px-3 text-center text-xs font-black text-white"
>
  {t.onMap}
</Link>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}