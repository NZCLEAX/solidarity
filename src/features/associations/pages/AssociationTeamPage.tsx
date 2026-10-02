import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  getAssociationVolunteers,
  updateAssociationVolunteerStatus,
  type AssociationVolunteer,
  type VolunteerAction,
} from '@/features/associations/api/associations'

function formatStatus(
  status: string | null | undefined
) {
  const labels: Record<string, string> = {
    actif: 'Actif',
    en_attente: 'En attente',
    suspendu: 'Suspendu',
    refuse: 'Refusé',
  }

  if (!status) {
    return 'Non renseigné'
  }

  return labels[status] || status
}

function getStatusClass(
  status: string | null | undefined
) {
  if (status === 'actif') {
    return (
      'bg-emerald-50 text-emerald-700 ' +
      'ring-emerald-200 ' +
      'dark:bg-emerald-950/40 ' +
      'dark:text-emerald-300 ' +
      'dark:ring-emerald-800'
    )
  }

  if (status === 'en_attente') {
    return (
      'bg-orange-50 text-orange-700 ' +
      'ring-orange-200 ' +
      'dark:bg-orange-950/40 ' +
      'dark:text-orange-300 ' +
      'dark:ring-orange-800'
    )
  }

  if (status === 'suspendu') {
    return (
      'bg-slate-100 text-slate-700 ' +
      'ring-slate-200 ' +
      'dark:bg-slate-800 ' +
      'dark:text-slate-200 ' +
      'dark:ring-slate-700'
    )
  }

  if (status === 'refuse') {
    return (
      'bg-red-50 text-red-700 ' +
      'ring-red-200 ' +
      'dark:bg-red-950/40 ' +
      'dark:text-red-300 ' +
      'dark:ring-red-800'
    )
  }

  return (
    'bg-slate-100 text-slate-700 ' +
    'ring-slate-200 ' +
    'dark:bg-slate-800 ' +
    'dark:text-slate-200 ' +
    'dark:ring-slate-700'
  )
}

function formatDate(
  value: string | null | undefined
) {
  if (!value) {
    return 'Non renseignée'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Non renseignée'
  }

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  ).format(date)
}

