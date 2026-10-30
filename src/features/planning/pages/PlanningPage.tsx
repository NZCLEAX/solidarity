
import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  SlidersHorizontal,
} from 'lucide-react'

import { useQuery } from '@tanstack/react-query'

import {
  getInterventions,
  type Intervention,
} from '@/features/interventions/api/interventions'

import {
  getInterventionEndDate,
  isInterventionExpired,
} from '@/features/interventions/utils/interventionDates'

import {
  getCurrentProfile,
} from '@/features/auth/api/profile'

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

const TRANSLATIONS = {
  fr: {
    title: 'Planning',
    subtitle: 'Organisation terrain',
    description:
      'Visualise les actions prévues et organise les interventions terrain.',
    declare: 'Déclarer une intervention',
    today: 'Aujourd’hui',
    week: 'Semaine',
    month: 'Mois',
    backToday: 'Revenir à aujourd’hui',
    myAssociation: 'Mon association',
    allAssociations: 'Toutes les associations',
    filters: 'Filtres',
    allTypes: 'Tous les types d’aide',
    allStatuses: 'Tous les statuts',
    reset: 'Réinitialiser les filtres',
    actions: 'Actions',
    meals: 'Repas',
    volunteers: 'Bénévoles',
    terrainActions: 'Actions terrain',
    noIntervention: 'Aucune intervention',
    noActions:
      'Aucune intervention à venir sur cette période.',
    association: 'Association',
    noAddress: 'Adresse non renseignée',
    viewPoint: 'Voir le point',
    onMap: 'Sur la carte',
    planned: 'Prévue',
    ongoing: 'En cours',
    completed: 'Terminée',
    cancelled: 'Annulée',
    loading: 'Chargement du planning...',
    error: 'Impossible de charger le planning.',
    dayInterventions: 'Interventions du jour',
    weekInterventions: 'Interventions de la semaine',
    monthInterventions: 'Interventions du mois',
  },

  en: {
    title: 'Planning',
    subtitle: 'Field organisation',
    description:
      'View scheduled actions and organise field interventions.',
    declare: 'Declare an intervention',
    today: 'Today',
    week: 'Week',
    month: 'Month',
    backToday: 'Back to today',
    myAssociation: 'My association',
    allAssociations: 'All associations',
    filters: 'Filters',
    allTypes: 'All aid types',
    allStatuses: 'All statuses',
    reset: 'Reset filters',
    actions: 'Actions',
    meals: 'Meals',
    volunteers: 'Volunteers',
    terrainActions: 'Field actions',
    noIntervention: 'No intervention',
    noActions:
      'No upcoming interventions during this period.',
    association: 'Association',
    noAddress: 'Address not provided',
    viewPoint: 'View point',
    onMap: 'On map',
    planned: 'Planned',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled',
    loading: 'Loading planning...',
    error: 'Unable to load planning.',
    dayInterventions: "Today's interventions",
    weekInterventions: 'Weekly interventions',
    monthInterventions: 'Monthly interventions',
  },

  es: {
    title: 'Planificación',
    subtitle: 'Organización sobre el terreno',
    description:
      'Consulta las acciones previstas y organiza las intervenciones.',
    declare: 'Declarar una intervención',
    today: 'Hoy',
    week: 'Semana',
    month: 'Mes',
    backToday: 'Volver a hoy',
    myAssociation: 'Mi asociación',
    allAssociations: 'Todas las asociaciones',
    filters: 'Filtros',
    allTypes: 'Todos los tipos de ayuda',
    allStatuses: 'Todos los estados',
    reset: 'Restablecer filtros',
    actions: 'Acciones',
    meals: 'Comidas',
    volunteers: 'Voluntarios',
    terrainActions: 'Acciones sobre el terreno',
    noIntervention: 'Ninguna intervención',
    noActions:
      'No hay intervenciones próximas en este período.',
    association: 'Asociación',
    noAddress: 'Dirección no indicada',
    viewPoint: 'Ver el punto',
    onMap: 'En el mapa',
    planned: 'Prevista',
    ongoing: 'En curso',
    completed: 'Finalizada',
    cancelled: 'Cancelada',
    loading: 'Cargando la planificación...',
    error: 'No se puede cargar la planificación.',
    dayInterventions: 'Intervenciones de hoy',
    weekInterventions: 'Intervenciones de la semana',
    monthInterventions: 'Intervenciones del mes',
  },

  ar: {
    title: 'التخطيط',
    subtitle: 'تنظيم العمل الميداني',
    description: 'عرض وتنظيم التدخلات الميدانية القادمة.',
    declare: 'إضافة تدخل',
    today: 'اليوم',
    week: 'الأسبوع',
    month: 'الشهر',
    backToday: 'العودة إلى اليوم',
    myAssociation: 'جمعيتي',
    allAssociations: 'جميع الجمعيات',
    filters: 'الفلاتر',
    allTypes: 'جميع أنواع المساعدة',
    allStatuses: 'جميع الحالات',
    reset: 'إعادة ضبط الفلاتر',
    actions: 'الأنشطة',
    meals: 'الوجبات',
    volunteers: 'المتطوعون',
    terrainActions: 'الأنشطة الميدانية',
    noIntervention: 'لا توجد تدخلات',
    noActions: 'لا توجد تدخلات قادمة في هذه الفترة.',
    association: 'جمعية',
    noAddress: 'العنوان غير محدد',
    viewPoint: 'عرض النقطة',
    onMap: 'على الخريطة',
    planned: 'مخطط له',
    ongoing: 'جارٍ',
    completed: 'مكتمل',
    cancelled: 'ملغى',
    loading: 'جارٍ تحميل التخطيط...',
    error: 'تعذر تحميل التخطيط.',
    dayInterventions: 'تدخلات اليوم',
    weekInterventions: 'تدخلات الأسبوع',
    monthInterventions: 'تدخلات الشهر',
  },
} as const

