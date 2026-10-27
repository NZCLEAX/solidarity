
import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

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

function getTypeClass(type: string | null): string {
  const value = type?.toLowerCase() ?? ''

  if (value.includes('repas')) {
    return 'bg-orange-50 text-orange-700'
  }

  if (value.includes('eau')) {
    return 'bg-blue-50 text-blue-700'
  }

  if (value.includes('soin')) {
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
      <div className="min-h-[100dvh] bg-[#faf8f4] px-4 py-6">
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-8 font-semibold text-slate-500">
          {t.loading}
        </div>
      </div>
    )
  }

  if (profileError || interventionsError) {
    return (
      <div className="min-h-[100dvh] bg-[#faf8f4] px-4 py-6">
        <div className="mx-auto max-w-7xl rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
          {interventionsErrorObject instanceof Error
            ? interventionsErrorObject.message
            : t.error}
        </div>
      </div>
    )
  }

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-[100dvh] min-w-0 overflow-x-hidden bg-[#faf8f4] px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-10"
    >
      <div className="mx-auto w-full max-w-7xl">

        {/* HEADER */}

        <header className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d94a0b]">
                {t.subtitle}
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {t.title}
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500">
                {t.description}
              </p>
            </div>

            {canCreateIntervention && (
              <Link
                to="/interventions/new"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#d94a0b] px-5 py-3 text-sm font-black text-white"
              >
                + {t.declare}
              </Link>
            )}
          </div>
        </header>

        {/* SÉLECTION ASSOCIATION */}

        {isAssociation && (
          <section className="mb-4">
            <div className="grid grid-cols-2 rounded-2xl bg-slate-200/70 p-1">
              <button
                type="button"
                onClick={() => {
                  setAssociationScope('mine')
                  setAssociationFilter('all')
                }}
                className={`min-h-11 rounded-xl px-2 text-xs font-black sm:text-sm ${
                  associationScope === 'mine'
                    ? 'bg-white text-[#d94a0b] shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                {t.myAssociation}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAssociationScope('all')
                  setAssociationFilter('all')
                }}
                className={`min-h-11 rounded-xl px-2 text-xs font-black sm:text-sm ${
                  associationScope === 'all'
                    ? 'bg-white text-[#d94a0b] shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                {t.allAssociations}
              </button>
            </div>
          </section>
        )}

        {/* STATISTIQUES */}

        <section className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="min-w-0 rounded-2xl border border-[#eadfd6] bg-white p-3 shadow-sm sm:p-4">
            <p className="text-xl font-black text-slate-950 sm:text-2xl">
              {periodInterventions.length}
            </p>

            <p className="mt-1 text-[10px] font-black uppercase text-slate-400">
              {t.actions}
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-orange-100 bg-orange-50 p-3 shadow-sm sm:p-4">
            <p className="text-xl font-black text-orange-700 sm:text-2xl">
              {totalRepas}
            </p>

            <p className="mt-1 text-[10px] font-black uppercase text-orange-600">
              {t.meals}
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 shadow-sm sm:p-4">
            <p className="text-xl font-black text-emerald-700 sm:text-2xl">
              {totalBenevoles}
            </p>

            <p className="mt-1 text-[10px] font-black uppercase text-emerald-600">
              {t.volunteers}
            </p>
          </div>
        </section>

        {/* CHOIX DE PÉRIODE */}

        <section className="mb-4">
          <div className="grid grid-cols-3 rounded-2xl bg-slate-200/70 p-1">
            {(
              ['today', 'week', 'month'] as PeriodMode[]
            ).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPeriodMode(mode)}
                className={`min-h-11 rounded-xl text-xs font-black sm:text-sm ${
                  periodMode === mode
                    ? 'bg-white text-[#d94a0b] shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                {mode === 'today'
                  ? t.today
                  : mode === 'week'
                    ? t.week
                    : t.month}
              </button>
            ))}
          </div>
        </section>

        {/* NAVIGATION PAR DATE */}

        <section className="mb-4 flex items-center justify-between rounded-2xl border border-[#eadfd6] bg-white p-2 shadow-sm">
          <button
            type="button"
            onClick={previousPeriod}
            aria-label="Période précédente"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-xl font-black text-slate-700"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="min-w-0 flex-1 px-2 text-center"
          >
            <p className="truncate text-sm font-black capitalize text-slate-950">
              {periodMode === 'month'
                ? formatMonth(currentDate)
                : formatDay(currentDate)}
            </p>

            <p className="mt-0.5 text-[11px] font-bold text-[#d94a0b]">
              {t.backToday}
            </p>
          </button>

          <button
            type="button"
            onClick={nextPeriod}
            aria-label="Période suivante"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-xl font-black text-slate-700"
          >
            ›
          </button>
        </section>

        {/* SEMAINE */}

        {periodMode === 'week' && (
          <section className="mb-4 grid grid-cols-7 gap-1 sm:gap-2">
            {weekDays.map((day) => {
              const count = getDayInterventions(day).length
              const active = sameDay(day, currentDate)

              return (
                <button
                  key={day.getTime()}
                  type="button"
                  onClick={() => setCurrentDate(day)}
                  className={`relative min-h-[72px] min-w-0 rounded-xl border px-1 py-2 text-center ${
                    active
                      ? 'border-[#d94a0b] bg-orange-50'
                      : 'border-[#eadfd6] bg-white'
                  }`}
                >
                  <p className="truncate text-[9px] font-black uppercase text-slate-400 sm:text-[11px]">
                    {day
                      .toLocaleDateString(locale, {
                        weekday: 'short',
                      })
                      .replace('.', '')}
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-950">
                    {day.getDate()}
                  </p>

                  {count > 0 && (
                    <span className="mx-auto mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d94a0b] text-[9px] font-black text-white">
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </section>
        )}

        {/* CALENDRIER MENSUEL */}

        {periodMode === 'month' && (
          <section className="mb-4 rounded-[1.5rem] border border-[#eadfd6] bg-white p-3 shadow-sm">
            <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-black uppercase text-slate-400">
              {calendarWeekDays.map((day) => (
                <span key={day.getTime()}>
                  {day.toLocaleDateString(locale, {
                    weekday: 'narrow',
                  })}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
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
                    className={`relative min-h-12 rounded-xl text-sm font-black ${
                      active
                        ? 'bg-[#d94a0b] text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {day.getDate()}

                    {count > 0 && (
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
              })}
            </div>
          </section>
        )}

        {/* FILTRES */}

        <section className="mb-6">
          <button
            type="button"
            onClick={() =>
              setFiltersOpen((value) => !value)
            }
            className="flex min-h-11 items-center rounded-xl border border-[#eadfd6] bg-white px-4 text-sm font-black text-slate-700 shadow-sm"
          >
            {t.filters}

            {activeFilters > 0 && (
              <span className="ml-2 rounded-full bg-[#d94a0b] px-2 py-0.5 text-[10px] text-white">
                {activeFilters}
              </span>
            )}
          </button>

          {filtersOpen && (
            <div className="mt-3 rounded-[1.5rem] border border-[#eadfd6] bg-white p-4 shadow-sm">
              <div className="grid gap-3 md:grid-cols-3">

                {(isGlobalViewer ||
                  (isAssociation &&
                    associationScope === 'all')) && (
                  <select
                    aria-label={t.allAssociations}
                    value={associationFilter}
                    onChange={(event) =>
                      setAssociationFilter(
                        event.target.value
                      )
                    }
                    className="min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="all">
                      {t.allAssociations}
                    </option>

                    {availableAssociations.map(
                      (association) => (
                        <option
                          key={association}
                          value={association}
                        >
                          {association}
                        </option>
                      )
                    )}
                  </select>
                )}

                <select
                  aria-label={t.allTypes}
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(event.target.value)
                  }
                  className="min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="all">
                    {t.allTypes}
                  </option>

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
                  className="min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="all">
                    {t.allStatuses}
                  </option>

                  <option value="prevue">
                    {t.planned}
                  </option>

                  <option value="en_cours">
                    {t.ongoing}
                  </option>
                </select>
              </div>

              {activeFilters > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-3 text-sm font-black text-[#d94a0b]"
                >
                  {t.reset}
                </button>
              )}
            </div>
          )}
        </section>

        {/* LISTE DES INTERVENTIONS */}

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d94a0b]">
                {t.terrainActions}
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                {periodMode === 'today'
                  ? t.dayInterventions
                  : periodMode === 'week'
                    ? t.weekInterventions
                    : t.monthInterventions}
              </h2>
            </div>

            <span className="shrink-0 text-xs font-black text-slate-400">
              {periodInterventions.length} {t.actions}
            </span>
          </div>

          {periodInterventions.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-[#d8cec5] bg-white p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-xl">
                ◦
              </div>

              <h3 className="mt-4 font-black text-slate-950">
                {t.noIntervention}
              </h3>

              <p className="mt-2 text-sm font-semibold text-slate-500">
                {t.noActions}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {periodInterventions.map((intervention) => (
                <article
                  key={intervention.id}
                  className="min-w-0 rounded-[1.7rem] border border-[#eadfd6] bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0 flex-1">
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
                          {formatStatus(intervention.statut)}
                        </span>
                      </div>

                      <h3 className="mt-3 break-words text-lg font-black text-slate-950">
                        {intervention.association_nom ||
                          t.association}
                      </h3>

                      <p className="mt-1 break-words text-sm font-semibold text-slate-500">
                        {intervention.points?.adresse ||
                          t.noAddress}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-lg font-black text-slate-950">
                        {intervention.heure_debut || '--:--'}
                      </p>

                      {intervention.heure_fin && (
                        <p className="text-xs font-semibold text-slate-400">
                          → {intervention.heure_fin}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-orange-50 p-3">
                      <p className="text-lg font-black text-orange-700">
                        {intervention.nombre_repas ?? 0}
                      </p>

                      <p className="text-[10px] font-black uppercase text-orange-600">
                        {t.meals}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-emerald-50 p-3">
                      <p className="text-lg font-black text-emerald-700">
                        {intervention.nombre_benevoles ?? 0}
                      </p>

                      <p className="text-[10px] font-black uppercase text-emerald-600">
                        {t.volunteers}
                      </p>
                    </div>
                  </div>

                  {intervention.commentaire?.trim() && (
                    <p className="mt-3 line-clamp-2 break-words rounded-xl bg-slate-50 p-3 text-xs font-semibold leading-relaxed text-slate-500">
                      {intervention.commentaire}
                    </p>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {intervention.point_id ? (
                      <Link
                        to={`/points/${intervention.point_id}`}
                        className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-center text-xs font-black text-slate-700"
                      >
                        {t.viewPoint}
                      </Link>
                    ) : (
                      <div />
                    )}

                    <Link
                      to={
                        intervention.point_id
                          ? `/carte?pointId=${encodeURIComponent(
                              intervention.point_id
                            )}`
                          : '/carte'
                      }
                      className="flex min-h-11 items-center justify-center rounded-xl bg-[#d94a0b] px-3 text-center text-xs font-black text-white"
                    >
                      {t.onMap}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
