import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { getPointById } from '@/features/points/api/points'
import {
  formatPointLabel,
  getStatusBadgeClass,
  getUrgencyBadgeClass,
  getUrgencyMarkerColor,
} from '@/shared/utils/pointStyles'

const DEFAULT_CENTER: [number, number] = [48.8566, 2.3522]

function formatDate(value: string | null | undefined) {
  if (!value) return 'Non renseigné'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
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

function splitNeeds(value: string | null) {
  if (!value) return []

  return value
    .split(',')
    .map((need) => need.trim())
    .filter(Boolean)
}

export default function PointDetailsPage() {
  const { pointId } = useParams()

  const {
    data: point,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['point', pointId],
    queryFn: () => getPointById(pointId as string),
    enabled: Boolean(pointId),
  })

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[1500px]">
          <div className="rounded-[2rem] border border-[#eadfd6] bg-white p-8 text-slate-600 shadow-sm">
            Chargement du point...
          </div>
        </div>
      </div>
    )
  }

  if (isError || !point) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[1500px]">
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700">
            {(error as Error)?.message ||
              'Erreur lors du chargement du point.'}
          </div>
        </div>
      </div>
    )
  }

  const hasCoordinates = isValidCoordinate(point.latitude, point.longitude)
  const needs = splitNeeds(point.besoins)
  const markerColor = getUrgencyMarkerColor(point.niveau_urgence)

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-[1500px]">
        <Link
          to="/points"
          className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 hover:text-[#d94a0b]"
        >
          <span>←</span>
          <span>Retour aux points</span>
        </Link>

        <div className="mt-5 grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
          <section>
            <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
                  Fiche point
                </p>

                <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl xl:text-5xl">
                  {point.adresse || 'Adresse non renseignée'}
                </h1>

                <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  Fiche détaillée du point de précarité avec son statut, son
                  niveau d’urgence, ses besoins et son suivi terrain.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link
                  to={`/points/${point.id}/edit`}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Modifier
                </Link>

                <Link
                  to="/carte"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Voir la carte
                </Link>
              </div>
            </div>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Statut
                </p>

                <div className="mt-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ring-1 ${getStatusBadgeClass(
                      point.statut
                    )}`}
                  >
                    {formatPointLabel(point.statut)}
                  </span>
                </div>
              </article>

              <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Urgence
                </p>

                <div className="mt-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ring-1 ${getUrgencyBadgeClass(
                      point.niveau_urgence
                    )}`}
                  >
                    {formatPointLabel(point.niveau_urgence)}
                  </span>
                </div>
              </article>

              <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Fiabilité
                </p>

                <p className="mt-4 text-lg font-black text-slate-950">
                  {formatPointLabel(point.niveau_fiabilite)}
                </p>
              </article>
            </section>

            <section className="mt-6 rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-950">
                  Informations principales
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Informations utiles pour identifier rapidement la situation.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Adresse
                  </p>
                  <p className="mt-2 font-black text-slate-950">
                    {point.adresse || 'Non renseigné'}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                    Personnes estimées
                  </p>
                  <p className="mt-2 text-3xl font-black text-emerald-700">
                    {point.nombre_personnes_estime ?? '0'}
                  </p>
                </div>

                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                    Typologie
                  </p>
                  <p className="mt-2 font-black text-orange-800">
                    {point.typologie || 'Non renseignée'}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Latitude
                  </p>
                  <p className="mt-2 font-black text-slate-950">
                    {point.latitude ?? 'Non renseignée'}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Longitude
                  </p>
                  <p className="mt-2 font-black text-slate-950">
                    {point.longitude ?? 'Non renseignée'}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Actif
                  </p>
                  <p className="mt-2 font-black text-slate-950">
                    {point.actif === false ? 'Non' : 'Oui'}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-950">
                  Besoins observés
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Les besoins déclarés lors du signalement.
                </p>
              </div>

              {needs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                  Aucun besoin renseigné.
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {needs.map((need) => (
                    <span
                      key={need}
                      className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200"
                    >
                      {need}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-6 rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-950">
                  Commentaire
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Détails complémentaires du signalement.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-700">
                {point.commentaire && point.commentaire.trim().length > 0
                  ? point.commentaire
                  : 'Aucun commentaire renseigné.'}
              </div>
            </section>

            <section className="mt-6 rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-950">
                  Suivi
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Dates importantes liées au point.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Date d’observation
                  </p>
                  <p className="mt-2 font-black text-slate-950">
                    {formatDate(point.date_observation)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Dernière mise à jour
                  </p>
                  <p className="mt-2 font-black text-slate-950">
                    {formatDate(point.date_derniere_maj || point.updated_at)}
                  </p>
                </div>
              </div>
            </section>
          </section>

          <aside>
            <div className="sticky top-28 space-y-5">
              <section className="overflow-hidden rounded-[2rem] border border-[#eadfd6] bg-white shadow-sm">
                <div className="border-b border-[#eadfd6] p-5">
                  <h2 className="text-2xl font-black text-slate-950">
                    Localisation
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Position du point sur la carte.
                  </p>
                </div>

                <div className="h-[360px] bg-slate-100">
                  {hasCoordinates ? (
                    <MapContainer
                      center={[point.latitude!, point.longitude!]}
                      zoom={15}
                      scrollWheelZoom={false}
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      <CircleMarker
                        center={[point.latitude!, point.longitude!]}
                        radius={14}
                        pathOptions={{
                          color: '#ffffff',
                          fillColor: markerColor,
                          fillOpacity: 0.9,
                          weight: 4,
                        }}
                      >
                        <Popup>
                          <div className="p-2">
                            <p className="font-bold text-slate-950">
                              {point.adresse || 'Point'}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {formatPointLabel(point.niveau_urgence)}
                            </p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    </MapContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-500">
                      Coordonnées indisponibles pour afficher la carte.
                    </div>
                  )}
                </div>

                {hasCoordinates && (
                  <div className="p-5">
                    <Link
                      to="/carte"
                      className="inline-flex w-full min-h-12 items-center justify-center rounded-2xl bg-[#d94a0b] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#b93607]"
                    >
                      Voir dans la carte générale
                    </Link>
                  </div>
                )}
              </section>

              <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6">
                <h2 className="text-xl font-black text-emerald-900">
                  Résumé terrain
                </h2>

                <div className="mt-5 space-y-4 text-sm leading-relaxed text-emerald-800">
                  <p>
                    <span className="font-black">Adresse :</span>{' '}
                    {point.adresse || 'Non renseignée'}
                  </p>

                  <p>
                    <span className="font-black">Urgence :</span>{' '}
                    {formatPointLabel(point.niveau_urgence)}
                  </p>

                  <p>
                    <span className="font-black">Personnes :</span>{' '}
                    {point.nombre_personnes_estime ?? 'Non renseigné'}
                  </p>

                  <p>
                    <span className="font-black">Besoins :</span>{' '}
                    {point.besoins || 'Non renseignés'}
                  </p>
                </div>
              </section>

              <section className="rounded-[2rem] border border-orange-200 bg-orange-50 p-6">
                <h2 className="text-xl font-black text-orange-900">
                  Actions rapides
                </h2>

                <div className="mt-5 grid gap-3">
                  <Link
                    to={`/points/${point.id}/edit`}
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-700"
                  >
                    Modifier le point
                  </Link>

                  <Link
                    to="/points"
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-black text-orange-700 transition hover:bg-orange-100"
                  >
                    ← Retour aux points
                  </Link>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}