export default function AssociationTeamPage() {
  const queryClient = useQueryClient()

  const [search, setSearch] =
    useState('')

  const {
    data: volunteers = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'association-volunteers',
    ],

    queryFn:
      getAssociationVolunteers,

    staleTime: 0,
  })

  const mutation = useMutation({
    mutationFn: ({
      volunteerId,
      action,
    }: {
      volunteerId: string
      action: VolunteerAction
    }) =>
      updateAssociationVolunteerStatus(
        volunteerId,
        action
      ),

    onSuccess: async () => {
      /*
       * On invalide toutes les données
       * liées aux bénévoles.
       */
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            'association-volunteers',
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'association-join-requests',
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'current-profile',
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'my-association-join-requests',
          ],
        }),
      ])

      /*
       * On force également la récupération
       * immédiate de l'équipe.
       */
      await refetch()
    },
  })

  const filteredVolunteers =
    useMemo(() => {
      const cleanSearch =
        search
          .trim()
          .toLowerCase()

      if (!cleanSearch) {
        return volunteers
      }

      return volunteers.filter(
        (volunteer) => {
          return [
            volunteer.nom,
            volunteer.email,
            volunteer.statut_compte,
          ]
            .filter(Boolean)
            .some((value) =>
              value
                ?.toLowerCase()
                .includes(
                  cleanSearch
                )
            )
        }
      )
    }, [
      volunteers,
      search,
    ])

  const activeCount =
    volunteers.filter(
      (volunteer) =>
        volunteer.statut_compte ===
        'actif'
    ).length

  const suspendedCount =
    volunteers.filter(
      (volunteer) =>
        volunteer.statut_compte ===
        'suspendu'
    ).length

  function handleAction(
    volunteer: AssociationVolunteer,
    action: VolunteerAction
  ) {
    if (
      action === 'retirer'
    ) {
      const confirmed =
        window.confirm(
          `Retirer ${
            volunteer.nom ||
            'ce bénévole'
          } de l'association ?`
        )

      if (!confirmed) {
        return
      }
    }

    mutation.mutate({
      volunteerId:
        volunteer.id,

      action,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 dark:bg-[#020817]">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#eadfd6] bg-white p-8 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Chargement de ton équipe...
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 dark:bg-[#020817]">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {(error as Error)
            ?.message ||
            'Impossible de charger ton équipe.'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8 dark:bg-[#020817]">
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* HEADER */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
              Association
            </p>

            <h1 className="mt-3 text-4xl font-black text-slate-950 dark:text-white">
              Mon équipe bénévole
            </h1>

            <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">
              Gère les bénévoles
              rattachés à ton
              association. Tu peux
              activer, suspendre ou
              retirer un bénévole.
            </p>
          </div>

          <Link
            to="/association/demandes"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#d94a0b] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b93607]"
          >
            Voir les demandes
          </Link>
        </div>

        {/* STATISTIQUES */}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Bénévoles
            </p>

            <p className="mt-2 text-4xl font-black text-slate-950 dark:text-white">
              {volunteers.length}
            </p>
          </div>

          <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              Actifs
            </p>

            <p className="mt-2 text-4xl font-black text-emerald-700 dark:text-emerald-300">
              {activeCount}
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Suspendus
            </p>

            <p className="mt-2 text-4xl font-black text-slate-950 dark:text-white">
              {suspendedCount}
            </p>
          </div>
        </div>

        {/* ERREUR ACTION */}

        {mutation.isError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {(mutation.error as Error)
              ?.message ||
              'Impossible de modifier ce bénévole.'}
          </div>
        )}

        {/* SUCCÈS ACTION */}

        {mutation.isSuccess && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            Bénévole mis à jour avec
            succès.
          </div>
        )}

        {/* RECHERCHE */}

        <section className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <label className="text-sm font-bold text-slate-900 dark:text-white">
                Rechercher un
                bénévole
              </label>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Nom, email, statut..."
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100 lg:w-96 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-orange-950/40"
              />
            </div>

            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {
                filteredVolunteers.length
              }{' '}
              bénévole(s) affiché(s)
              sur{' '}
              {
                volunteers.length
              }
            </p>
          </div>
        </section>

        {/* LISTE */}

        <section className="space-y-5">
          {filteredVolunteers.length ===
          0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Aucun bénévole rattaché
              pour le moment.
            </div>
          ) : (
            filteredVolunteers.map(
              (volunteer) => (
                <article
                  key={
                    volunteer.id
                  }
                  className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                        {volunteer.nom ||
                          'Bénévole sans nom'}
                      </h2>

                      <p className="mt-2 break-all text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {volunteer.email ||
                          'Email non renseigné'}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusClass(
                        volunteer.statut_compte
                      )}`}
                    >
                      {formatStatus(
                        volunteer.statut_compte
                      )}
                    </span>
                  </div>

                  {/* INFORMATIONS */}

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Rôle
                      </p>

                      <p className="mt-2 text-sm font-black text-slate-950 dark:text-white">
                        Bénévole
                      </p>
                    </div>

                    <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Statut
                      </p>

                      <p className="mt-2 text-sm font-black text-slate-950 dark:text-white">
                        {formatStatus(
                          volunteer.statut_compte
                        )}
                      </p>
                    </div>

                    <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Inscrit le
                      </p>

                      <p className="mt-2 text-sm font-black text-slate-950 dark:text-white">
                        {formatDate(
                          volunteer.created_at
                        )}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="mt-6 flex flex-wrap gap-3">
                    {volunteer.statut_compte !==
                      'actif' && (
                      <button
                        type="button"
                        disabled={
                          mutation.isPending
                        }
                        onClick={() =>
                          handleAction(
                            volunteer,
                            'actif'
                          )
                        }
                        className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {mutation.isPending
                          ? 'Traitement...'
                          : 'Activer'}
                      </button>
                    )}

                    {volunteer.statut_compte !==
                      'suspendu' && (
                      <button
                        type="button"
                        disabled={
                          mutation.isPending
                        }
                        onClick={() =>
                          handleAction(
                            volunteer,
                            'suspendu'
                          )
                        }
                        className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        {mutation.isPending
                          ? 'Traitement...'
                          : 'Suspendre'}
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={
                        mutation.isPending
                      }
                      onClick={() =>
                        handleAction(
                          volunteer,
                          'retirer'
                        )
                      }
                      className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                    >
                      {mutation.isPending
                        ? 'Traitement...'
                        : "Retirer de l'association"}
                    </button>
                  </div>
                </article>
              )
            )
          )}
        </section>
      </div>
    </div>
  )
}