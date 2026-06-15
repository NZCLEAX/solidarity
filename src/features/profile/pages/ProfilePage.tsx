import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCurrentProfile } from '@/features/auth/api/profile'
import { signOut } from '@/features/auth/api/auth'
import { formatRole } from '@/features/auth/utils/roles'

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
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  }

  if (value === 'en_attente') {
    return 'bg-orange-50 text-orange-700 ring-orange-200'
  }

  if (value === 'suspendu' || value === 'refuse') {
    return 'bg-red-50 text-red-700 ring-red-200'
  }

  return 'bg-slate-100 text-slate-700 ring-slate-200'
}

function canAccessDashboard(role: string | null | undefined) {
  return role === 'association' || role === 'moderateur' || role === 'admin'
}

function canAccessMap(
  role: string | null | undefined,
  statutCompte: string | null | undefined,
  associationId: string | null | undefined
) {
  if (role === 'association' || role === 'moderateur' || role === 'admin') {
    return true
  }

  if (role === 'benevole') {
    return statutCompte === 'actif' && Boolean(associationId)
  }

  return false
}

function canAccessPoints(
  role: string | null | undefined,
  statutCompte: string | null | undefined,
  associationId: string | null | undefined
) {
  return canAccessMap(role, statutCompte, associationId)
}

function canCreatePoint(role: string | null | undefined) {
  return (
    role === 'citoyen' ||
    role === 'benevole' ||
    role === 'association' ||
    role === 'moderateur' ||
    role === 'admin'
  )
}

function canAccessInterventions(role: string | null | undefined) {
  return role === 'association' || role === 'moderateur' || role === 'admin'
}

function canAccessModeration(role: string | null | undefined) {
  return role === 'moderateur' || role === 'admin'
}

