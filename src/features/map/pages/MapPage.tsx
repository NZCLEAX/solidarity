import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { getPoints, type Point } from '@/features/points/api/points'

function isValidCoordinate(point: Point) {
  const latitude = Number(point.latitude)
  const longitude = Number(point.longitude)

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0)
  )
}

function formatLabel(value: string | null) {
  if (!value) return 'Non renseigné'

  const labels: Record<string, string> = {
    signale: 'Signalé',
    a_confirmer: 'À confirmer',
    confirme: 'Confirmé',
    actif: 'Actif',
    inactif: 'Inactif',
    archive: 'Archivé',
    non_verifie: 'Non vérifié',
    verifie_terrain: 'Vérifié terrain',
    multi_verifie: 'Multi-vérifié',
    basse: 'Basse',
    moyenne: 'Moyenne',
    haute: 'Haute',
    critique: 'Critique',
  }

  return labels[value] || value
}

export default function MapPage() {
  const {
    data: points = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['points'],
    queryFn: getPoints,
  })

  const pointsAvecCoordonnees = points.filter(isValidCoordinate)

  const mapCenter: [number, number] =
    pointsAvecCoordonnees.length > 0
      ? [
          Number(pointsAvecCoordonnees[0].latitude),
          Number(pointsAvecCoordonnees[0].longitude),
        ]
      : [48.8566, 2.3522]

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Carte des points
          </h1>
          <p className="mt-2 text-slate-600">
            Visualisation des points de précarité géolocalisés.
          </p>
        </div>

        <Link
          to="/points/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Nouveau point
        </Link>
      </div>

      {isLoading && (
        <div className="rounded-xl bg-white p-6 text-slate-600">
          Chargement de la carte...
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {(error as Error).message || 'Erreur lors du chargement des points.'}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <MapContainer
              center={mapCenter}
              zoom={12}
              scrollWheelZoom
              className="h-[650px] w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {pointsAvecCoordonnees.map((point) => (
                <CircleMarker
                  key={point.id}
                  center={[Number(point.latitude), Number(point.longitude)]}
                  radius={10}
                  pathOptions={{
                    color: '#4f46e5',
                    fillColor: '#4f46e5',
                    fillOpacity: 0.75,
                  }}
                >
                  <Popup>
                    <div className="min-w-56">
                      <p className="font-semibold">
                        {point.adresse || 'Adresse non renseignée'}
                      </p>

                      <p className="mt-1 text-sm">
                        <strong>Personnes :</strong>{' '}
                        {point.nombre_personnes_estime ?? 'Non renseigné'}
                      </p>

                      <p className="text-sm">
                        <strong>Urgence :</strong>{' '}
                        {formatLabel(point.niveau_urgence)}
                      </p>

                      <p className="text-sm">
                        <strong>Statut :</strong> {formatLabel(point.statut)}
                      </p>

                      {point.besoins && (
                        <p className="text-sm">
                          <strong>Besoins :</strong> {point.besoins}
                        </p>
                      )}

                      <div className="mt-3 flex gap-2">
                        <Link
                          to={`/points/${point.id}`}
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                        >
                          Voir détail
                        </Link>

                        <Link
                          to={`/points/${point.id}/edit`}
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                        >
                          Modifier
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Points affichés
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {pointsAvecCoordonnees.length} point(s) géolocalisé(s) sur{' '}
              {points.length} point(s) total.
            </p>

            {pointsAvecCoordonnees.length === 0 && (
              <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Aucun point avec coordonnées valides pour le moment.
              </div>
            )}

            <div className="mt-4 space-y-3">
              {pointsAvecCoordonnees.map((point) => (
                <Link
                  key={point.id}
                  to={`/points/${point.id}`}
                  className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                >
                  <p className="font-medium text-slate-950">
                    {point.adresse || 'Adresse non renseignée'}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {point.latitude}, {point.longitude}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-700">
                      {formatLabel(point.statut)}
                    </span>

                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                      {formatLabel(point.niveau_urgence)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}