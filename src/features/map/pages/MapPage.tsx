import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { divIcon } from 'leaflet'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from 'react-leaflet'
import { getPoints } from '@/features/points/api/points'
import {
  getInterventions,
  type Intervention,
} from '@/features/interventions/api/interventions'
import {
  formatPointLabel,
  getStatusBadgeClass,
  getUrgencyBadgeClass,
  getUrgencyMarkerColor,
} from '@/shared/utils/pointStyles'

const DEFAULT_CENTER: [number, number] = [48.8566, 2.3522]

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: () => {
      onMapClick()
    },
    dragstart: () => {
      onMapClick()
    },
    zoomstart: () => {
      onMapClick()
    },
  })

  return null
}

function isValidCoordinate(latitude: number | null, longitude: number | null) {
  if (latitude === null || longitude === null) return false
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return false
  if (latitude === 0 && longitude === 0) return false

  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  )
}

function normalizeText(value: string | null | undefined) {
  return value?.toLowerCase().trim() || ''
}

function splitNeeds(value: string | null) {
  if (!value) return []

  return value
    .split(',')
    .map((need) => need.trim())
    .filter(Boolean)
}

function getNeedIcon(need: string) {
  const normalizedNeed = need.toLowerCase()

  if (normalizedNeed.includes('repas')) return '🍽️'
  if (normalizedNeed.includes('eau')) return '💧'
  if (normalizedNeed.includes('hygiène')) return '🧼'
  if (
    normalizedNeed.includes('vetement') ||
    normalizedNeed.includes('vêtement')
  ) {
    return '👕'
  }
  if (normalizedNeed.includes('couverture')) return '🛏️'
  if (normalizedNeed.includes('soin')) return '🏥'

  return '📦'
}

function formatShortDate(value: string | null | undefined) {
  if (!value) return 'Non renseignée'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Non renseignée'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatTimeRange(start: string | null, end: string | null) {
  if (!start && !end) return 'Horaire non renseigné'
  if (start && end) return `${start} - ${end}`
  return start || end || 'Horaire non renseigné'
}

