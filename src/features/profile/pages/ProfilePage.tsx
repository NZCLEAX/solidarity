import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronRight, Lock } from 'lucide-react'

import { getCurrentProfile } from '@/features/auth/api/profile'
import { signOut } from '@/features/auth/api/auth'
import { formatRole } from '@/features/auth/utils/roles'
import { hasPermission } from '@/features/auth/utils/permissions'

function formatDate(value: string | null | undefined) {
  if (!value) return 'Non renseignée'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Non renseignée'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatStatus(value: string | null | undefined) {
  if (!value) return 'Non renseigné'

  const labels: Record<string, string> = {
    actif: 'Actif',
    en_attente: 'En attente',
    suspendu: 'Suspendu',
    refuse: 'Refusé',
  }

  return labels[value] || value
}

function getStatusClass(value: string | null | undefined) {
  if (value === 'actif') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (value === 'en_attente') {
    return 'bg-orange-50 text-orange-700'
  }

  if (value === 'suspendu' || value === 'refuse') {
    return 'bg-red-50 text-red-700'
  }

  return 'bg-slate-100 text-slate-700'
}

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-sm font-semibold text-slate-500">
        {title}
      </h2>

      <div className="rounded-xl border border-slate-200 bg-white">
        {children}
      </div>
    </section>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <dt className="shrink-0 text-sm text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-right text-sm font-medium text-slate-900">
        {value}
      </dd>
    </div>
  )
}

