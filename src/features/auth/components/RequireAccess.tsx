import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCurrentProfile } from '@/features/auth/api/profile'
import {
  hasPermission,
  type AppPermission,
} from '@/features/auth/utils/permissions'

type RequireAccessProps = {
  permission: AppPermission
  children: ReactNode
}

export default function RequireAccess({
  permission,
  children,
}: RequireAccessProps) {
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
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#eadfd6] bg-white p-8 text-slate-600">
          Chargement de ton accès...
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700">
          {(error as Error)?.message || 'Impossible de charger ton profil.'}
        </div>
      </div>
    )
  }

  if (!hasPermission(profile, permission)) {
    const isPendingAssociation =
      profile?.role === 'association' && profile?.statut_compte !== 'actif'

    const isPendingVolunteer =
      profile?.role === 'benevole' && profile?.statut_compte !== 'actif'

    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-orange-200 bg-white p-8 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-xl">
            🔒
          </div>

          <h1 className="mt-6 text-4xl font-black text-slate-950">
            Accès non autorisé
          </h1>

          {isPendingAssociation ? (
            <>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                Ton compte association est bien créé, mais il est encore en
                attente de validation par un administrateur.
              </p>

              <div className="mt-6 rounded-3xl border border-orange-200 bg-orange-50 p-5 text-sm font-semibold text-orange-700">
                Une fois validée, ton association pourra accéder au dashboard,
                à la carte, aux points, aux interventions et aux demandes
                bénévoles.
              </div>

              <Link
                to="/profile"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#d94a0b] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b93607]"
              >
                Voir mon profil
              </Link>
            </>
          ) : isPendingVolunteer ? (
            <>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                Ton compte bénévole doit d’abord être rattaché et validé par
                une association.
              </p>

              <Link
                to="/associations"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#d94a0b] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b93607]"
              >
                Voir les associations
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                Ton rôle actuel ne permet pas d’accéder à cette page.
              </p>

              <Link
                to="/points/new"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#d94a0b] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b93607]"
              >
                Signaler un point
              </Link>
            </>
          )}
        </div>
      </div>
    )
  }

  return children
}