import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Link,
  useSearchParams,
} from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { divIcon } from 'leaflet'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import { useTranslation } from 'react-i18next'

import { getPoints } from '@/features/points/api/points'
import {
  getInterventions,
  type Intervention,
} from '@/features/interventions/api/interventions'
import { getRepasCoverage } from '@/features/map/utils/coverage'

const DEFAULT_CENTER: [number, number] = [48.8566, 2.3522]

const LOCALES: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
  ar: 'ar',
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: () => void
}) {
  useMapEvents({
    click: onMapClick,
    dragstart: onMapClick,
    zoomstart: onMapClick,
  })

  return null
}

function isValidCoordinate(
  latitude: number | null,
  longitude: number | null
) {
  if (latitude === null || longitude === null) {
    return false
  }

  if (
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    return false
  }

  if (latitude === 0 && longitude === 0) {
    return false
  }

  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  )
}

function MapFocusHandler({
  latitude,
  longitude,
}: {
  latitude: number | null
  longitude: number | null
}) {
  const map = useMap()

  useEffect(() => {
    if (
      latitude === null ||
      longitude === null ||
      !isValidCoordinate(
        latitude,
        longitude
      )
    ) {
      return
    }

    const timeoutId =
      window.setTimeout(() => {
        map.invalidateSize()

        map.flyTo(
          [
            latitude,
            longitude,
          ],
          16,
          {
            animate: true,
            duration: 0.8,
          }
        )
      }, 100)

    return () => {
      window.clearTimeout(
        timeoutId
      )
    }
  }, [
    map,
    latitude,
    longitude,
  ])

  return null
}

function normalizeText(
  value: string | null | undefined
) {
  return value?.toLowerCase().trim() || ''
}

function splitNeeds(value: string | null) {
  if (!value) return []

  return value
    .split(',')
    .map((need) => need.trim())
    .filter(Boolean)
}

