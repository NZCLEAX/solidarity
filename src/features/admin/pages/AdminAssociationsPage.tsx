import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAdminAssociations,
  respondAssociationRequest,
  updateAdminAssociation,
  type AdminAssociation,
} from '@/features/admin/api/associations'

function formatStatus(status: string | null | undefined) {
  const labels: Record<string, string> = {
    en_attente: 'En attente',
    validee: 'Active',
    active: 'Active',
    actif: 'Active',
    refusee: 'Refusée',
    suspendue: 'Suspendue',
  }

  if (!status) return 'Non renseigné'

  return labels[status] || status
}

function getStatusClass(status: string | null | undefined) {
  if (status === 'validee' || status === 'active' || status === 'actif') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  }

  if (status === 'en_attente') {
    return 'bg-orange-50 text-orange-700 ring-orange-200'
  }

  if (status === 'refusee') {
    return 'bg-red-50 text-red-700 ring-red-200'
  }

  if (status === 'suspendue') {
    return 'bg-slate-100 text-slate-700 ring-slate-200'
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

export default function AdminAssociationsPage() {
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [selectedAssociation, setSelectedAssociation] =
    useState<AdminAssociation | null>(null)

  const {
    data: associations = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['admin-associations'],
    queryFn: getAdminAssociations,
  })

  const updateMutation = useMutation({
    mutationFn: updateAdminAssociation,
    onSuccess: () => {
      setSelectedAssociation(null)
      queryClient.invalidateQueries({ queryKey: ['admin-associations'] })
      queryClient.invalidateQueries({ queryKey: ['current-profile'] })
    },
  })

  const decisionMutation = useMutation({
    mutationFn: ({
      associationId,
      decision,
    }: {
      associationId: string
      decision: 'validee' | 'refusee' | 'suspendue' | 'en_attente'
    }) => respondAssociationRequest(associationId, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-associations'] })
      queryClient.invalidateQueries({ queryKey: ['current-profile'] })
    },
  })

  const filteredAssociations = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase()

    if (!cleanSearch) return associations

    return associations.filter((association) => {
      return [
        association.nom,
        association.email,
        association.ville,
        association.zone_action,
        association.type_aide_principale,
        association.statut,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(cleanSearch))
    })
  }, [associations, search])

  function handleSelectAssociation(association: AdminAssociation) {
    setSelectedAssociation(association)
  }

  function updateSelectedField(field: keyof AdminAssociation, value: string) {
    setSelectedAssociation((current) => {
      if (!current) return current

      return {
        ...current,
        [field]: value,
      }
    })
  }

  function handleUpdate() {
    if (!selectedAssociation) return

    updateMutation.mutate({
      id: selectedAssociation.id,
      nom: selectedAssociation.nom || '',
      email: selectedAssociation.email || '',
      telephone: selectedAssociation.telephone || '',
      ville: selectedAssociation.ville || '',
      zoneAction: selectedAssociation.zone_action || '',
      typeAidePrincipale: selectedAssociation.type_aide_principale || '',
      description: selectedAssociation.description || '',
      statut: selectedAssociation.statut || 'en_attente',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8">
        <div className="rounded-[2rem] border border-[#eadfd6] bg-white p-8 text-slate-600">
          Chargement des associations...
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8">
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700">
          {(error as Error)?.message ||
            'Impossible de charger les associations.'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
            Administration
          </p>

          <h1 className="mt-3 text-4xl font-black text-slate-950">
            Gestion des associations
          </h1>

          <p className="mt-2 text-slate-600">
            Valide, refuse, suspend ou modifie les associations inscrites.
          </p>
        </div>

        {updateMutation.isError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {(updateMutation.error as Error)?.message ||
              'Impossible de mettre à jour l’association.'}
          </div>
        )}

        {decisionMutation.isError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {(decisionMutation.error as Error)?.message ||
              'Impossible de traiter l’association.'}
          </div>
        )}

        {(updateMutation.isSuccess || decisionMutation.isSuccess) && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">
            Mise à jour effectuée avec succès.
          </div>
        )}

        {selectedAssociation && (
          <section className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">
              Modifier une association
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                value={selectedAssociation.nom || ''}
                onChange={(event) =>
                  updateSelectedField('nom', event.target.value)
                }
                placeholder="Nom"
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
              />

              <input
                value={selectedAssociation.email || ''}
                onChange={(event) =>
                  updateSelectedField('email', event.target.value)
                }
                placeholder="Email"
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
              />

              <input
                value={selectedAssociation.telephone || ''}
                onChange={(event) =>
                  updateSelectedField('telephone', event.target.value)
                }
                placeholder="Téléphone"
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
              />

              <input
                value={selectedAssociation.ville || ''}
                onChange={(event) =>
                  updateSelectedField('ville', event.target.value)
                }
                placeholder="Ville"
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
              />

              <input
                value={selectedAssociation.zone_action || ''}
                onChange={(event) =>
                  updateSelectedField('zone_action', event.target.value)
                }
                placeholder="Zone d’action"
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
              />

              <input
                value={selectedAssociation.type_aide_principale || ''}
                onChange={(event) =>
                  updateSelectedField(
                    'type_aide_principale',
                    event.target.value
                  )
                }
                placeholder="Type d’aide principale"
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
              />

              <select
                value={selectedAssociation.statut || 'en_attente'}
                onChange={(event) =>
                  updateSelectedField('statut', event.target.value)
                }
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100 md:col-span-2"
              >
                <option value="en_attente">En attente</option>
                <option value="validee">Active / validée</option>
                <option value="refusee">Refusée</option>
                <option value="suspendue">Suspendue</option>
              </select>

              <textarea
                value={selectedAssociation.description || ''}
                onChange={(event) =>
                  updateSelectedField('description', event.target.value)
                }
                placeholder="Description"
                rows={4}
                className="resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100 md:col-span-2"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="rounded-2xl bg-[#d94a0b] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b93607] disabled:bg-slate-300"
              >
                Mettre à jour
              </button>

              <button
                type="button"
                onClick={() => setSelectedAssociation(null)}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                Annuler
              </button>
            </div>
          </section>
        )}

        <section className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <label className="text-sm font-bold text-slate-900">
                Rechercher une association
              </label>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nom, ville, email, statut..."
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100 lg:w-96"
              />
            </div>

            <p className="text-sm font-semibold text-slate-500">
              {filteredAssociations.length} association(s) affichée(s) sur{' '}
              {associations.length}
            </p>
          </div>
        </section>

        <section className="space-y-5">
          {filteredAssociations.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              Aucune association trouvée.
            </div>
          ) : (
            filteredAssociations.map((association) => (
              <article
                key={association.id}
                className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950">
                      {association.nom || 'Association sans nom'}
                    </h2>

                    <p className="mt-2 break-all text-sm font-semibold text-slate-500">
                      {association.email || 'Email non renseigné'}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusClass(
                      association.statut
                    )}`}
                  >
                    {formatStatus(association.statut)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Ville
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-950">
                      {association.ville || 'Non renseignée'}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Zone d’action
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-950">
                      {association.zone_action || 'Non renseignée'}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Aide principale
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-950">
                      {association.type_aide_principale || 'Non renseignée'}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Créée le
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-950">
                      {formatDate(association.created_at)}
                    </p>
                  </div>
                </div>

                {association.description && (
                  <p className="mt-5 text-sm leading-relaxed text-slate-600">
                    Description : {association.description}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  {association.statut !== 'validee' && (
                    <button
                      type="button"
                      disabled={decisionMutation.isPending}
                      onClick={() =>
                        decisionMutation.mutate({
                          associationId: association.id,
                          decision: 'validee',
                        })
                      }
                      className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:bg-slate-300"
                    >
                      Valider
                    </button>
                  )}

                  {association.statut !== 'refusee' && (
                    <button
                      type="button"
                      disabled={decisionMutation.isPending}
                      onClick={() =>
                        decisionMutation.mutate({
                          associationId: association.id,
                          decision: 'refusee',
                        })
                      }
                      className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:bg-slate-100"
                    >
                      Refuser
                    </button>
                  )}

                  {association.statut !== 'suspendue' && (
                    <button
                      type="button"
                      disabled={decisionMutation.isPending}
                      onClick={() =>
                        decisionMutation.mutate({
                          associationId: association.id,
                          decision: 'suspendue',
                        })
                      }
                      className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:bg-slate-100"
                    >
                      Suspendre
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSelectAssociation(association)}
                    className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    Modifier
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