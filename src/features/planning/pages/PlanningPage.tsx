import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getInterventions, type Intervention } from '@/features/interventions/api/interventions'

type ViewMode = 'week' | 'month' | 'year'

function startOfWeek(date: Date) {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1)
  copy.setDate(diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function addDays(date: Date, days: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getMonthDays(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const lastDay = new Date(year, month + 1, 0)

  return Array.from({ length: lastDay.getDate() }, (_, index) => {
    return new Date(year, month, index + 1)
  })
}

function formatDate(date: Date) {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  })
}

function formatFullDate(value: string | null) {
  if (!value) return 'Date non renseignée'

  return new Date(value).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
}

function getInterventionColor(type: string | null) {
  const value = type?.toLowerCase() || ''

  if (value.includes('repas')) return 'bg-orange-50 text-orange-700 ring-orange-200'
  if (value.includes('eau')) return 'bg-blue-50 text-blue-700 ring-blue-200'
  if (value.includes('soin')) return 'bg-red-50 text-red-700 ring-red-200'
  if (value.includes('vêtement') || value.includes('vetement')) {
    return 'bg-purple-50 text-purple-700 ring-purple-200'
  }

  return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
}

function getUniqueValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value && value.trim())))
  ).sort((a, b) => a.localeCompare(b))
}

function getInterventionTitle(intervention: Intervention) {
  return intervention.association_nom || 'Association non renseignée'
}

function getInterventionAddress(intervention: Intervention) {
  return intervention.points?.adresse || 'Adresse non renseignée'
}

export default function PlanningPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [search, setSearch] = useState('')
  const [associationFilter, setAssociationFilter] = useState('all')
  const [addressFilter, setAddressFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

  const { data: interventions = [], isLoading, isError, error } = useQuery({
    queryKey: ['interventions'],
    queryFn: getInterventions,
  })

  const associations = useMemo(
    () => getUniqueValues(interventions.map((item) => item.association_nom)),
    [interventions]
  )

  const addresses = useMemo(
    () => getUniqueValues(interventions.map((item) => item.points?.adresse)),
    [interventions]
  )

  const typesAide = useMemo(
    () => getUniqueValues(interventions.map((item) => item.type_aide)),
    [interventions]
  )

  const filteredInterventions = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase()

    return interventions.filter((intervention) => {
      const text = [
        intervention.association_nom,
        intervention.type_aide,
        intervention.points?.adresse,
        intervention.commentaire,
        intervention.statut,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = cleanSearch.length === 0 || text.includes(cleanSearch)

      const matchesAssociation =
        associationFilter === 'all' ||
        intervention.association_nom === associationFilter

      const matchesAddress =
        addressFilter === 'all' ||
        intervention.points?.adresse === addressFilter

      const matchesType =
        typeFilter === 'all' || intervention.type_aide === typeFilter

      return matchesSearch && matchesAssociation && matchesAddress && matchesType
    })
  }, [interventions, search, associationFilter, addressFilter, typeFilter])

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate)
    return Array.from({ length: 7 }, (_, index) => addDays(start, index))
  }, [currentDate])

  const monthDays = useMemo(() => getMonthDays(currentDate), [currentDate])

  const currentYear = currentDate.getFullYear()

  function goPrevious() {
    const copy = new Date(currentDate)

    if (viewMode === 'week') copy.setDate(copy.getDate() - 7)
    if (viewMode === 'month') copy.setMonth(copy.getMonth() - 1)
    if (viewMode === 'year') copy.setFullYear(copy.getFullYear() - 1)

    setCurrentDate(copy)
    setSelectedDay(null)
    setSelectedMonth(null)
  }

  function goNext() {
    const copy = new Date(currentDate)

    if (viewMode === 'week') copy.setDate(copy.getDate() + 7)
    if (viewMode === 'month') copy.setMonth(copy.getMonth() + 1)
    if (viewMode === 'year') copy.setFullYear(copy.getFullYear() + 1)

    setCurrentDate(copy)
    setSelectedDay(null)
    setSelectedMonth(null)
  }

  function resetFilters() {
    setSearch('')
    setAssociationFilter('all')
    setAddressFilter('all')
    setTypeFilter('all')
  }

  function getInterventionsForDay(day: Date) {
    return filteredInterventions.filter((intervention) => {
      if (!intervention.date_intervention) return false
      return sameDay(new Date(intervention.date_intervention), day)
    })
  }

  function getInterventionsForMonth(monthIndex: number) {
    return filteredInterventions.filter((intervention) => {
      if (!intervention.date_intervention) return false

      const date = new Date(intervention.date_intervention)

      return date.getFullYear() === currentYear && date.getMonth() === monthIndex
    })
  }

  const selectedDayInterventions = selectedDay ? getInterventionsForDay(selectedDay) : []

  const selectedMonthInterventions =
    selectedMonth !== null ? getInterventionsForMonth(selectedMonth) : []

  const activeDetailInterventions =
    viewMode === 'year' ? selectedMonthInterventions : selectedDayInterventions

  const totalRepas = filteredInterventions.reduce(
    (total, intervention) => total + (intervention.nombre_repas ?? 0),
    0
  )

  const totalBenevoles = filteredInterventions.reduce(
    (total, intervention) => total + (intervention.nombre_benevoles ?? 0),
    0
  )

  const [mobilePeriod, setMobilePeriod] = useState<'today' | 'week' | 'month'>('today')

  const mobileInterventions = useMemo(() => {
  const today = new Date()

  return filteredInterventions.filter((intervention) => {
    if (!intervention.date_intervention) return false

    const date = new Date(intervention.date_intervention)

    if (mobilePeriod === 'today') {
      return sameDay(date, today)
    }

    if (mobilePeriod === 'week') {
      const start = startOfWeek(today)
      const end = addDays(start, 6)
      return date >= start && date <= end
    }

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth()
    )
  })
}, [filteredInterventions, mobilePeriod])