function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function startOfWeek(date: Date): Date {
  const result = startOfDay(date)
  const day = result.getDay()
  result.setDate(
    result.getDate() - ((day + 6) % 7)
  )
  return result
}

function startOfMonth(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  )
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addMonths(date: Date, months: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth() + months,
    Math.min(
      date.getDate(),
      new Date(
        date.getFullYear(),
        date.getMonth() + months + 1,
        0
      ).getDate()
    )
  )
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getInterventionDate(
  intervention: Intervention
): Date | null {
  const value = intervention.date_intervention

  if (!value) return null

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
    value
  )

  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

function isVisibleIntervention(
  intervention: Intervention,
  now: Date
): boolean {
  if (
    intervention.statut === 'terminee' ||
    intervention.statut === 'annulee'
  ) {
    return false
  }

  const endDate = getInterventionEndDate(intervention)

  if (!endDate) return false

  return !isInterventionExpired(intervention, now)
}

function formatAidType(
  type: string | null,
  language: AppLanguage
): string {
  if (!type) {
    return language === 'fr'
      ? 'Intervention'
      : 'Intervention'
  }

  return type
}

function getStatusClass(
  status: Intervention['statut']
): string {
  switch (status) {
    case 'prevue':
      return 'text-blue-600'

    case 'en_cours':
      return 'text-orange-600'

    case 'terminee':
      return 'text-emerald-600'

    case 'annulee':
      return 'text-red-600'

    default:
      return 'text-slate-500'
  }
}

// « 10:00:00 » → « 10:00 »
function shortTime(value: string | null) {
  return value ? value.slice(0, 5) : ''
}

