import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { getCurrentProfile } from '@/features/profile/api/profile'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Erreur inconnue'
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
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900">Profil utilisateur</h1>
        <p className="mt-2 text-sm text-gray-500">Chargement du profil...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900">Profil utilisateur</h1>
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Impossible de charger le profil : {getErrorMessage(error)}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900">Profil utilisateur</h1>
        <p className="mt-2 text-sm text-gray-500">
          Aucun utilisateur connecte pour le moment.
        </p>
        <Link
          to="/login"
          className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Se connecter
        </Link>
      </div>
    )
  }

  const displayName = profile.nom || 'Nom non renseigne'
  const initial = (profile.nom || profile.email).slice(0, 1).toUpperCase()

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profil utilisateur</h1>
        <p className="mt-2 text-sm text-gray-500">
          Informations rattachees au compte connecte.
        </p>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
            {initial}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-gray-900">
              {displayName}
            </h2>
            <p className="truncate text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>

        <dl className="divide-y divide-gray-200">
          <div className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Role</dt>
            <dd className="text-sm font-semibold text-gray-900 sm:col-span-2">
              {profile.role}
            </dd>
          </div>

          <div className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Statut du compte</dt>
            <dd className="text-sm font-semibold text-gray-900 sm:col-span-2">
              {profile.statut_compte}
            </dd>
          </div>

          <div className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Association</dt>
            <dd className="text-sm font-semibold text-gray-900 sm:col-span-2">
              {profile.association_id || 'Aucun rattachement'}
            </dd>
          </div>

          <div className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Cree le</dt>
            <dd className="text-sm font-semibold text-gray-900 sm:col-span-2">
              {formatDate(profile.created_at)}
            </dd>
          </div>

          <div className="grid gap-1 pt-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Derniere mise a jour</dt>
            <dd className="text-sm font-semibold text-gray-900 sm:col-span-2">
              {formatDate(profile.updated_at)}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