function formatShortDate(
  value: string | null | undefined,
  locale: string,
  fallback: string
) {
  if (!value) return fallback

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return fallback
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function getPulseClass(
  urgency: string | null | undefined
) {
  const value = urgency?.toLowerCase()

  if (value === 'critique') {
    return 'pulse-marker pulse-marker-critical'
  }

  if (value === 'haute') {
    return 'pulse-marker pulse-marker-high'
  }

  if (value === 'moyenne') {
    return 'pulse-marker pulse-marker-medium'
  }

  return 'pulse-marker pulse-marker-low'
}

function createPointIcon(
  urgency: string | null | undefined,
  interventionCount: number
) {
  const isCritical = urgency === 'critique'
  const size = isCritical ? 30 : 26
  const hasInterventions = interventionCount > 0

  return divIcon({
    className: '',
    html: `
      <div
        class="pulse-marker-wrapper"
        style="width:${size + 44}px;height:${size + 44}px;"
      >
        <div
          class="${getPulseClass(urgency)}"
          style="width:${size}px;height:${size}px;"
        >
          ${
            isCritical
              ? '<span class="pulse-marker-label">!</span>'
              : ''
          }
        </div>

        ${
          hasInterventions
            ? `
              <div
                class="association-on-point-badge"
                aria-hidden="true"
              ></div>
            `
            : ''
        }
      </div>
    `,
    iconSize: [size + 44, size + 44],
    iconAnchor: [
      (size + 44) / 2,
      (size + 44) / 2,
    ],
    popupAnchor: [0, -size / 2],
  })
}

export default function MapPage() {
  const { t, i18n } = useTranslation()

  const [searchParams] =
    useSearchParams()

  const pointIdFromUrl =
    searchParams.get('pointId')

  const language = (
    i18n.resolvedLanguage ??
    i18n.language ??
    'fr'
  )
    .toLowerCase()
    .split('-')[0]

  const locale = LOCALES[language] ?? 'fr-FR'

  const [mobilePoint, setMobilePoint] =
    useState<any | null>(null)

  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] =
    useState(false)

  const [urgencyFilter, setUrgencyFilter] =
    useState('all')

  const [statusFilter, setStatusFilter] =
    useState('all')

  const [needFilter, setNeedFilter] =
    useState('all')

  const [showMapControls, setShowMapControls] =
    useState(true)

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
    const grouped: Record<
      string,
      Intervention[]
    > = {}

    interventions.forEach((intervention) => {
      if (!intervention.point_id) return

      if (!grouped[intervention.point_id]) {
        grouped[intervention.point_id] = []
      }

      grouped[intervention.point_id].push(
        intervention
      )
    })

    Object.values(grouped).forEach((items) => {
      items.sort((a, b) => {
        const dateA = a.date_intervention
          ? new Date(
              a.date_intervention
            ).getTime()
          : 0

        const dateB = b.date_intervention
          ? new Date(
              b.date_intervention
            ).getTime()
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
        isValidCoordinate(
          point.latitude,
          point.longitude
        )
    ),
  [points]
)

const targetPoint = useMemo(() => {
  if (!pointIdFromUrl) {
    return null
  }

  return (
    pointsWithCoordinates.find(
      (point) =>
        String(point.id) ===
        String(pointIdFromUrl)
    ) ?? null
  )
}, [
  pointIdFromUrl,
  pointsWithCoordinates,
])

useEffect(() => {
  if (!targetPoint) {
    return
  }

  const pointInterventions =
    interventionsByPointId[
      targetPoint.id
    ] ?? []

  const totalRepas =
    pointInterventions.reduce(
      (
        total,
        intervention
      ) =>
        total +
        (intervention.nombre_repas ??
          0),
      0
    )

  const totalBenevoles =
    pointInterventions.reduce(
      (
        total,
        intervention
      ) =>
        total +
        (intervention.nombre_benevoles ??
          0),
      0
    )

  const repasCoverage =
    getRepasCoverage(
      targetPoint.nombre_personnes_estime,
      pointInterventions
    )

  const hasRepasNeed =
    targetPoint.besoins
      ?.toLowerCase()
      .includes('repas') ??
    false

  const latestIntervention =
    pointInterventions[0]

  setMobilePoint({
    ...targetPoint,

    pointInterventions,

    totalRepas,

    totalBenevoles,

    repasCoverage,

    hasRepasNeed,

    latestIntervention,
  })
}, [
  targetPoint,
  interventionsByPointId,
])

  const availableNeeds = useMemo(() => {
    const needs = pointsWithCoordinates.flatMap(
      (point) => splitNeeds(point.besoins)
    )

    return Array.from(new Set(needs)).sort(
      (a, b) => a.localeCompare(b)
    )
  }, [pointsWithCoordinates])

  const filteredPoints = useMemo(() => {
    const normalizedSearch =
      normalizeText(search)

    return pointsWithCoordinates.filter(
      (point) => {
        const address = normalizeText(
          point.adresse
        )

        const typology = normalizeText(
          point.typologie
        )

        const needs = normalizeText(
          point.besoins
        )

        const comment = normalizeText(
          point.commentaire
        )

        const pointInterventions =
          interventionsByPointId[point.id] ?? []

        const interventionsText =
          pointInterventions
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
          interventionsText.includes(
            normalizedSearch
          )

        const matchesUrgency =
          urgencyFilter === 'all' ||
          point.niveau_urgence === urgencyFilter

        const matchesStatus =
          statusFilter === 'all' ||
          point.statut === statusFilter

        const matchesNeed =
          needFilter === 'all' ||
          splitNeeds(point.besoins).some(
            (need) =>
              normalizeText(need) ===
              normalizeText(needFilter)
          )

        return (
          matchesSearch &&
          matchesUrgency &&
          matchesStatus &&
          matchesNeed
        )
      }
    )
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
      point.niveau_urgence === 'critique' ||
      point.niveau_urgence === 'haute'
  ).length

  const interventionsOnVisiblePoints =
    filteredPoints.reduce((total, point) => {
      return (
        total +
        (interventionsByPointId[point.id]
          ?.length ?? 0)
      )
    }, 0)

  const isLoading =
    isLoadingPoints ||
    isLoadingInterventions

  const isError =
    isPointsError ||
    isInterventionsError

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

  function formatUrgency(
    value: string | null | undefined
  ) {
    switch (value) {
      case 'critique':
        return t(
          'map.critique',
          'Critique'
        )

      case 'haute':
        return t(
          'map.haute',
          'Haute'
        )

      case 'moyenne':
        return t(
          'map.moyenne',
          'Moyenne'
        )

      case 'basse':
        return t(
          'map.basse',
          'Basse'
        )

      default:
        return value || '—'
    }
  }

  function formatAidType(
    value: string | null | undefined
  ) {
    if (!value) {
      return t(
        'map.aideNonRenseigne',
        'Aide non renseignée'
      )
    }

    const labels: Record<string, string> = {
      'Distribution de repas': t(
        'map.distributionRepas',
        'Distribution de repas'
      ),

      "Distribution d'eau": t(
        'map.distributionEau',
        "Distribution d'eau"
      ),

      Hygiène: t(
        'map.hygiene',
        'Hygiène'
      ),

      Vêtements: t(
        'map.vetements',
        'Vêtements'
      ),

      Couvertures: t(
        'map.couvertures',
        'Couvertures'
      ),

      Autre: t(
        'map.autre',
        'Autre'
      ),
    }

    return labels[value] ?? value
  }

  const nonRenseignee = t(
    'map.nonRenseigneFeminin',
    'Non renseignée'
  )

  return (
    <div
      dir={i18n.dir()}
      className="relative h-[calc(100dvh-64px)] w-full overflow-hidden bg-[#faf8f4]"
    >
      {isLoading && (
        <div className="flex h-full items-center justify-center p-8 text-slate-600">
          {t(
            'map.chargementDeLaCarte',
            'Chargement de la carte...'
          )}
        </div>
      )}

      {isError && (
        <div className="flex h-full items-center justify-center p-8 text-center text-red-600">
          {(pointsError as Error)?.message ||
            (interventionsError as Error)
              ?.message ||
            t(
              'map.erreurLorsDuChargementDeLaCarte',
              'Erreur lors du chargement de la carte.'
            )}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <MapContainer
  center={DEFAULT_CENTER}
  zoom={11}
  scrollWheelZoom
  zoomControl={false}
  className="h-full w-full"
>
  {targetPoint && (
    <MapFocusHandler
      latitude={
        targetPoint.latitude
      }
      longitude={
        targetPoint.longitude
      }
    />
  )}

  <MapClickHandler
    onMapClick={hideControls}
  />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredPoints.map((point) => {
              const pointInterventions =
                interventionsByPointId[
                  point.id
                ] ?? []

              const totalRepas =
                pointInterventions.reduce(
                  (total, intervention) =>
                    total +
                    (intervention.nombre_repas ??
                      0),
                  0
                )

              const totalBenevoles =
                pointInterventions.reduce(
                  (total, intervention) =>
                    total +
                    (intervention.nombre_benevoles ??
                      0),
                  0
                )

              const repasCoverage =
                getRepasCoverage(
                  point.nombre_personnes_estime,
                  pointInterventions
                )

              const hasRepasNeed =
                point.besoins
                  ?.toLowerCase()
                  .includes('repas') ?? false

              const latestIntervention =
                pointInterventions[0]

              return (
                <Marker
                  key={point.id}
                  position={[
                    point.latitude!,
                    point.longitude!,
                  ]}
                  icon={createPointIcon(
                    point.niveau_urgence,
                    pointInterventions.length
                  )}
                  eventHandlers={{
                    click: (event) => {
                      const isMobile =
                        window.innerWidth < 640

                      if (isMobile) {
                        event.target.closePopup()
                      }

                      setMobilePoint({
                        ...point,
                        pointInterventions,
                        totalRepas,
                        totalBenevoles,
                        repasCoverage,
                        hasRepasNeed,
                        latestIntervention,
                      })
                    },
                  }}
                >
                  <Popup
                    maxWidth={320}
                    className="solidarity-popup"
                  >
                    <div className="w-[300px] rounded-2xl bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                        {t(
                          'map.pointSignal',
                          'Point signalé'
                        )}
                      </p>

                      <h3 className="mt-2 text-base font-black leading-snug text-slate-950">
                        {point.adresse ||
                          t(
                            'map.adresseNonRenseigne',
                            'Adresse non renseignée'
                          )}
                      </h3>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] font-black uppercase text-slate-500">
                            {t(
                              'map.personnes',
                              'Personnes'
                            )}
                          </p>

                          <p className="mt-1 text-2xl font-black text-slate-950">
                            {point.nombre_personnes_estime ??
                              0}
                          </p>
                        </div>

                        <div className="rounded-xl bg-orange-50 p-3">
                          <p className="text-[10px] font-black uppercase text-orange-700">
                            {t(
                              'map.urgence',
                              'Urgence'
                            )}
                          </p>

                          <p className="mt-1 text-lg font-black text-orange-700">
                            {formatUrgency(
                              point.niveau_urgence
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-black uppercase text-slate-500">
                          {t(
                            'map.besoins',
                            'Besoins'
                          )}
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {point.besoins ||
                            t(
                              'map.aucunBesoinRenseign',
                              'Aucun besoin renseigné'
                            )}
                        </p>
                      </div>

                      <div className="mt-3 rounded-xl bg-emerald-50 p-3">
                        <p className="text-[10px] font-black uppercase text-emerald-700">
                          {t(
                            'map.associationsPrsentes',
                            'Associations présentes'
                          )}
                        </p>

                        {pointInterventions.length ===
                        0 ? (
                          <p className="mt-2 text-sm font-semibold text-slate-500">
                            {t(
                              'map.aucuneAssociationPositionne',
                              'Aucune association positionnée'
                            )}
                          </p>
                        ) : (
                          <div className="mt-2 space-y-2">
                            {pointInterventions
                              .slice(0, 3)
                              .map(
                                (intervention) => (
                                  <div
                                    key={
                                      intervention.id
                                    }
                                    className="rounded-xl bg-white p-2 ring-1 ring-emerald-100"
                                  >
                                    <p className="text-sm font-black text-slate-950">
                                      {intervention.association_nom ||
                                        t(
                                          'map.association',
                                          'Association'
                                        )}
                                    </p>

                                    <p className="mt-1 text-xs font-semibold text-slate-600">
                                      {formatAidType(
                                        intervention.type_aide
                                      )}
                                    </p>

                                    {intervention.nombre_repas ? (
                                      <p className="mt-1 text-xs font-black text-orange-700">
                                        {
                                          intervention.nombre_repas
                                        }{' '}
                                        {t(
                                          'map.repas',
                                          'repas'
                                        )}
                                      </p>
                                    ) : null}

                                    {intervention.nombre_benevoles ? (
                                      <p className="mt-1 text-xs font-black text-emerald-700">
                                        {
                                          intervention.nombre_benevoles
                                        }{' '}
                                        {t(
                                          'map.bnvoles',
                                          'bénévoles'
                                        )}
                                      </p>
                                    ) : null}

                                    {intervention.date_intervention ? (
                                      <p className="mt-1 text-xs font-semibold text-slate-500">
                                        {formatShortDate(
                                          intervention.date_intervention,
                                          locale,
                                          nonRenseignee
                                        )}
                                      </p>
                                    ) : null}
                                  </div>
                                )
                              )}

                            {pointInterventions.length >
                              3 && (
                              <p className="text-xs font-bold text-emerald-700">
                                +{' '}
                                {pointInterventions.length -
                                  3}{' '}
                                {t(
                                  'map.autresAssociations',
                                  'autre(s) association(s)'
                                )}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {hasRepasNeed && (
                        <div className="mt-3 rounded-xl bg-blue-50 p-3">
                          <p className="text-[10px] font-black uppercase text-blue-700">
                            {t(
                              'map.couvertureRepas',
                              'Couverture repas'
                            )}
                          </p>

                          <div className="mt-2 grid grid-cols-3 gap-2">
                            <div>
                              <p className="text-[10px] font-bold text-slate-500">
                                {t(
                                  'map.besoin',
                                  'Besoin'
                                )}
                              </p>

                              <p className="text-lg font-black text-slate-950">
                                {
                                  repasCoverage.totalBesoin
                                }
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold text-slate-500">
                                {t(
                                  'map.couverts',
                                  'Couverts'
                                )}
                              </p>

                              <p className="text-lg font-black text-emerald-700">
                                {
                                  repasCoverage.repasCouverts
                                }
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold text-slate-500">
                                {t(
                                  'map.restants',
                                  'Restants'
                                )}
                              </p>

                              <p className="text-lg font-black text-orange-700">
                                {
                                  repasCoverage.repasRestants
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <Link
                        to={`/points/${point.id}`}
                        className="mt-4 block rounded-xl bg-[#d94a0b] py-3 text-center text-sm font-black text-white"
                      >
                        {t(
                          'map.voirLeDtail',
                          'Voir le détail'
                        )}
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>

          {mobilePoint && (
            <div className="fixed inset-x-0 bottom-24 top-20 z-[2000] overflow-y-auto rounded-t-[2rem] bg-white px-5 pb-6 pt-4 shadow-2xl ring-1 ring-slate-200 sm:hidden">
              <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-300" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d94a0b]">
                    {t(
                      'map.pointTerrain',
                      'Point terrain'
                    )}
                  </p>

                  <h3 className="mt-2 text-xl font-black leading-tight text-slate-950">
                    {mobilePoint.adresse ||
                      t(
                        'map.adresseNonRenseigne',
                        'Adresse non renseignée'
                      )}
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {mobilePoint.typologie ||
                      t(
                        'map.typologieNonRenseigne',
                        'Typologie non renseignée'
                      )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMobilePoint(null)
                  }
                  aria-label={t(
                    'map.masquer',
                    'Masquer'
                  )}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-600"
                >
                  ×
                </button>
              </div>

              

              <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase text-slate-500">
                  {t(
                    'map.besoins',
                    'Besoins'
                  )}
                </p>

                <p className="mt-2 text-sm font-bold text-slate-800">
                  {mobilePoint.besoins ||
                    t(
                      'map.aucunBesoinRenseign',
                      'Aucun besoin renseigné'
                    )}
                </p>
              </div>

              {mobilePoint.hasRepasNeed ? (
                <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase text-slate-500">
                    {t(
                      'map.couvertureRepas',
                      'Couverture repas'
                    )}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        {t(
                          'map.besoin',
                          'Besoin'
                        )}
                      </p>

                      <p className="mt-1 text-xl font-black text-slate-950">
                        {
                          mobilePoint
                            .repasCoverage
                            .totalBesoin
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        {t(
                          'map.couverts',
                          'Couverts'
                        )}
                      </p>

                      <p className="mt-1 text-xl font-black text-emerald-700">
                        {
                          mobilePoint
                            .repasCoverage
                            .repasCouverts
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        {t(
                          'map.restants',
                          'Restants'
                        )}
                      </p>

                      <p className="mt-1 text-xl font-black text-orange-700">
                        {
                          mobilePoint
                            .repasCoverage
                            .repasRestants
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-2xl bg-emerald-50 p-4">
                  <p className="text-[10px] font-black uppercase text-emerald-600">
                    {t(
                      'map.interventionsPrvues',
                      'Interventions prévues'
                    )}
                  </p>

                  <p className="mt-1 text-2xl font-black text-emerald-700">
                    {
                      mobilePoint
                        .pointInterventions
                        .length
                    }
                  </p>
                </div>
              )}

              <div className="mt-3 rounded-2xl bg-emerald-50 p-4">
                <p className="text-[10px] font-black uppercase text-emerald-700">
                  {t(
                    'map.associationsMobilises',
                    'Associations mobilisées'
                  )}
                </p>

                <p className="mt-2 text-sm font-black text-emerald-800">
                  {mobilePoint.pointInterventions
                    .length > 0
                    ? t(
                        'map.lengthAssociationsPositionnes',
                        '{{length}} association(s) positionnée(s)',
                        {
                          length:
                            mobilePoint
                              .pointInterventions
                              .length,
                        }
                      )
                    : t(
                        'map.aucuneAssociationPositionne',
                        'Aucune association positionnée'
                      )}
                </p>

                {mobilePoint.pointInterventions
                  .length > 0 && (
                  <div className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
                    {mobilePoint.pointInterventions.map(
                      (intervention: any) => (
                        <div
                          key={intervention.id}
                          className="rounded-xl bg-white p-3 ring-1 ring-emerald-100"
                        >
                          <p className="text-sm font-black text-slate-950">
                            {intervention.association_nom ||
                              t(
                                'map.association',
                                'Association'
                              )}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-600">
                            {formatAidType(
                              intervention.type_aide
                            )}
                          </p>

                          {intervention.date_intervention && (
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {formatShortDate(
                                intervention.date_intervention,
                                locale,
                                nonRenseignee
                              )}
                            </p>
                          )}

                          {intervention.nombre_repas ? (
                            <p className="mt-1 text-xs font-black text-orange-700">
                              {t(
                                'map.nombre_repasRepasPrvus',
                                '{{nombre_repas}} repas prévus',
                                {
                                  nombre_repas:
                                    intervention.nombre_repas,
                                }
                              )}
                            </p>
                          ) : null}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
  <Link
    to={`/points/${mobilePoint.id}`}
    className="rounded-2xl bg-[#d94a0b] px-4 py-3 text-center text-sm font-black text-white"
  >
    {t(
      'map.voirDtail',
      'Voir détail'
    )}
  </Link>

  <Link
    to={`/interventions/new?pointId=${encodeURIComponent(
      String(mobilePoint.id)
    )}`}
    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-black text-slate-700"
  >
    {t(
      'map.intervenir',
      'Intervenir'
    )}
  </Link>
</div>
            </div>
          )}

          {showMapControls && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 z-[1000] space-y-3 sm:left-5 sm:right-5 sm:top-5">
              <div className="pointer-events-auto rounded-[1.5rem] bg-[#faf8f4]/95 p-3 shadow-xl shadow-slate-900/10 ring-1 ring-[#eadfd6] backdrop-blur sm:p-4 lg:rounded-[2rem]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                      {t(
                        'map.carteTerrain',
                        'Carte terrain'
                      )}
                    </h1>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t(
                        'map.vueTempsRel',
                        'Vue temps réel'
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={hideControls}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm hover:bg-slate-50"
                  >
                    {t(
                      'map.masquer',
                      'Masquer'
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#e7ddd4] bg-white px-3 py-3 shadow-sm">
                    <p className="text-xl font-extrabold text-slate-900">
                      {filteredPoints.length}
                    </p>

                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      {t(
                        'map.points',
                        'Points'
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-3 shadow-sm">
                    <p className="text-xl font-extrabold text-red-600">
                      {urgentCount}
                    </p>

                    <p className="text-[10px] font-bold uppercase tracking-wide text-red-500">
                      {t(
                        'map.urgents',
                        'Urgents'
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 shadow-sm">
                    <p className="text-xl font-extrabold text-emerald-700">
                      {
                        interventionsOnVisiblePoints
                      }
                    </p>

                    <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                      {t(
                        'map.interventions',
                        'Interventions'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pointer-events-auto grid grid-cols-[1fr_auto] gap-2 sm:max-w-3xl">
                <div className="flex items-center rounded-2xl bg-white px-4 py-3 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200">
                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder={t(
                      'map.rechercher',
                      'Rechercher...'
                    )}
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowFilters(
                      (value) => !value
                    )
                  }
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200"
                >
                  {t(
                    'map.filtres',
                    'Filtres'
                  )}
                </button>
              </div>

              {showFilters && (
                <div className="pointer-events-auto rounded-3xl bg-white p-4 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200 sm:max-w-3xl">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        {t(
                          'map.urgence',
                          'Urgence'
                        )}
                      </label>

                      <select
                        value={urgencyFilter}
                        onChange={(event) =>
                          setUrgencyFilter(
                            event.target.value
                          )
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      >
                        <option value="all">
                          {t(
                            'map.toutes',
                            'Toutes'
                          )}
                        </option>

                        <option value="critique">
                          {t(
                            'map.critique',
                            'Critique'
                          )}
                        </option>

                        <option value="haute">
                          {t(
                            'map.haute',
                            'Haute'
                          )}
                        </option>

                        <option value="moyenne">
                          {t(
                            'map.moyenne',
                            'Moyenne'
                          )}
                        </option>

                        <option value="basse">
                          {t(
                            'map.basse',
                            'Basse'
                          )}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        {t(
                          'map.statut',
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
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      >
                        <option value="all">
                          {t(
                            'map.tous',
                            'Tous'
                          )}
                        </option>

                        <option value="signale">
                          {t(
                            'map.signal',
                            'Signalé'
                          )}
                        </option>

                        <option value="a_confirmer">
                          {t(
                            'map.confirmer',
                            'À confirmer'
                          )}
                        </option>

                        <option value="confirme">
                          {t(
                            'map.confirm',
                            'Confirmé'
                          )}
                        </option>

                        <option value="actif">
                          {t(
                            'map.actif',
                            'Actif'
                          )}
                        </option>

                        <option value="inactif">
                          {t(
                            'map.inactif',
                            'Inactif'
                          )}
                        </option>

                        <option value="archive">
                          {t(
                            'map.archiv',
                            'Archivé'
                          )}
                        </option>

                        <option value="rejete">
                          {t(
                            'map.rejet',
                            'Rejeté'
                          )}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        {t(
                          'map.besoin',
                          'Besoin'
                        )}
                      </label>

                      <select
                        value={needFilter}
                        onChange={(event) =>
                          setNeedFilter(
                            event.target.value
                          )
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      >
                        <option value="all">
                          {t(
                            'map.tous',
                            'Tous'
                          )}
                        </option>

                        {availableNeeds.map(
                          (need) => (
                            <option
                              key={need}
                              value={need}
                            >
                              {need}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                      >
                        {t(
                          'map.rinitialiser',
                          'Réinitialiser'
                        )}
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
              onClick={() =>
                setShowMapControls(true)
              }
              className="absolute left-3 top-3 z-[1000] rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-xl ring-1 ring-slate-200 transition hover:bg-orange-50 hover:text-[#d94a0b]"
            >
              {t(
                'map.afficherInfos',
                'Afficher infos'
              )}
            </button>
          )}

          {showMapControls && (
            <>
              <div className="absolute bottom-28 left-3 z-[1000] rounded-2xl bg-white/95 px-3 py-2 shadow-xl ring-1 ring-slate-200 backdrop-blur sm:hidden">
                <p className="mb-2 text-[10px] font-black uppercase text-slate-500">
                  {t(
                    'map.urgence',
                    'Urgence'
                  )}
                </p>

                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                    {t(
                      'map.critAbrege',
                      'Crit.'
                    )}
                  </span>

                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-600" />
                    {t(
                      'map.haute',
                      'Haute'
                    )}
                  </span>

                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-600" />
                    {t(
                      'map.moyAbrege',
                      'Moy.'
                    )}
                  </span>

                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    {t(
                      'map.basse',
                      'Basse'
                    )}
                  </span>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 z-[1000] hidden rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200 sm:block">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t(
                    'map.urgence',
                    'Urgence'
                  )}
                </p>

                <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-600" />
                    {t(
                      'map.critique',
                      'Critique'
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-orange-600" />
                    {t(
                      'map.haute',
                      'Haute'
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-yellow-600" />
                    {t(
                      'map.moyenne',
                      'Moyenne'
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-600" />
                    {t(
                      'map.basse',
                      'Basse'
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <Link
            to="/points/new"
            className="absolute bottom-28 right-4 z-[1000] rounded-2xl bg-[#d94a0b] px-5 py-3 text-sm font-black text-white shadow-xl lg:bottom-8 lg:right-8"
          >
            {t(
              'map.signaler',
              '+ Signaler'
            )}
          </Link>
        </>
      )}
    </div>
  )
}