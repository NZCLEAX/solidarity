import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getCurrentProfile,
  getUsers,
  updateUserRole,
  updateUserStatus,
  type UserStatus,
} from '@/features/admin/api/users'

import {
  adminManageableRoles,
  formatRole,
  type UserRole,
} from '@/features/auth/utils/roles'

const userStatusOptions: Array<{
  label: string
  value: UserStatus
}> = [
  {
    label: 'Actif',
    value: 'actif',
  },
  {
    label: 'Suspendu',
    value: 'suspendu',
  },
  {
    label: 'Inactif',
    value: 'inactif',
  },
]

function formatStatus(status: string | null | undefined) {
  const labels: Record<string, string> = {
    actif: 'Actif',
    suspendu: 'Suspendu',
    inactif: 'Inactif',
  }

  if (!status) return 'Non renseigné'

  return labels[status] || status
}

function formatDate(value: string | null) {
  if (!value) return 'Non renseignée'

  return new Date(value).toLocaleDateString('fr-FR')
}

export default function AdminPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')

  const {
    data: currentProfile,
    isLoading: currentProfileLoading,
    isError: currentProfileError,
    error: currentProfileErrorDetails,
  } = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
  })

  const isAdmin = currentProfile?.role === 'admin'

  const {
    data: users = [],
    isLoading: usersLoading,
    isError: usersError,
    error: usersErrorDetails,
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getUsers,
    enabled: isAdmin,
  })

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['current-profile'] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({
      userId,
      statutCompte,
    }: {
      userId: string
      statutCompte: UserStatus
    }) => updateUserStatus(userId, statutCompte),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['current-profile'] })
    },
  })

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) return users

    return users.filter((user) => {
      const content = [user.nom, user.email, user.role, user.statut_compte]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return content.includes(normalizedSearch)
    })
  }, [users, searchTerm])

  const isLoading = usersLoading
  const isUpdating = roleMutation.isPending || statusMutation.isPending

  if (currentProfileLoading) {
    return (
      <div className="rounded-xl bg-white p-6 text-slate-600">
        Vérification des droits administrateur...
      </div>
    )
  }

  if (currentProfileError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {(currentProfileErrorDetails as Error)?.message ||
          'Impossible de vérifier ton profil.'}
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Accès refusé. Cette page est réservée aux administrateurs.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Gestion des utilisateurs
          </h1>
          <p className="mt-2 text-slate-600">
            Administration des comptes, rôles et statuts utilisateurs.
          </p>
        </div>

        <Link
          to="/administration/associations"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Gestion des associations
        </Link>
        <Link
          to="/administration/security"
          className="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
        >
          Centre de securite
        </Link>
      </div>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-md">
            <label className="block text-sm font-medium text-slate-700">
              Rechercher un utilisateur
            </label>

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nom, email, rôle, statut..."
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <p className="text-sm text-slate-500">
            {filteredUsers.length} utilisateur(s) affiché(s) sur {users.length}
          </p>
        </div>
      </section>

      {(roleMutation.isError || statusMutation.isError) && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(roleMutation.error as Error)?.message ||
            (statusMutation.error as Error)?.message ||
            'Erreur lors de la mise à jour de l’utilisateur.'}
        </div>
      )}

      {isLoading && (
        <div className="rounded-xl bg-white p-6 text-slate-600">
          Chargement des utilisateurs...
        </div>
      )}

      {usersError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {(usersErrorDetails as Error)?.message ||
            'Erreur lors du chargement des utilisateurs.'}
        </div>
      )}

      {!isLoading && !usersError && filteredUsers.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-slate-500">
          Aucun utilisateur trouvé.
        </div>
      )}

      {!isLoading && !usersError && filteredUsers.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[1.4fr_1.4fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase text-slate-500 md:grid">
            <span>Utilisateur</span>
            <span>Email</span>
            <span>Rôle</span>
            <span>Statut</span>
            <span>Créé le</span>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredUsers.map((user) => {
              const isCurrentUser = user.id === currentProfile?.id

              return (
                <article
                  key={user.id}
                  className="grid gap-4 px-5 py-4 md:grid-cols-[1.4fr_1.4fr_1fr_1fr_1fr] md:items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-950">
                      {user.nom || 'Nom non renseigné'}
                    </p>

                    {isCurrentUser && (
                      <p className="mt-1 text-xs font-medium text-indigo-600">
                        Compte connecté
                      </p>
                    )}

                    <p className="text-xs text-slate-500 md:hidden">
                      {user.email || 'Email non renseigné'}
                    </p>
                  </div>

                  <p className="hidden text-sm text-slate-600 md:block">
                    {user.email || 'Email non renseigné'}
                  </p>

                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase text-slate-500 md:hidden">
                      Rôle
                    </label>

                    <select
                      value={user.role || 'citoyen'}
                      disabled={isUpdating || isCurrentUser}
                      onChange={(event) =>
                        roleMutation.mutate({
                          userId: user.id,
                          role: event.target.value as UserRole,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      {adminManageableRoles.map((roleOption) => (
                        <option
                          key={roleOption.value}
                          value={roleOption.value}
                        >
                          {roleOption.label}
                        </option>
                      ))}
                    </select>

                    <p className="mt-1 text-xs text-slate-500">
                      Actuel : {formatRole(user.role)}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase text-slate-500 md:hidden">
                      Statut
                    </label>

                    <select
                      value={user.statut_compte || 'actif'}
                      disabled={isUpdating || isCurrentUser}
                      onChange={(event) =>
                        statusMutation.mutate({
                          userId: user.id,
                          statutCompte: event.target.value as UserStatus,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      {userStatusOptions.map((statusOption) => (
                        <option
                          key={statusOption.value}
                          value={statusOption.value}
                        >
                          {statusOption.label}
                        </option>
                      ))}
                    </select>

                    <p className="mt-1 text-xs text-slate-500">
                      Actuel : {formatStatus(user.statut_compte)}
                    </p>
                  </div>

                  <p className="text-sm text-slate-600">
                    {formatDate(user.created_at)}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