function truncateText(value: string, maxLength = 70) {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength)}...`
}

function createPointIcon(
  urgency: string | null | undefined,
  interventionCount: number
) {
  const color = getUrgencyMarkerColor(urgency)
  const isCritical = urgency === 'critique'
  const size = isCritical ? 40 : 38
  const label = isCritical ? '!' : ''
  const hasInterventions = interventionCount > 0

  return divIcon({
    className: '',
    html: `
      <div
        style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
        "
      >
        <div
          style="
            width: ${size}px;
            height: ${size}px;
            border-radius: 9999px;
            background: ${color};
            border: 4px solid white;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.25), 0 0 0 12px ${color}26;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            font-weight: 900;
            line-height: 1;
          "
        >
          ${label}
        </div>

        ${
          hasInterventions
            ? `
              <div
                style="
                  position: absolute;
                  right: -10px;
                  top: -10px;
                  min-width: 24px;
                  height: 24px;
                  padding: 0 6px;
                  border-radius: 9999px;
                  background: #059669;
                  border: 3px solid white;
                  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.25);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 12px;
                  font-weight: 900;
                "
              >
                ${interventionCount}
              </div>
            `
            : ''
        }
      </div>
    `,
    iconSize: [size + 12, size + 12],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

export default function MapPage() {
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [needFilter, setNeedFilter] = useState('all')
  const [showMapControls, setShowMapControls] = useState(true)

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

  const interventionsByPointId = useMemo(() => {
    const grouped: Record<string, Intervention[]> = {}

    interventions.forEach((intervention) => {
      if (!intervention.point_id) return

      if (!grouped[intervention.point_id]) {
        grouped[intervention.point_id] = []
      }

      grouped[intervention.point_id].push(intervention)
    })

    Object.values(grouped).forEach((items) => {
      items.sort((a, b) => {
        const dateA = a.date_intervention
          ? new Date(a.date_intervention).getTime()
          : 0
        const dateB = b.date_intervention
          ? new Date(b.date_intervention).getTime()
          : 0

        return dateB - dateA
      })
    })

    return grouped
  }, [interventions])

  const pointsWithCoordinates = useMemo(
    () =>
      points.filter(
        (point) =>
          point.actif !== false &&
          isValidCoordinate(point.latitude, point.longitude)
      ),
    [points]
  )

  const availableNeeds = useMemo(() => {
    const needs = pointsWithCoordinates.flatMap((point) =>
      splitNeeds(point.besoins)
    )

    return Array.from(new Set(needs)).sort((a, b) => a.localeCompare(b))
  }, [pointsWithCoordinates])

  const filteredPoints = useMemo(() => {
    const normalizedSearch = normalizeText(search)

    return pointsWithCoordinates.filter((point) => {
      const address = normalizeText(point.adresse)
      const typology = normalizeText(point.typologie)
      const needs = normalizeText(point.besoins)
      const comment = normalizeText(point.commentaire)

      const pointInterventions = interventionsByPointId[point.id] ?? []
      const interventionsText = pointInterventions
        .map((intervention) =>
          [
            intervention.type_aide,
            intervention.commentaire,
            intervention.statut,
            intervention.date_intervention,
          ]
            .filter(Boolean)
            .join(' ')
        )
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        normalizedSearch.length === 0 ||
        address.includes(normalizedSearch) ||
        typology.includes(normalizedSearch) ||
        needs.includes(normalizedSearch) ||
        comment.includes(normalizedSearch) ||
        interventionsText.includes(normalizedSearch)

      const matchesUrgency =
        urgencyFilter === 'all' || point.niveau_urgence === urgencyFilter

      const matchesStatus =
        statusFilter === 'all' || point.statut === statusFilter

      const matchesNeed =
        needFilter === 'all' ||
        splitNeeds(point.besoins).some(
          (need) => normalizeText(need) === normalizeText(needFilter)
        )

      return matchesSearch && matchesUrgency && matchesStatus && matchesNeed
    })
  }, [
    pointsWithCoordinates,
    interventionsByPointId,
    search,
    urgencyFilter,
    statusFilter,
    needFilter,
  ])

  const urgentCount = filteredPoints.filter(
    (point) =>
      point.niveau_urgence === 'critique' || point.niveau_urgence === 'haute'
  ).length

  const interventionsOnVisiblePoints = filteredPoints.reduce((total, point) => {
    return total + (interventionsByPointId[point.id]?.length ?? 0)
  }, 0)

  const isLoading = isLoadingPoints || isLoadingInterventions
  const isError = isPointsError || isInterventionsError

  function resetFilters() {
    setSearch('')
    setUrgencyFilter('all')
    setStatusFilter('all')
    setNeedFilter('all')
  }

  function hideControls() {
    setShowMapControls(false)
    setShowFilters(false)
  }

  return (
    <div className="relative h-[calc(100dvh-80px)] min-h-[520px] w-full overflow-hidden bg-[#faf8f4]">
      {isLoading && (
        <div className="flex h-full items-center justify-center p-8 text-slate-600">
          Chargement de la carte...
        </div>
      )}

      {isError && (
        <div className="flex h-full items-center justify-center p-8 text-center text-red-600">
          {(pointsError as Error)?.message ||
            (interventionsError as Error)?.message ||
            'Erreur lors du chargement de la carte.'}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={11}
            scrollWheelZoom
            className="h-full w-full"
          >
            <MapClickHandler onMapClick={hideControls} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredPoints.map((point) => {
              const pointInterventions = interventionsByPointId[point.id] ?? []

              const totalRepas = pointInterventions.reduce(
                (total, intervention) =>
                  total + (intervention.nombre_repas ?? 0),
                0
              )

              const totalBenevoles = pointInterventions.reduce(
                (total, intervention) =>
                  total + (intervention.nombre_benevoles ?? 0),
                0
              )

              const latestIntervention = pointInterventions[0]

              return (
                <Marker
                  key={point.id}
                  position={[point.latitude!, point.longitude!]}
                  icon={createPointIcon(
                    point.niveau_urgence,
                    pointInterventions.length
                  )}
                >
                  <Popup maxWidth={390} minWidth={320}>
  <div className="w-[360px] max-w-[74vw] overflow-hidden rounded-2xl bg-white text-[12px]">
    <div className="border-b border-slate-100 bg-slate-50 px-3 py-2.5">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
        Point signalé
      </p>

      <h3 className="mt-1 text-sm font-black leading-snug text-slate-950">
        {point.adresse || 'Adresse non renseignée'}
      </h3>

      <div className="mt-2 flex flex-wrap gap-1">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${getUrgencyBadgeClass(
          point.niveau_urgence
          )}`}
        >
          {formatPointLabel(point.niveau_urgence)}
        </span>

        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${getStatusBadgeClass(
            point.statut
          )}`}
        >
          {formatPointLabel(point.statut)}
        </span>

        {pointInterventions.length > 0 && (
          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white">
          {pointInterventions.length}
          </span>
        )}
      </div>
    </div>

    <div className="grid gap-2 p-3 sm:grid-cols-[1fr_0.9fr]">
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-50 p-2.5">
            <p className="text-[9px] font-bold uppercase text-slate-500">
              Personnes
            </p>
            <p className="mt-1 text-lg font-black text-slate-950">
              {point.nombre_personnes_estime ?? '—'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-2.5">
            <p className="text-[9px] font-bold uppercase text-slate-500">
              Fiabilité
            </p>
            <p className="mt-1 text-[11px] font-black text-slate-950">
              {formatPointLabel(point.niveau_fiabilite)}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-1 text-[9px] font-bold uppercase text-slate-500">
            Besoins
          </p>

          {splitNeeds(point.besoins).length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {splitNeeds(point.besoins)
                .slice(0, 4)
                .map((need) => (
                  <span
                    key={need}
                    className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 ring-1 ring-orange-200"
                  >
                    {getNeedIcon(need)} {need}
                  </span>
                ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500">
              Aucun besoin renseigné.
            </p>
          )}
        </div>

        {point.commentaire && point.commentaire.trim().length > 0 && (
          <div className="rounded-xl border-l-4 border-orange-500 bg-orange-50 p-2.5">
            <p className="text-[11px] italic leading-snug text-slate-700">
              {truncateText(point.commentaire, 65)}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[9px] font-black uppercase text-emerald-700">
              Interventions
            </p>

            <p className="mt-1 text-xs font-black text-emerald-900">
              {pointInterventions.length > 0
                ? `${pointInterventions.length} déclarée(s)`
                : 'Aucune'}
            </p>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/80 p-2">
            <p className="text-[9px] font-bold uppercase text-emerald-700">
              Repas
            </p>
            <p className="mt-1 text-base font-black text-emerald-900">
              {totalRepas}
            </p>
          </div>

          <div className="rounded-lg bg-white/80 p-2">
            <p className="text-[9px] font-bold uppercase text-emerald-700">
              Bénévoles
            </p>
            <p className="mt-1 text-base font-black text-emerald-900">
              {totalBenevoles}
            </p>
          </div>
        </div>

        {latestIntervention && (
          <div className="mt-2 rounded-lg bg-white p-2 ring-1 ring-emerald-100">
            <p className="text-[11px] font-black leading-snug text-slate-950">
              {latestIntervention.type_aide || 'Intervention'}
            </p>

            <p className="mt-1 text-[10px] font-medium text-slate-500">
              {formatShortDate(latestIntervention.date_intervention)}
            </p>

            <p className="mt-0.5 text-[10px] font-medium text-slate-500">
              {' '}
              {formatTimeRange(
                latestIntervention.heure_debut,
                latestIntervention.heure_fin
              )}
            </p>
          </div>
        )}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-white px-3 py-2.5">
      <Link
        to={`/points/${point.id}`}
        className="rounded-xl bg-[#d94a0b] px-3 py-2 text-center text-[11px] font-black text-white transition hover:bg-[#b93607]"
      >
        Voir détail
      </Link>

      <Link
        to={`/points/${point.id}/edit`}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-[11px] font-black text-slate-700 transition hover:bg-slate-50"
      >
        Modifier
      </Link>
    </div>
  </div>
</Popup>
                </Marker>
              )
            })}
          </MapContainer>

          {showMapControls && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 z-[1000] space-y-3 sm:left-5 sm:right-5 sm:top-5">
              <div className="pointer-events-auto rounded-3xl bg-[#faf8f4]/95 p-4 shadow-xl shadow-slate-900/10 ring-1 ring-[#eadfd6] backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-xl text-[#d94a0b]">
                      ⊙
                    </div>

                    <div>
                      <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                        Carte terrain
                      </h1>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Vue temps réel
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={hideControls}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm hover:bg-slate-50"
                  >
                    Masquer
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-[#e7ddd4] bg-white px-3 py-3 shadow-sm">
                    <p className="text-xl font-extrabold text-slate-900">
                      {filteredPoints.length}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Points
                    </p>
                  </div>

                  <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-3 shadow-sm">
                    <p className="text-xl font-extrabold text-red-600">
                      {urgentCount}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-red-500">
                      Urgents
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 shadow-sm">
                    <p className="text-xl font-extrabold text-emerald-700">
                      {interventionsOnVisiblePoints}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                      Interventions
                    </p>
                  </div>
                </div>
              </div>

              <div className="pointer-events-auto flex flex-col gap-2 sm:max-w-3xl sm:flex-row">
                <div className="flex flex-1 items-center gap-3 rounded-3xl bg-white px-4 py-3 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Rechercher une adresse, un lieu, une intervention..."
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:text-base"
                  />

                  <span className="text-xl text-slate-400">⌕</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters((value) => !value)}
                  className="rounded-3xl bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 transition hover:bg-orange-50 hover:text-[#d94a0b] sm:px-5 sm:text-base"
                >
                  Filtres
                </button>
              </div>

              {showFilters && (
                <div className="pointer-events-auto rounded-3xl bg-white p-4 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200 sm:max-w-3xl">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        Urgence
                      </label>
                      <select
                        value={urgencyFilter}
                        onChange={(event) =>
                          setUrgencyFilter(event.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      >
                        <option value="all">Toutes</option>
                        <option value="critique">Critique</option>
                        <option value="haute">Haute</option>
                        <option value="moyenne">Moyenne</option>
                        <option value="basse">Basse</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        Statut
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(event.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      >
                        <option value="all">Tous</option>
                        <option value="signale">Signalé</option>
                        <option value="a_confirmer">À confirmer</option>
                        <option value="confirme">Confirmé</option>
                        <option value="actif">Actif</option>
                        <option value="inactif">Inactif</option>
                        <option value="archive">Archivé</option>
                        <option value="rejete">Rejeté</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        Besoin
                      </label>
                      <select
                        value={needFilter}
                        onChange={(event) => setNeedFilter(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      >
                        <option value="all">Tous</option>
                        {availableNeeds.map((need) => (
                          <option key={need} value={need}>
                            {need}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                      >
                        Réinitialiser
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!showMapControls && (
            <button
              type="button"
              onClick={() => setShowMapControls(true)}
              className="absolute left-3 top-3 z-[1000] rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-xl ring-1 ring-slate-200 transition hover:bg-orange-50 hover:text-[#d94a0b] sm:left-5 sm:top-5"
            >
              ☰ Afficher infos
            </button>
          )}

          {showMapControls && (
            <div className="absolute bottom-4 left-3 z-[1000] rounded-3xl bg-white p-4 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 sm:bottom-6 sm:left-6 sm:p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Urgence
              </p>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-700 sm:gap-x-5 sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-600" />
                  Critique
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-orange-600" />
                  Haute
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-yellow-600" />
                  Moyenne
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-600" />
                  Basse
                </div>
              </div>
            </div>
          )}

          <Link
            to="/points/new"
            className="absolute bottom-4 right-3 z-[1000] flex h-14 items-center gap-2 rounded-3xl bg-[#d94a0b] px-5 text-sm font-bold text-white shadow-2xl shadow-orange-900/30 transition hover:bg-[#b93607] sm:bottom-8 sm:right-8 sm:h-16 sm:gap-3 sm:px-7 sm:text-lg"
          >
            <span className="text-2xl leading-none sm:text-3xl">+</span>
            <span className="hidden sm:inline">Signaler</span>
          </Link>
        </>
      )}
    </div>
  )
}