function canAccessAdministration(role: string | null | undefined) {
  return role === 'admin'
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
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-black text-slate-950">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        </div>

        <span
          className={[
            'shrink-0 rounded-full px-3 py-1 text-xs font-bold ring-1',
            allowed
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
              : 'bg-slate-100 text-slate-500 ring-slate-200',
          ].join(' ')}
        >
          {allowed ? 'Autorisé' : 'Bloqué'}
        </span>
      </div>
    </div>
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
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#eadfd6] bg-white p-8 text-slate-600 shadow-sm">
          Chargement du profil...
        </div>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
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
  const statutCompte = profile.statut_compte
  const associationId = profile.association_id

  const dashboardAllowed = canAccessDashboard(role)
  const mapAllowed = canAccessMap(role, statutCompte, associationId)
  const pointsAllowed = canAccessPoints(role, statutCompte, associationId)
  const createPointAllowed = canCreatePoint(role)
  const interventionsAllowed = canAccessInterventions(role)
  const moderationAllowed = canAccessModeration(role)
  const administrationAllowed = canAccessAdministration(role)

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
              Mon compte
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Profil utilisateur
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Consulte ton rôle, ton statut et les accès disponibles sur
              Solidarity.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {createPointAllowed && (
              <Link
                to="/points/new"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#d94a0b] px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#b93607]"
              >
                Signaler un point
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-3 text-sm font-black text-red-600 transition hover:bg-red-100"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="overflow-hidden rounded-[2rem] border border-[#eadfd6] bg-white shadow-sm">
            <div className="bg-gradient-to-br from-orange-50 via-white to-[#faf8f4] p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#d94a0b] text-4xl font-black text-white shadow-xl shadow-orange-900/20">
                  {userInitial}
                </div>

                <div className="min-w-0">
                  <h2 className="text-3xl font-black text-slate-950">
                    {profile.nom || 'Nom non renseigné'}
                  </h2>

                  <p className="mt-2 break-all text-sm font-semibold text-slate-500">
                    {profile.email || 'Email non renseigné'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 ring-1 ring-orange-200">
                      {formatRole(profile.role)}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusClass(
                        profile.statut_compte
                      )}`}
                    >
                      {formatStatus(profile.statut_compte)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Rôle actuel
                </p>

                <p className="mt-2 text-2xl font-black text-slate-950">
                  {formatRole(profile.role)}
                </p>

                {role === 'citoyen' && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Tu peux signaler une situation de précarité, mais tu ne peux
                    pas gérer les points, les interventions, la modération ou
                    l’administration.
                  </p>
                )}

                {role === 'benevole' && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Tu peux signaler une situation. Pour visualiser les points,
                    ton compte doit être rattaché et validé par une association.
                  </p>
                )}

                {role === 'association' && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Tu peux suivre les points terrain et organiser les
                    interventions.
                  </p>
                )}

                {role === 'moderateur' && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Tu peux modérer les signalements, valider les points et
                    gérer les doublons.
                  </p>
                )}

                {role === 'admin' && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Tu as accès à toute l’administration de la plateforme.
                  </p>
                )}
              </div>

              {role === 'association' && !associationId && (
                <div className="mt-4 rounded-3xl border border-orange-200 bg-orange-50 p-5 text-sm leading-relaxed text-orange-800">
                  Ton compte est en rôle association, mais aucune association
                  n’est encore rattachée. Un administrateur doit rattacher ton
                  compte à une association validée.
                </div>
              )}

              {role === 'benevole' && !mapAllowed && (
                <div className="mt-4 rounded-3xl border border-orange-200 bg-orange-50 p-5 text-sm leading-relaxed text-orange-800">
                  Ton compte bénévole doit être validé par une association
                  avant de pouvoir voir la carte et les points.
                </div>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Statut du compte
                  </p>
                  <p className="mt-2 text-lg font-black text-slate-950">
                    {formatStatus(statutCompte)}
                  </p>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Association
                  </p>
                  <p className="mt-2 break-all text-lg font-black text-slate-950">
                    {associationId || 'Aucun rattachement'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
                Accès
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-950">
                Permissions disponibles
              </h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <AccessCard
                  title="Dashboard"
                  description="Vue globale de coordination."
                  allowed={dashboardAllowed}
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
                  description="Déclarer et suivre les actions terrain."
                  allowed={interventionsAllowed}
                />

                <AccessCard
                  title="Modération"
                  description="Validation, refus et doublons."
                  allowed={moderationAllowed}
                />

                <div className="sm:col-span-2">
                  <AccessCard
                    title="Administration"
                    description="Gestion des utilisateurs, rôles et associations."
                    allowed={administrationAllowed}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
                Informations
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-950">
                Détails du compte
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Nom
                  </p>
                  <p className="mt-2 text-lg font-black text-slate-950">
                    {profile.nom || 'Non renseigné'}
                  </p>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Email
                  </p>
                  <p className="mt-2 break-all text-lg font-black text-slate-950">
                    {profile.email || 'Non renseigné'}
                  </p>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Créé le
                  </p>
                  <p className="mt-2 text-lg font-black text-slate-950">
                    {formatDate(profile.created_at)}
                  </p>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Mis à jour le
                  </p>
                  <p className="mt-2 text-lg font-black text-slate-950">
                    {formatDate(profile.updated_at)}
                  </p>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5 sm:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Identifiant utilisateur
                  </p>
                  <p className="mt-2 break-all text-sm font-black text-slate-950">
                    {profile.id}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {dashboardAllowed && (
                <Link
                  to="/dashboard"
                  className="rounded-3xl border border-[#eadfd6] bg-white p-5 text-center text-sm font-black text-slate-700 shadow-sm transition hover:bg-orange-50 hover:text-[#d94a0b]"
                >
                  Dashboard
                </Link>
              )}

              {mapAllowed && (
                <Link
                  to="/carte"
                  className="rounded-3xl border border-[#eadfd6] bg-white p-5 text-center text-sm font-black text-slate-700 shadow-sm transition hover:bg-orange-50 hover:text-[#d94a0b]"
                >
                  Carte
                </Link>
              )}

              {pointsAllowed && (
                <Link
                  to="/points"
                  className="rounded-3xl border border-[#eadfd6] bg-white p-5 text-center text-sm font-black text-slate-700 shadow-sm transition hover:bg-orange-50 hover:text-[#d94a0b]"
                >
                  Points
                </Link>
              )}

              {interventionsAllowed && (
                <Link
                  to="/interventions"
                  className="rounded-3xl border border-[#eadfd6] bg-white p-5 text-center text-sm font-black text-slate-700 shadow-sm transition hover:bg-orange-50 hover:text-[#d94a0b]"
                >
                  Interventions
                </Link>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}