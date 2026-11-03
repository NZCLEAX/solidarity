import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet'
import { ArrowLeft } from 'lucide-react'

import { getPointById } from '@/features/points/api/points'
import PointSafetyActions from '@/features/points/components/PointSafetyActions'
import { getCurrentUserId } from '@/features/moderation/api/contentReports'
import { getCurrentProfile } from '@/features/auth/api/profile'
import { hasPermission } from '@/features/auth/utils/permissions'
import { chipClass } from '@/shared/components/FormSection'
import {
  formatPointLabel,
  getUrgencyMarkerColor,
} from '@/shared/utils/pointStyles'

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

// Section à plat, comme les formulaires PULSE (FormSection sans numéro).
function DetailSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-slate-200 py-5">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

// Ligne « libellé : valeur » séparée par un trait fin.
function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 py-2.5 text-sm last:border-b-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-950">{value}</dd>
    </div>
  )
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-w-0 px-4 pt-4">
      <div className="mx-auto w-full max-w-xl">
        <Link
          to="/points"
          className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Retour aux points
        </Link>

        {children}
      </div>
    </div>
  )
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

  const { data: currentUserId } = useQuery({
    queryKey: ['current-user-id'],
    queryFn: getCurrentUserId,
  })

  const { data: currentProfile } = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
  })

  if (isLoading) {
    return (
      <PageShell>
        <p className="mt-6 text-sm text-slate-500">Chargement du point...</p>
      </PageShell>
    )
  }

  if (isError || !point) {
    return (
      <PageShell>
        <p
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {(error as Error)?.message || 'Erreur lors du chargement du point.'}
        </p>
      </PageShell>
    )
  }

  const authorId = point.created_by || point.cree_par || null
  const isOwnPoint = Boolean(authorId) && authorId === currentUserId
  const canEdit = hasPermission(currentProfile, 'edit_point')
  const hasCoordinates = isValidCoordinate(point.latitude, point.longitude)
  const needs = splitNeeds(point.besoins)
  const markerColor = getUrgencyMarkerColor(point.niveau_urgence)

  return (
    <PageShell>
      <h1 className="mt-3 break-words text-2xl font-bold text-slate-950">
        {point.adresse || 'Adresse non renseignée'}
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Fiche du point : statut, urgence, besoins observés et suivi terrain.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
        <Link to="/carte" className="text-[#d94a0b]">
          Voir sur la carte
        </Link>

        {canEdit && (
          <Link to={`/points/${point.id}/edit`} className="text-slate-600">
            Modifier
          </Link>
        )}

        {!isOwnPoint && (
          <button
            type="button"
            onClick={() =>
              document
                .getElementById('signaler')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="ml-auto text-red-600"
          >
            Signaler
          </button>
        )}
      </div>

      {/* Chiffres clés, à plat comme le tableau de bord */}
      <section className="mt-5 grid grid-cols-3 gap-x-4 border-t border-slate-200">
        <div className="border-b border-slate-200 py-4">
          <p className="text-xs font-medium text-slate-500">Statut</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">
            {formatPointLabel(point.statut)}
          </p>
        </div>

        <div className="border-b border-slate-200 py-4">
          <p className="text-xs font-medium text-slate-500">Urgence</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-950">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: markerColor }}
            />
            {formatPointLabel(point.niveau_urgence)}
          </p>
        </div>

        <div className="border-b border-slate-200 py-4">
          <p className="text-xs font-medium text-slate-500">Fiabilité</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">
            {formatPointLabel(point.niveau_fiabilite)}
          </p>
        </div>
      </section>

      <DetailSection title="Informations principales">
        <dl>
          <DetailRow
            label="Personnes estimées"
            value={point.nombre_personnes_estime ?? 'Non renseigné'}
          />
          <DetailRow
            label="Typologie"
            value={point.typologie || 'Non renseignée'}
          />
          <DetailRow
            label="Point actif"
            value={point.actif === false ? 'Non' : 'Oui'}
          />
          <DetailRow
            label="Coordonnées"
            value={
              hasCoordinates
                ? `${point.latitude}, ${point.longitude}`
                : 'Non renseignées'
            }
          />
        </dl>
      </DetailSection>

      <DetailSection title="Besoins observés">
        {needs.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun besoin renseigné.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {needs.map((need) => (
              <span key={need} className={chipClass(false)}>
                {need}
              </span>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection title="Commentaire">
        <p className="break-words text-sm text-slate-700">
          {point.commentaire && point.commentaire.trim().length > 0
            ? point.commentaire
            : 'Aucun commentaire renseigné.'}
        </p>
      </DetailSection>

      <DetailSection title="Localisation">
        {hasCoordinates ? (
          <div className="h-56 overflow-hidden rounded-lg border border-slate-200">
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
                radius={12}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: markerColor,
                  fillOpacity: 0.9,
                  weight: 3,
                }}
              />
            </MapContainer>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Coordonnées indisponibles pour afficher la carte.
          </p>
        )}
      </DetailSection>

      <DetailSection title="Suivi">
        <dl>
          <DetailRow
            label="Date d’observation"
            value={formatDate(point.date_observation)}
          />
          <DetailRow
            label="Dernière mise à jour"
            value={formatDate(point.date_derniere_maj || point.updated_at)}
          />
        </dl>
      </DetailSection>

      <div className="pb-6">
        <PointSafetyActions pointId={String(point.id)} authorId={authorId} />
      </div>
    </PageShell>
  )
}