return (
    <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d94a0b]">
              Organisation terrain
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-950">
              Planning des interventions
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-600">
              Vue semaine, mois ou année avec filtres par association, adresse et type d’aide.
            </p>
          </div>

          <Link
            to="/interventions/new"
            className="rounded-2xl bg-[#d94a0b] px-5 py-3 text-center text-sm font-black text-white"
          >
            Déclarer une intervention
          </Link>
        </div>
{!isLoading && !isError && (
  <div className="space-y-4 lg:hidden">
    <div className="rounded-[2rem] border border-[#eadfd6] bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d94a0b]">
        Planning mobile
      </p>

      <h2 className="mt-2 text-2xl font-black text-slate-950">
        Prochaines interventions
      </h2>

      <p className="mt-1 text-sm font-semibold text-slate-500">
        Vue simple pour suivre les actions terrain rapidement.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xl font-black text-slate-950">
            {filteredInterventions.length}
          </p>
          <p className="text-[10px] font-bold uppercase text-slate-500">
            Actions
          </p>
        </div>

        <div className="rounded-2xl bg-orange-50 p-3">
          <p className="text-xl font-black text-orange-700">
            {totalRepas}
          </p>
          <p className="text-[10px] font-bold uppercase text-orange-600">
            Repas
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-3">
          <p className="text-xl font-black text-emerald-700">
            {totalBenevoles}
          </p>
          <p className="text-[10px] font-bold uppercase text-emerald-600">
            Bénévoles
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
  <button
    type="button"
    onClick={() => setMobilePeriod('today')}
    className={`rounded-xl px-3 py-2 text-xs font-black ${
      mobilePeriod === 'today'
        ? 'bg-white text-[#d94a0b] shadow-sm'
        : 'text-slate-500'
    }`}
  >
    Aujourd’hui
  </button>

  <button
    type="button"
    onClick={() => setMobilePeriod('week')}
    className={`rounded-xl px-3 py-2 text-xs font-black ${
      mobilePeriod === 'week'
        ? 'bg-white text-[#d94a0b] shadow-sm'
        : 'text-slate-500'
    }`}
  >
    Semaine
  </button>

  <button
    type="button"
    onClick={() => setMobilePeriod('month')}
    className={`rounded-xl px-3 py-2 text-xs font-black ${
      mobilePeriod === 'month'
        ? 'bg-white text-[#d94a0b] shadow-sm'
        : 'text-slate-500'
    }`}
  >
    Mois
  </button>
</div>

    <div className="space-y-3">
      {mobileInterventions.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-5 text-sm font-semibold text-slate-500">
          Aucune intervention trouvée.
        </div>
      ) : (
        mobileInterventions.map((intervention) => (
          <button
            key={intervention.id}
            type="button"
            onClick={() => {
              if (intervention.date_intervention) {
                setSelectedDay(new Date(intervention.date_intervention))
                setSelectedMonth(null)
              }
            }}
            className="w-full rounded-[1.7rem] border border-[#eadfd6] bg-white p-4 text-left shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#d94a0b]">
                  {formatFullDate(intervention.date_intervention)}
                </p>

                <h3 className="mt-2 text-lg font-black text-slate-950">
                  {intervention.association_nom || 'Association'}
                </h3>

                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {intervention.points?.adresse || 'Adresse non renseignée'}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black ring-1 ${getInterventionColor(
                  intervention.type_aide
                )}`}
              >
                {intervention.type_aide || 'Aide'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-500">
                  Heure
                </p>
                <p className="mt-1 text-sm font-black text-slate-950">
                  {intervention.heure_debut || '--:--'}
                </p>
              </div>

              <div className="rounded-2xl bg-orange-50 p-3">
                <p className="text-[10px] font-bold uppercase text-orange-600">
                  Repas
                </p>
                <p className="mt-1 text-sm font-black text-orange-700">
                  {intervention.nombre_repas ?? 0}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-3">
                <p className="text-[10px] font-bold uppercase text-emerald-600">
                  Bénévoles
                </p>
                <p className="mt-1 text-sm font-black text-emerald-700">
                  {intervention.nombre_benevoles ?? 0}
                </p>
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  </div>
)}
        <div className="mb-6 rounded-[2rem] border border-[#eadfd6] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
                {(['week', 'month', 'year'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setViewMode(mode)
                      setSelectedDay(null)
                      setSelectedMonth(null)
                    }}
                    className={`rounded-xl px-4 py-2 text-sm font-black transition ${
                      viewMode === mode
                        ? 'bg-white text-[#d94a0b] shadow-sm'
                        : 'text-slate-500'
                    }`}
                  >
                    {mode === 'week' && 'Semaine'}
                    {mode === 'month' && 'Mois'}
                    {mode === 'year' && 'Année'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrevious}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentDate(new Date())
                    setSelectedDay(null)
                    setSelectedMonth(null)
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700"
                >
                  Aujourd’hui
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700"
                >
                  →
                </button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher..."
                className="min-h-11 rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
              />

              <select
                value={associationFilter}
                onChange={(event) => setAssociationFilter(event.target.value)}
                className="min-h-11 rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
              >
                <option value="all">Toutes les associations</option>
                {associations.map((association) => (
                  <option key={association} value={association}>
                    {association}
                  </option>
                ))}
              </select>

              <select
                value={addressFilter}
                onChange={(event) => setAddressFilter(event.target.value)}
                className="min-h-11 rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
              >
                <option value="all">Toutes les adresses</option>
                {addresses.map((address) => (
                  <option key={address} value={address}>
                    {address}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="min-h-11 rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
              >
                <option value="all">Tous les types d’aide</option>
                {typesAide.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={resetFilters}
                className="min-h-11 rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm font-black text-slate-700 hover:bg-slate-100"
              >
                Réinitialiser
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-2xl font-black text-slate-950">
                  {filteredInterventions.length}
                </p>
                <p className="text-xs font-bold uppercase text-slate-500">
                  Interventions
                </p>
              </div>

              <div className="rounded-2xl bg-orange-50 p-4">
                <p className="text-2xl font-black text-orange-700">
                  {totalRepas}
                </p>
                <p className="text-xs font-bold uppercase text-orange-600">
                  Repas
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-2xl font-black text-emerald-700">
                  {totalBenevoles}
                </p>
                <p className="text-xs font-bold uppercase text-emerald-600">
                  Bénévoles
                </p>
              </div>
            </div>

            <h2 className="text-xl font-black capitalize text-slate-950">
              {viewMode === 'year' ? currentYear : formatMonthYear(currentDate)}
            </h2>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-3xl bg-white p-8 text-slate-600">
            Chargement du planning...
          </div>
        )}

        {isError && (
          <div className="rounded-3xl bg-red-50 p-8 text-red-700">
            {(error as Error)?.message || 'Impossible de charger le planning.'}
          </div>
        )}

        {!isLoading && !isError && viewMode === 'week' && (
  <div className="hidden gap-4 lg:grid lg:grid-cols-7">
            {weekDays.map((day) => {
              const dayInterventions = getInterventionsForDay(day)

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day)
                    setSelectedMonth(null)
                  }}
                  className="min-h-[220px] rounded-3xl border border-[#eadfd6] bg-white p-4 text-left shadow-sm transition hover:border-orange-200 hover:bg-orange-50/30"
                >
                  <p className="text-sm font-black capitalize text-slate-950">
                    {formatDate(day)}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {dayInterventions.length} intervention(s)
                  </p>

                  <div className="mt-4 space-y-2">
                    {dayInterventions.slice(0, 4).map((intervention) => (
                      <div
                        key={intervention.id}
                        className={`rounded-2xl p-3 text-xs font-bold ring-1 ${getInterventionColor(
                          intervention.type_aide
                        )}`}
                      >
                        <p className="font-black">
                          {getInterventionTitle(intervention)}
                        </p>
                        <p className="mt-1 truncate">{intervention.type_aide}</p>
                        <p className="mt-1 truncate text-slate-500">
                          {getInterventionAddress(intervention)}
                        </p>
                      </div>
                    ))}

                    {dayInterventions.length > 4 && (
                      <p className="text-xs font-black text-slate-500">
                        + {dayInterventions.length - 4} autre(s)
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {!isLoading && !isError && viewMode === 'month' && (
  <div className="hidden gap-4 sm:grid-cols-2 lg:grid lg:grid-cols-4 xl:grid-cols-7">
            {monthDays.map((day) => {
              const dayInterventions = getInterventionsForDay(day)

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day)
                    setSelectedMonth(null)
                  }}
                  className="min-h-[180px] rounded-3xl border border-[#eadfd6] bg-white p-4 text-left shadow-sm transition hover:border-orange-200 hover:bg-orange-50/30"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-black text-slate-950">
                      {day.getDate()}
                    </p>

                    <p className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600">
                      {dayInterventions.length}
                    </p>
                  </div>

                  <div className="mt-3 space-y-2">
                    {dayInterventions.slice(0, 3).map((intervention) => (
                      <div
                        key={intervention.id}
                        className={`rounded-xl p-2 text-[11px] font-bold ring-1 ${getInterventionColor(
                          intervention.type_aide
                        )}`}
                      >
                        <p className="truncate">
                          {getInterventionTitle(intervention)}
                        </p>
                        <p className="truncate">{intervention.type_aide}</p>
                      </div>
                    ))}

                    {dayInterventions.length > 3 && (
                      <p className="text-xs font-bold text-slate-500">
                        + {dayInterventions.length - 3} autre(s)
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

{!isLoading && !isError && viewMode === 'year' && (
  <div className="hidden gap-5 sm:grid-cols-2 lg:grid lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }, (_, monthIndex) => {
              const monthInterventions = getInterventionsForMonth(monthIndex)
              const monthName = new Date(currentYear, monthIndex, 1).toLocaleDateString(
                'fr-FR',
                { month: 'long' }
              )

              const repas = monthInterventions.reduce(
                (total, intervention) => total + (intervention.nombre_repas ?? 0),
                0
              )

              const benevoles = monthInterventions.reduce(
                (total, intervention) =>
                  total + (intervention.nombre_benevoles ?? 0),
                0
              )

              return (
                <button
                  key={monthName}
                  type="button"
                  onClick={() => {
                    setSelectedMonth(monthIndex)
                    setSelectedDay(null)
                  }}
                  className="rounded-[2rem] border border-[#eadfd6] bg-white p-5 text-left shadow-sm transition hover:border-orange-200 hover:bg-orange-50/30"
                >
                  <h3 className="text-xl font-black capitalize text-slate-950">
                    {monthName}
                  </h3>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xl font-black text-slate-950">
                        {monthInterventions.length}
                      </p>
                      <p className="text-[10px] font-bold uppercase text-slate-500">
                        Actions
                      </p>
                    </div>

                    <div className="rounded-2xl bg-orange-50 p-3">
                      <p className="text-xl font-black text-orange-700">
                        {repas}
                      </p>
                      <p className="text-[10px] font-bold uppercase text-orange-600">
                        Repas
                      </p>
                    </div>

                    <div className="rounded-2xl bg-emerald-50 p-3">
                      <p className="text-xl font-black text-emerald-700">
                        {benevoles}
                      </p>
                      <p className="text-[10px] font-bold uppercase text-emerald-600">
                        Bénévoles
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {(selectedDay || selectedMonth !== null) && (
          <div className="fixed inset-0 z-[3000] bg-slate-950/40 p-4 backdrop-blur-sm">
            <div className="mx-auto flex max-h-[92vh] max-w-3xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d94a0b]">
                      Détail des interventions
                    </p>

                    <h3 className="mt-2 text-2xl font-black text-slate-950">
                      {viewMode === 'year' && selectedMonth !== null
                        ? new Date(currentYear, selectedMonth, 1).toLocaleDateString(
                            'fr-FR',
                            { month: 'long', year: 'numeric' }
                          )
                        : selectedDay
                          ? formatFullDate(selectedDay.toISOString())
                          : ''}
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {activeDetailInterventions.length} intervention(s)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDay(null)
                      setSelectedMonth(null)
                    }}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto p-5">
                {activeDetailInterventions.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                    Aucune intervention sur cette période.
                  </div>
                ) : (
                  activeDetailInterventions.map((intervention) => (
                    <div
                      key={intervention.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-lg font-black text-slate-950">
                            {getInterventionTitle(intervention)}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-600">
                            {getInterventionAddress(intervention)}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {formatFullDate(intervention.date_intervention)} —{' '}
                            {intervention.heure_debut || '--:--'} à{' '}
                            {intervention.heure_fin || '--:--'}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${getInterventionColor(
                            intervention.type_aide
                          )}`}
                        >
                          {intervention.type_aide || 'Aide'}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-orange-50 p-3">
                          <p className="text-xl font-black text-orange-700">
                            {intervention.nombre_repas ?? 0}
                          </p>
                          <p className="text-xs font-bold uppercase text-orange-600">
                            Repas
                          </p>
                        </div>

                        <div className="rounded-2xl bg-emerald-50 p-3">
                          <p className="text-xl font-black text-emerald-700">
                            {intervention.nombre_benevoles ?? 0}
                          </p>
                          <p className="text-xs font-bold uppercase text-emerald-600">
                            Bénévoles
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-sm font-black text-slate-700">
                            {intervention.statut || 'Non renseigné'}
                          </p>
                          <p className="text-xs font-bold uppercase text-slate-500">
                            Statut
                          </p>
                        </div>
                      </div>

                      {intervention.commentaire && (
                        <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">
                          {intervention.commentaire}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}