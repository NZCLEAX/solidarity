import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAssociationVolunteers,
  updateAssociationVolunteerStatus,
  type AssociationVolunteer,
  type VolunteerAction,
} from '@/features/associations/api/associations'

function formatStatus(status: string | null | undefined) {
  const labels: Record<string, string> = {
    actif: 'Actif',
    en_attente: 'En attente',
    suspendu: 'Suspendu',
    refuse: 'Refusé',
  }

  if (!status) return 'Non renseigné'

  return labels[status] || status
}

function getStatusClass(status: string | null | undefined) {
  if (status === 'actif') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  }

  if (status === 'en_attente') {
    return 'bg-orange-50 text-orange-700 ring-orange-200'
  }

  if (status === 'suspendu') {
    return 'bg-slate-100 text-slate-700 ring-slate-200'
  }

  if (status === 'refuse') {
    return 'bg-red-50 text-red-700 ring-red-200'
  }

  return 'bg-slate-100 text-slate-700 ring-slate-200'
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Non renseignée'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Non renseignée'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export default function AssociationTeamPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const {
    data: volunteers = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['association-volunteers'],
    queryFn: getAssociationVolunteers,
  })

  const mutation = useMutation({
    mutationFn: ({
      volunteerId,
      action,
    }: {
      volunteerId: string
      action: VolunteerAction
    }) => updateAssociationVolunteerStatus(volunteerId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['association-volunteers'] })
      queryClient.invalidateQueries({ queryKey: ['current-profile'] })
    },
  })

  const filteredVolunteers = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase()

    if (!cleanSearch) return volunteers

    return volunteers.filter((volunteer) => {
      return [volunteer.nom, volunteer.email, volunteer.statut_compte]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(cleanSearch))
    })
  }, [volunteers, search])

  const activeCount = volunteers.filter(
    (volunteer) => volunteer.statut_compte === 'actif'
  ).length

  const suspendedCount = volunteers.filter(
    (volunteer) => volunteer.statut_compte === 'suspendu'
  ).length

  function handleAction(volunteer: AssociationVolunteer, action: VolunteerAction) {
    mutation.mutate({
      volunteerId: volunteer.id,
      action,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#eadfd6] bg-white p-8 text-slate-600">
          Chargement de ton équipe...
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700">
          {(error as Error)?.message || 'Impossible de charger ton équipe.'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
              Association
            </p>

            <h1 className="mt-3 text-4xl font-black text-slate-950">
              Mon équipe bénévole
            </h1>

            <p className="mt-2 max-w-3xl text-slate-600">
              Gère les bénévoles rattachés à ton association. Tu peux activer,
              suspendre ou retirer un bénévole.
            </p>
          </div>

          <Link
            to="/association/demandes"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#d94a0b] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b93607]"
          >
            Voir les demandes
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Bénévoles
            </p>
            <p className="mt-2 text-4xl font-black text-slate-950">
              {volunteers.length}
            </p>
          </div>

          <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              Actifs
            </p>
            <p className="mt-2 text-4xl font-black text-emerald-700">
              {activeCount}
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Suspendus
            </p>
            <p className="mt-2 text-4xl font-black text-slate-950">
              {suspendedCount}
            </p>
          </div>
        </div>

        {mutation.isError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {(mutation.error as Error)?.message ||
              'Impossible de modifier ce bénévole.'}
          </div>
        )}

        {mutation.isSuccess && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">
            Bénévole mis à jour avec succès.
          </div>
        )}

        <section className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <label className="text-sm font-bold text-slate-900">
                Rechercher un bénévole
              </label>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nom, email, statut..."
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100 lg:w-96"
              />
            </div>

            <p className="text-sm font-semibold text-slate-500">
              {filteredVolunteers.length} bénévole(s) affiché(s) sur{' '}
              {volunteers.length}
            </p>
          </div>
        </section>

        <section className="space-y-5">
          {filteredVolunteers.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              Aucun bénévole rattaché pour le moment.
            </div>
          ) : (
            filteredVolunteers.map((volunteer) => (
              <article
                key={volunteer.id}
                className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950">
                      {volunteer.nom || 'Bénévole sans nom'}
                    </h2>

                    <p className="mt-2 break-all text-sm font-semibold text-slate-500">
                      {volunteer.email || 'Email non renseigné'}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusClass(
                      volunteer.statut_compte
                    )}`}
                  >
                    {formatStatus(volunteer.statut_compte)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Rôle
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-950">
                      Bénévole
                    </p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Statut
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-950">
                      {formatStatus(volunteer.statut_compte)}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Inscrit le
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-950">
                      {formatDate(volunteer.created_at)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {volunteer.statut_compte !== 'actif' && (
                    <button
                      type="button"
                      disabled={mutation.isPending}
                      onClick={() => handleAction(volunteer, 'actif')}
                      className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:bg-slate-300"
                    >
                      Activer
                    </button>
                  )}

                  {volunteer.statut_compte !== 'suspendu' && (
                    <button
                      type="button"
                      disabled={mutation.isPending}
                      onClick={() => handleAction(volunteer, 'suspendu')}
                      className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:bg-slate-100"
                    >
                      Suspendre
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={mutation.isPending}
                    onClick={() => handleAction(volunteer, 'retirer')}
                    className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:bg-slate-100"
                  >
                    Retirer de l’association
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  )
}