export default function PlanningPage() {
  const [language, setLanguage] =
    useState<AppLanguage>(() => getLanguage())

  const [periodMode, setPeriodMode] =
    useState<PeriodMode>('today')

  const [currentDate, setCurrentDate] =
    useState(() => new Date())

  const [associationScope, setAssociationScope] =
    useState<AssociationScope>('mine')

  const [filtersOpen, setFiltersOpen] =
    useState(false)

  const [associationFilter, setAssociationFilter] =
    useState('all')

  const [typeFilter, setTypeFilter] =
    useState('all')

  const [statusFilter, setStatusFilter] =
    useState('all')

  const [now, setNow] = useState(() => new Date())

  const t = TRANSLATIONS[language]
  const locale = LOCALES[language]

  // Synchronisation de la langue
  useEffect(() => {
    function syncLanguage() {
      setLanguage(getLanguage())
    }

    syncLanguage()

    const observer = new MutationObserver(syncLanguage)

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    })

    window.addEventListener('storage', syncLanguage)

    return () => {
      observer.disconnect()
      window.removeEventListener(
        'storage',
        syncLanguage
      )
    }
  }, [])

  // Actualisation automatique des dates
  useEffect(() => {
    function refreshClock() {
      setNow(new Date())
    }

    const interval = window.setInterval(
      refreshClock,
      30000
    )

    window.addEventListener('focus', refreshClock)

    document.addEventListener(
      'visibilitychange',
      refreshClock
    )

    return () => {
      window.clearInterval(interval)

      window.removeEventListener(
        'focus',
        refreshClock
      )

      document.removeEventListener(
        'visibilitychange',
        refreshClock
      )
    }
  }, [])

  // Profil connecté
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
  })

  // Données des interventions
  const {
    data: interventions = [],
    isLoading: interventionsLoading,
    isError: interventionsError,
    error: interventionsErrorObject,
  } = useQuery({
    queryKey: ['interventions'],
    queryFn: getInterventions,
    refetchOnWindowFocus: true,
  })

  const role = profile?.role

  const isAssociation =
    role === 'association' &&
    isAssociationValidated(profile)

  const isVolunteer =
    role === 'benevole' &&
    isVolunteerValidated(profile)

  const isGlobalViewer =
    role === 'admin' ||
    role === 'moderateur'

  const canCreateIntervention =
    isAssociation ||
    isGlobalViewer

  // Respect des permissions par rôle
  const roleScopedInterventions = useMemo(() => {
    if (!profile) return []

    if (isVolunteer) {
      return interventions.filter(
        (intervention) =>
          intervention.association_id ===
          profile.association_id
      )
    }

    if (isAssociation) {
      if (associationScope === 'mine') {
        return interventions.filter(
          (intervention) =>
            intervention.association_id ===
            profile.association_id
        )
      }

      return interventions
    }

    if (isGlobalViewer) {
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

  // Ne garder que les actions non expirées
  const activeInterventions = useMemo(() => {
    return roleScopedInterventions.filter(
      (intervention) =>
        isVisibleIntervention(intervention, now)
    )
  }, [
    roleScopedInterventions,
    now,
  ])

  const availableAssociations = useMemo(() => {
    return Array.from(
      new Set(
        activeInterventions
          .map((item) => item.association_nom)
          .filter(
            (value): value is string =>
              Boolean(value?.trim())
          )
      )
    ).sort((a, b) => a.localeCompare(b, locale))
  }, [activeInterventions, locale])

  const availableTypes = useMemo(() => {
    return Array.from(
      new Set(
        activeInterventions
          .map((item) => item.type_aide)
          .filter(
            (value): value is string =>
              Boolean(value?.trim())
          )
      )
    ).sort((a, b) => a.localeCompare(b, locale))
  }, [activeInterventions, locale])

  // Filtres classiques
  const filteredInterventions = useMemo(() => {
    return activeInterventions.filter(
      (intervention) => {
        const matchesAssociation =
          associationFilter === 'all' ||
          intervention.association_nom ===
            associationFilter

        const matchesType =
          typeFilter === 'all' ||
          intervention.type_aide === typeFilter

        const matchesStatus =
          statusFilter === 'all' ||
          intervention.statut === statusFilter

        return (
          matchesAssociation &&
          matchesType &&
          matchesStatus
        )
      }
    )
  }, [
    activeInterventions,
    associationFilter,
    typeFilter,
    statusFilter,
  ])

  // Filtrer la période sélectionnée
  const periodInterventions = useMemo(() => {
    const target = startOfDay(currentDate)

    return filteredInterventions
      .filter((intervention) => {
        const date = getInterventionDate(intervention)

        if (!date) return false

        if (periodMode === 'today') {
          return sameDay(date, target)
        }

        if (periodMode === 'week') {
          const start = startOfWeek(target)
          const end = addDays(start, 7)

          return date >= start && date < end
        }

        const start = startOfMonth(target)
        const end = addMonths(start, 1)

        return date >= start && date < end
      })
      .sort((a, b) => {
        const dateA =
          `${a.date_intervention ?? ''} ${a.heure_debut ?? ''}`

        const dateB =
          `${b.date_intervention ?? ''} ${b.heure_debut ?? ''}`

        return dateA.localeCompare(dateB)
      })
  }, [
    filteredInterventions,
    currentDate,
    periodMode,
  ])

  const totalRepas = periodInterventions.reduce(
    (total, intervention) =>
      total + (intervention.nombre_repas ?? 0),
    0
  )

  const totalBenevoles = periodInterventions.reduce(
    (total, intervention) =>
      total + (intervention.nombre_benevoles ?? 0),
    0
  )

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate)

    return Array.from(
      { length: 7 },
      (_, index) => addDays(start, index)
    )
  }, [currentDate])

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate)

    const numberOfDays = new Date(
      start.getFullYear(),
      start.getMonth() + 1,
      0
    ).getDate()

    return Array.from(
      { length: numberOfDays },
      (_, index) =>
        new Date(
          start.getFullYear(),
          start.getMonth(),
          index + 1
        )
    )
  }, [currentDate])

  const monthOffset = (
    startOfMonth(currentDate).getDay() + 6
  ) % 7

  const calendarWeekDays = Array.from(
    { length: 7 },
    (_, index) => addDays(new Date(2026, 0, 5), index)
  )

  function getDayInterventions(day: Date) {
    return filteredInterventions.filter(
      (intervention) => {
        const date = getInterventionDate(intervention)
        return date !== null && sameDay(date, day)
      }
    )
  }

  function previousPeriod() {
    setCurrentDate((date) => {
      if (periodMode === 'today') {
        return addDays(date, -1)
      }

      if (periodMode === 'week') {
        return addDays(date, -7)
      }

      return addMonths(date, -1)
    })
  }

  function nextPeriod() {
    setCurrentDate((date) => {
      if (periodMode === 'today') {
        return addDays(date, 1)
      }

      if (periodMode === 'week') {
        return addDays(date, 7)
      }

      return addMonths(date, 1)
    })
  }

  function resetFilters() {
    setAssociationFilter('all')
    setTypeFilter('all')
    setStatusFilter('all')
  }

  const activeFilters =
    Number(associationFilter !== 'all') +
    Number(typeFilter !== 'all') +
    Number(statusFilter !== 'all')

  function formatStatus(
    status: Intervention['statut']
  ) {
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
        return '-'
    }
  }

  function formatDay(date: Date) {
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  function formatMonth(date: Date) {
    return date.toLocaleDateString(locale, {
      month: 'long',
      year: 'numeric',
    })
  }

  if (profileLoading || interventionsLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-slate-500">
        {t.loading}
      </div>
    )
  }

  if (profileError || interventionsError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {interventionsErrorObject instanceof Error
            ? interventionsErrorObject.message
            : t.error}
        </div>
      </div>
    )
  }

  const segmentClass = (active: boolean) =>
    `rounded-md py-2 text-sm font-medium transition ${
      active ? 'bg-slate-100 text-slate-950' : 'text-slate-600'
    }`

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="min-w-0 overflow-x-hidden px-4 pb-10 pt-6"
    >
      <div className="mx-auto w-full max-w-3xl">

        {/* EN-TÊTE */}

        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-950">
            {t.title}
          </h1>

          {canCreateIntervention && (
            <Link
              to="/interventions/new"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#d94a0b] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#b93607]"
            >
              <Plus size={16} />
              {t.declare}
            </Link>
          )}
        </header>

        <p className="mt-1 text-sm text-slate-500">
          {t.description}
        </p>

        <div className="mt-5 space-y-2">
          {/* SÉLECTION ASSOCIATION */}

          {isAssociation && (
            <div className="grid grid-cols-2 rounded-lg border border-slate-300 p-1">
              <button
                type="button"
                onClick={() => {
                  setAssociationScope('mine')
                  setAssociationFilter('all')
                }}
                className={segmentClass(associationScope === 'mine')}
              >
                {t.myAssociation}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAssociationScope('all')
                  setAssociationFilter('all')
                }}
                className={segmentClass(associationScope === 'all')}
              >
                {t.allAssociations}
              </button>
            </div>
          )}

          {/* CHOIX DE PÉRIODE */}

          <div className="grid grid-cols-3 rounded-lg border border-slate-300 p-1">
            {(['today', 'week', 'month'] as PeriodMode[]).map(
              (mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPeriodMode(mode)}
                  className={segmentClass(periodMode === mode)}
                >
                  {mode === 'today'
                    ? t.today
                    : mode === 'week'
                      ? t.week
                      : t.month}
                </button>
              )
            )}
          </div>
        </div>

        {/* NAVIGATION PAR DATE */}

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={previousPeriod}
            aria-label="Période précédente"
            className="p-2 text-slate-600"
          >
            <ChevronLeft
              size={20}
              className={language === 'ar' ? 'rotate-180' : ''}
            />
          </button>

          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="text-center"
          >
            <span className="block font-semibold capitalize text-slate-950">
              {periodMode === 'month'
                ? formatMonth(currentDate)
                : formatDay(currentDate)}
            </span>

            <span className="block text-xs font-medium text-[#d94a0b]">
              {t.backToday}
            </span>
          </button>

          <button
            type="button"
            onClick={nextPeriod}
            aria-label="Période suivante"
            className="p-2 text-slate-600"
          >
            <ChevronRight
              size={20}
              className={language === 'ar' ? 'rotate-180' : ''}
            />
          </button>
        </div>

        {/* SEMAINE */}

        {periodMode === 'week' && (
          <div className="mt-3 grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
              const count = getDayInterventions(day).length
              const active = sameDay(day, currentDate)

              return (
                <button
                  key={day.getTime()}
                  type="button"
                  onClick={() => setCurrentDate(day)}
                  className={`rounded-lg py-2 text-center transition ${
                    active
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-slate-700'
                  }`}
                >
                  <span className="block text-[11px] uppercase text-slate-500">
                    {day
                      .toLocaleDateString(locale, {
                        weekday: 'short',
                      })
                      .replace('.', '')}
                  </span>

                  <span className="block font-semibold">
                    {day.getDate()}
                  </span>

                  <span
                    className={`mx-auto mt-1 block h-1.5 w-1.5 rounded-full ${
                      count > 0 ? 'bg-[#d94a0b]' : 'bg-transparent'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        )}

        {/* CALENDRIER MENSUEL */}

        {periodMode === 'month' && (
          <div className="mt-3">
            <div className="grid grid-cols-7 text-center text-[11px] uppercase text-slate-500">
              {calendarWeekDays.map((day) => (
                <span key={day.getTime()}>
                  {day.toLocaleDateString(locale, {
                    weekday: 'narrow',
                  })}
                </span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {Array.from(
                { length: monthOffset },
                (_, index) => (
                  <div key={`empty-${index}`} />
                )
              )}

              {monthDays.map((day) => {
                const count = getDayInterventions(day).length
                const active = sameDay(day, currentDate)

                return (
                  <button
                    key={day.getTime()}
                    type="button"
                    onClick={() => {
                      setCurrentDate(day)
                      setPeriodMode('today')
                    }}
                    className={`relative rounded-lg py-2 text-sm transition ${
                      active
                        ? 'bg-[#d94a0b] font-semibold text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {day.getDate()}

                    {count > 0 && (
                      <span
                        className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                          active ? 'bg-white' : 'bg-[#d94a0b]'
                        }`}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* RÉSUMÉ + FILTRES */}

        <div className="mt-3 border-y border-slate-200 py-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-600">
              {periodInterventions.length}{' '}
              {t.actions.toLowerCase()} · {totalRepas}{' '}
              {t.meals.toLowerCase()} · {totalBenevoles}{' '}
              {t.volunteers.toLowerCase()}
            </span>

            <button
              type="button"
              onClick={() => setFiltersOpen((value) => !value)}
              aria-expanded={filtersOpen}
              className="inline-flex shrink-0 items-center gap-1 font-medium text-slate-700"
            >
              <SlidersHorizontal size={15} />
              {t.filters}
              {activeFilters > 0 && (
                <span className="rounded-full bg-[#d94a0b] px-1.5 text-xs text-white">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {filtersOpen && (
            <div className="mt-3 space-y-2">
              {(isGlobalViewer ||
                (isAssociation &&
                  associationScope === 'all')) && (
                <select
                  aria-label={t.allAssociations}
                  value={associationFilter}
                  onChange={(event) =>
                    setAssociationFilter(event.target.value)
                  }
                  className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
                >
                  <option value="all">{t.allAssociations}</option>

                  {availableAssociations.map((association) => (
                    <option key={association} value={association}>
                      {association}
                    </option>
                  ))}
                </select>
              )}

              <select
                aria-label={t.allTypes}
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
              >
                <option value="all">{t.allTypes}</option>

                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatAidType(type, language)}
                  </option>
                ))}
              </select>

              <select
                aria-label={t.allStatuses}
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
              >
                <option value="all">{t.allStatuses}</option>
                <option value="prevue">{t.planned}</option>
                <option value="en_cours">{t.ongoing}</option>
              </select>

              {activeFilters > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-sm font-medium text-[#d94a0b]"
                >
                  {t.reset}
                </button>
              )}
            </div>
          )}
        </div>

        {/* LISTE DES INTERVENTIONS */}

        <section className="mt-4">
          <h2 className="sr-only">
            {periodMode === 'today'
              ? t.dayInterventions
              : periodMode === 'week'
                ? t.weekInterventions
                : t.monthInterventions}
          </h2>

          {periodInterventions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-semibold text-slate-950">
                {t.noIntervention}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {t.noActions}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {periodInterventions.map((intervention) => {
                const date = getInterventionDate(intervention)

                const meta = [
                  `${intervention.nombre_repas ?? 0} ${t.meals.toLowerCase()}`,
                  `${intervention.nombre_benevoles ?? 0} ${t.volunteers.toLowerCase()}`,
                ].join(' · ')

                return (
                  <article
                    key={intervention.id}
                    className="flex min-w-0 gap-4 rounded-xl border border-slate-200 bg-white p-4"
                  >
                    {/* Aujourd'hui : l'heure. Semaine / mois : la date. */}
                    <div className="w-12 shrink-0 text-center">
                      {periodMode === 'today' || !date ? (
                        <>
                          <p className="font-bold text-slate-950">
                            {shortTime(intervention.heure_debut) ||
                              '--:--'}
                          </p>

                          {intervention.heure_fin && (
                            <p className="text-xs text-slate-500">
                              {shortTime(intervention.heure_fin)}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-2xl font-bold leading-none text-slate-950">
                            {date.getDate()}
                          </p>

                          <p className="mt-1 text-xs uppercase text-slate-500">
                            {date
                              .toLocaleDateString(locale, {
                                month: 'short',
                              })
                              .replace('.', '')}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="break-words font-semibold text-slate-950">
                          {formatAidType(
                            intervention.type_aide,
                            language
                          )}
                        </h3>

                        <span
                          className={`shrink-0 text-xs font-medium ${getStatusClass(
                            intervention.statut
                          )}`}
                        >
                          ● {formatStatus(intervention.statut)}
                        </span>
                      </div>

                      <p className="mt-1 break-words text-sm text-slate-600">
                        {periodMode !== 'today' &&
                          intervention.heure_debut && (
                            <>
                              {shortTime(intervention.heure_debut)}
                              {intervention.heure_fin &&
                                ` – ${shortTime(intervention.heure_fin)}`}{' '}
                              ·{' '}
                            </>
                          )}
                        {intervention.association_nom ||
                          t.association}{' '}
                        ·{' '}
                        {intervention.points?.adresse || t.noAddress}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {meta}
                      </p>

                      {intervention.commentaire?.trim() && (
                        <p className="mt-2 break-words text-sm italic text-slate-500">
                          « {intervention.commentaire} »
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 whitespace-nowrap text-sm font-semibold">
                        <Link
                          to={
                            intervention.point_id
                              ? `/carte?pointId=${encodeURIComponent(
                                  intervention.point_id
                                )}`
                              : '/carte'
                          }
                          className="text-[#d94a0b]"
                        >
                          {t.onMap}
                        </Link>

                        {intervention.point_id && (
                          <Link
                            to={`/points/${intervention.point_id}`}
                            className="text-slate-600"
                          >
                            {t.viewPoint}
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
