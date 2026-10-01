import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  getCurrentProfile,
  getUsers,
  updateUserRole,
  updateUserStatus,
  type UserStatus,
} from '@/features/admin/api/users'

import {
  adminManageableRoles,
  type UserRole,
} from '@/features/auth/utils/roles'

const userStatusOptions: Array<{
  value: UserStatus
}> = [
  {
    value: 'actif',
  },
  {
    value: 'suspendu',
  },
  {
    value: 'inactif',
  },
]

const LOCALES: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
  ar: 'ar',
}

export default function AdminPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] =
    useState('')

  const language = (
    i18n.resolvedLanguage ??
    i18n.language ??
    'fr'
  )
    .toLowerCase()
    .split('-')[0]

  const locale =
    LOCALES[language] ?? 'fr-FR'

  function formatRoleLabel(
    role: string | null | undefined
  ) {
    switch (role) {
      case 'citoyen':
        return t(
          'admin.roleCitizen',
          'Citoyen'
        )

      case 'benevole':
        return t(
          'admin.roleVolunteer',
          'Bénévole'
        )

      case 'association':
        return t(
          'admin.roleAssociation',
          'Association'
        )

      case 'moderateur':
        return t(
          'admin.roleModerator',
          'Modérateur'
        )

      case 'admin':
        return t(
          'admin.roleAdmin',
          'Administrateur'
        )

      default:
        return (
          role ||
          t(
            'admin.notProvided',
            'Non renseigné'
          )
        )
    }
  }

  function formatStatus(
    status: string | null | undefined
  ) {
    switch (status) {
      case 'en_attente':
        return t(
          'admin.statusPending',
          'En attente'
        )

      case 'actif':
        return t(
          'admin.statusActive',
          'Actif'
        )

      case 'suspendu':
        return t(
          'admin.statusSuspended',
          'Suspendu'
        )

      case 'inactif':
        return t(
          'admin.statusInactive',
          'Inactif'
        )

      default:
        return (
          status ||
          t(
            'admin.notProvided',
            'Non renseigné'
          )
        )
    }
  }

  function formatDate(
    value: string | null
  ) {
    if (!value) {
      return t(
        'admin.notProvidedFeminine',
        'Non renseignée'
      )
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return t(
        'admin.notProvidedFeminine',
        'Non renseignée'
      )
    }

    return new Intl.DateTimeFormat(
      locale,
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    ).format(date)
  }

  const {
    data: currentProfile,
    isLoading: currentProfileLoading,
    isError: currentProfileError,
    error: currentProfileErrorDetails,
  } = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
  })

  const isAdmin =
    currentProfile?.role === 'admin'

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
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string
      role: UserRole
    }) =>
      updateUserRole(userId, role),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-users'],
      })

      queryClient.invalidateQueries({
        queryKey: ['current-profile'],
      })
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({
      userId,
      statutCompte,
    }: {
      userId: string
      statutCompte: UserStatus
    }) =>
      updateUserStatus(
        userId,
        statutCompte
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-users'],
      })

      queryClient.invalidateQueries({
        queryKey: ['current-profile'],
      })
    },
  })

  const filteredUsers = useMemo(() => {
    const normalizedSearch =
      searchTerm
        .trim()
        .toLowerCase()

    if (!normalizedSearch) {
      return users
    }

    return users.filter((user) => {
      const translatedRole =
        formatRoleLabel(user.role)

      const translatedStatus =
        formatStatus(
          user.statut_compte
        )

      const content = [
        user.nom,
        user.email,
        user.role,
        translatedRole,
        user.statut_compte,
        translatedStatus,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return content.includes(
        normalizedSearch
      )
    })
  }, [
    users,
    searchTerm,
    i18n.language,
    i18n.resolvedLanguage,
  ])

  const isLoading = usersLoading

  const isUpdating =
    roleMutation.isPending ||
    statusMutation.isPending

  if (currentProfileLoading) {
    return (
      <div
        dir={i18n.dir()}
        className="rounded-xl bg-white p-6 text-slate-600"
      >
        {t(
          'vrificationDesDroitsAdministrateur',
          'Vérification des droits administrateur...'
        )}
      </div>
    )
  }

  if (currentProfileError) {
    return (
      <div
        dir={i18n.dir()}
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"
      >
        {(currentProfileErrorDetails as Error)
          ?.message ||
          t(
            'impossibleDeVrifierTonProfil',
            'Impossible de vérifier ton profil.'
          )}
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div
        dir={i18n.dir()}
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"
      >
        {t(
          'accsRefusCettePageEstRserveAuxAdministrateurs',
          'Accès refusé. Cette page est réservée aux administrateurs.'
        )}
      </div>
    )
  }

  return (
    <div dir={i18n.dir()}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            {t(
              'gestionDesUtilisateurs',
              'Gestion des utilisateurs'
            )}
          </h1>

          <p className="mt-2 text-slate-600">
            {t(
              'administrationDesComptesRlesEtStatutsUtilisateurs',
              'Administration des comptes, rôles et statuts utilisateurs.'
            )}
          </p>
        </div>

        <Link
          to="/administration/associations"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t(
            'gestionDesAssociations',
            'Gestion des associations'
          )}
        </Link>
      </div>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-md">
            <label className="block text-sm font-medium text-slate-700">
              {t(
                'rechercherUnUtilisateur',
                'Rechercher un utilisateur'
              )}
            </label>

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder={t(
                'nomEmailRleStatut',
                'Nom, email, rôle, statut...'
              )}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <p className="text-sm text-slate-500">
            {t(
              'lengthUtilisateursAffichsSurLength2',
              '{{length}} utilisateur(s) affiché(s) sur {{length2}}',
              {
                length:
                  filteredUsers.length,
                length2: users.length,
              }
            )}
          </p>
        </div>
      </section>

      {(roleMutation.isError ||
        statusMutation.isError) && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(roleMutation.error as Error)
            ?.message ||
            (statusMutation.error as Error)
              ?.message ||
            t(
              'erreurLorsDeLaMiseJourDeLutilisateur',
              'Erreur lors de la mise à jour de l’utilisateur.'
            )}
        </div>
      )}

      {isLoading && (
        <div className="rounded-xl bg-white p-6 text-slate-600">
          {t(
            'chargementDesUtilisateurs',
            'Chargement des utilisateurs...'
          )}
        </div>
      )}

      {usersError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {(usersErrorDetails as Error)
            ?.message ||
            t(
              'erreurLorsDuChargementDesUtilisateurs',
              'Erreur lors du chargement des utilisateurs.'
            )}
        </div>
      )}

      {!isLoading &&
        !usersError &&
        filteredUsers.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-slate-500">
            {t(
              'aucunUtilisateurTrouv',
              'Aucun utilisateur trouvé.'
            )}
          </div>
        )}

      {!isLoading &&
        !usersError &&
        filteredUsers.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden grid-cols-[1.4fr_1.4fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase text-slate-500 md:grid">
              <span>
                {t(
                  'utilisateur',
                  'Utilisateur'
                )}
              </span>

              <span>
                {t(
                  'email',
                  'Email'
                )}
              </span>

              <span>
                {t(
                  'rle',
                  'Rôle'
                )}
              </span>

              <span>
                {t(
                  'statut',
                  'Statut'
                )}
              </span>

              <span>
                {t(
                  'crLe',
                  'Créé le'
                )}
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {filteredUsers.map(
                (user) => {
                  const isCurrentUser =
                    user.id ===
                    currentProfile?.id

                  return (
                    <article
                      key={user.id}
                      className="grid gap-4 px-5 py-4 md:grid-cols-[1.4fr_1.4fr_1fr_1fr_1fr] md:items-center"
                    >
                      <div>
                        <p className="font-semibold text-slate-950">
                          {user.nom ||
                            t(
                              'nomNonRenseign',
                              'Nom non renseigné'
                            )}
                        </p>

                        {isCurrentUser && (
                          <p className="mt-1 text-xs font-medium text-indigo-600">
                            {t(
                              'compteConnect',
                              'Compte connecté'
                            )}
                          </p>
                        )}

                        <p className="text-xs text-slate-500 md:hidden">
                          {user.email ||
                            t(
                              'emailNonRenseign',
                              'Email non renseigné'
                            )}
                        </p>
                      </div>

                      <p className="hidden text-sm text-slate-600 md:block">
                        {user.email ||
                          t(
                            'emailNonRenseign',
                            'Email non renseigné'
                          )}
                      </p>

                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase text-slate-500 md:hidden">
                          {t(
                            'rle',
                            'Rôle'
                          )}
                        </label>

                        <select
                          value={
                            user.role ||
                            'citoyen'
                          }
                          disabled={
                            isUpdating ||
                            isCurrentUser
                          }
                          onChange={(
                            event
                          ) =>
                            roleMutation.mutate(
                              {
                                userId:
                                  user.id,

                                role: event
                                  .target
                                  .value as UserRole,
                              }
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                        >
                          {adminManageableRoles.map(
                            (
                              roleOption
                            ) => (
                              <option
                                key={
                                  roleOption.value
                                }
                                value={
                                  roleOption.value
                                }
                              >
                                {formatRoleLabel(
                                  roleOption.value
                                )}
                              </option>
                            )
                          )}
                        </select>

                        <p className="mt-1 text-xs text-slate-500">
                          {t(
                            'actuel',
                            'Actuel :'
                          )}{' '}
                          {formatRoleLabel(
                            user.role
                          )}
                        </p>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase text-slate-500 md:hidden">
                          {t(
                            'statut',
                            'Statut'
                          )}
                        </label>

                        <select
                          value={
                            user.statut_compte ||
                            'actif'
                          }
                          disabled={
                            isUpdating ||
                            isCurrentUser
                          }
                          onChange={(
                            event
                          ) =>
                            statusMutation.mutate(
                              {
                                userId:
                                  user.id,

                                statutCompte:
                                  event
                                    .target
                                    .value as UserStatus,
                              }
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                        >
                          {userStatusOptions.map(
                            (
                              statusOption
                            ) => (
                              <option
                                key={
                                  statusOption.value
                                }
                                value={
                                  statusOption.value
                                }
                              >
                                {formatStatus(
                                  statusOption.value
                                )}
                              </option>
                            )
                          )}
                        </select>

                        <p className="mt-1 text-xs text-slate-500">
                          {t(
                            'actuel',
                            'Actuel :'
                          )}{' '}
                          {formatStatus(
                            user.statut_compte
                          )}
                        </p>
                      </div>

                      <p className="text-sm text-slate-600">
                        {formatDate(
                          user.created_at
                        )}
                      </p>
                    </article>
                  )
                }
              )}
            </div>
          </div>
        )}
    </div>
  )
}