function AccessCard({
  title,
  description,
  allowed,
}: {
  title: string
  description: string
  allowed: boolean
}) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <span
        className={[
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
          allowed
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-slate-100 text-slate-500',
        ].join(' ')}
      >
        {allowed ? <Check size={13} /> : <Lock size={12} />}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <span
        className={[
          'shrink-0 text-xs font-medium',
          allowed ? 'text-emerald-700' : 'text-slate-500',
        ].join(' ')}
      >
        {allowed ? 'Autorisé' : 'Bloqué'}
      </span>
    </li>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()

  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
    retry: false,
  })

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-sm text-slate-500">
        Chargement du profil...
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(error as Error)?.message ||
            'Impossible de charger les informations du profil.'}
        </div>
      </div>
    )
  }

  const userInitial =
    profile.nom?.trim()?.charAt(0)?.toUpperCase() ||
    profile.email?.trim()?.charAt(0)?.toUpperCase() ||
    'U'

  const role = profile.role
  const associationId = profile.association_id

  // =========================================================
  // PERMISSIONS
  // On utilise maintenant exactement les mêmes permissions
  // que le router.
  // =========================================================

  const dashboardAllowed = hasPermission(
    profile,
    'dashboard'
  )

  const planningAllowed = hasPermission(
    profile,
    'planning'
  )

  const mapAllowed = hasPermission(
    profile,
    'view_map'
  )

  const pointsAllowed = hasPermission(
    profile,
    'view_points'
  )

  const createPointAllowed = hasPermission(
    profile,
    'create_point'
  )

  const interventionsAllowed = hasPermission(
    profile,
    'manage_interventions'
  )

  const moderationAllowed = hasPermission(
    profile,
    'moderation'
  )

  const administrationAllowed = hasPermission(
    profile,
    'administration'
  )

  const roleDescription =
    role === 'citoyen'
      ? 'Tu peux signaler une situation de précarité.'
      : role === 'benevole'
        ? 'Tu peux signaler des situations et consulter les informations terrain de ton association.'
        : role === 'association'
          ? 'Tu peux suivre les points terrain et organiser les interventions.'
          : role === 'moderateur'
            ? 'Tu peux modérer les signalements, valider les points et gérer les doublons.'
            : role === 'admin'
              ? 'Tu as accès à toute l’administration de la plateforme.'
              : null

  const shortcuts = [
    { allowed: dashboardAllowed, to: '/dashboard', label: 'Dashboard' },
    { allowed: planningAllowed, to: '/planning', label: 'Planning' },
    { allowed: mapAllowed, to: '/carte', label: 'Carte' },
    { allowed: pointsAllowed, to: '/points', label: 'Points' },
    {
      allowed: interventionsAllowed,
      to: '/interventions',
      label: 'Interventions',
    },
  ].filter((item) => item.allowed)

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-6">
      {/* =====================================================
          EN-TÊTE
      ===================================================== */}

      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#d94a0b] text-2xl font-bold text-white">
          {userInitial}
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-950">
            {profile.nom || 'Nom non renseigné'}
          </h1>

          <p className="break-all text-sm text-slate-500">
            {profile.email || 'Email non renseigné'}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-md bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
              {formatRole(profile.role)}
            </span>

            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${getStatusClass(
                profile.statut_compte
              )}`}
            >
              {formatStatus(profile.statut_compte)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        {createPointAllowed && (
          <Link
            to="/points/new"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-[#d94a0b] px-4 text-sm font-semibold text-white transition hover:bg-[#b93607]"
          >
            Signaler un point
          </Link>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-red-600"
        >
          Déconnexion
        </button>
      </div>

      {/* =====================================================
          RÔLE
      ===================================================== */}

      <Section title="Mon rôle">
        <div className="px-4 py-3">
          <p className="font-semibold text-slate-950">
            {formatRole(profile.role)}
          </p>

          {roleDescription && (
            <p className="mt-1 text-sm text-slate-600">
              {roleDescription}
            </p>
          )}

          {role === 'association' && !associationId && (
            <p className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
              Ton compte association n’est encore rattaché à aucune
              association validée.
            </p>
          )}

          {role === 'benevole' && !mapAllowed && (
            <p className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
              Ton compte bénévole doit être rattaché et validé par une
              association avant de pouvoir accéder aux outils terrain.
            </p>
          )}
        </div>

        <dl className="divide-y divide-slate-200 border-t border-slate-200">
          <InfoRow
            label="Statut du compte"
            value={formatStatus(profile.statut_compte)}
          />

          <InfoRow
            label="Association"
            value={
              profile.association_nom ||
              (associationId
                ? 'Association rattachée'
                : 'Aucun rattachement')
            }
          />
        </dl>
      </Section>

      {/* =====================================================
          ACCÈS
      ===================================================== */}

      <Section title="Accès">
        <ul className="divide-y divide-slate-200">
          <AccessCard
            title="Dashboard"
            description="Vue globale de coordination."
            allowed={dashboardAllowed}
          />

          <AccessCard
            title="Planning"
            description="Consulter le planning des actions terrain."
            allowed={planningAllowed}
          />

          <AccessCard
            title="Carte"
            description="Visualisation des points terrain."
            allowed={mapAllowed}
          />

          <AccessCard
            title="Points"
            description="Liste et suivi des signalements."
            allowed={pointsAllowed}
          />

          <AccessCard
            title="Signalement"
            description="Déclarer une situation observée."
            allowed={createPointAllowed}
          />

          <AccessCard
            title="Interventions"
            description="Déclarer et gérer les actions terrain."
            allowed={interventionsAllowed}
          />

          <AccessCard
            title="Modération"
            description="Validation, refus et doublons."
            allowed={moderationAllowed}
          />

          <AccessCard
            title="Administration"
            description="Gestion de la plateforme."
            allowed={administrationAllowed}
          />
        </ul>
      </Section>

      {/* =====================================================
          DÉTAILS DU COMPTE
      ===================================================== */}

      <Section title="Détails du compte">
        <dl className="divide-y divide-slate-200">
          <InfoRow label="Nom" value={profile.nom || 'Non renseigné'} />
          <InfoRow
            label="Email"
            value={profile.email || 'Non renseigné'}
          />
          <InfoRow
            label="Association"
            value={profile.association_nom || 'Aucune'}
          />
          <InfoRow
            label="Créé le"
            value={formatDate(profile.created_at)}
          />
          <InfoRow
            label="Mis à jour le"
            value={formatDate(profile.updated_at)}
          />
        </dl>
      </Section>

      {/* =====================================================
          RACCOURCIS
      ===================================================== */}

      {shortcuts.length > 0 && (
        <Section title="Raccourcis">
          <ul className="divide-y divide-slate-200">
            {shortcuts.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-900 transition hover:text-[#d94a0b]"
                >
                  {item.label}
                  <ChevronRight size={18} className="text-slate-400" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}
