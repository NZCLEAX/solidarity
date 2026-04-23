import { useQuery } from '@tanstack/react-query'

import { getCurrentProfile } from '@/features/profile/api/profile'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function ProfilePage() {
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
  })

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil utilisateur</h1>
        <p className="mt-2 text-sm text-gray-500">Chargement du profil...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil utilisateur</h1>
        <p className="mt-2 text-sm text-red-600">
          Impossible de charger le profil : {error.message}
        </p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil utilisateur</h1>
        <p className="mt-2 text-sm text-gray-500">
          Aucun utilisateur connecte pour le moment.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profil utilisateur</h1>
        <p className="mt-2 text-sm text-gray-500">
          Informations rattachees au compte connecte.
        </p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
            {(profile.nom || profile.email).slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {profile.nom || 'Nom non renseigne'}
            </h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Role
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">{profile.role}</dd>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Statut du compte
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">
              {profile.statut_compte}
            </dd>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Association
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">
              {profile.association_id || 'Aucun rattachement'}
            </dd>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Cree le
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">
              {formatDate(profile.created_at)}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
