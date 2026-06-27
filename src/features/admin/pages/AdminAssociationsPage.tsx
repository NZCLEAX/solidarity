import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAdminAssociations,
  getAdminAssociationDocuments,
  getSignedAssociationDocumentUrl,
  recomputeAssociationVerification,
  respondAssociationRequest,
  type AdminAssociation,
  type AssociationDocument,
} from '@/features/admin/api/associations'

function formatStatus(status: string | null | undefined) {
  const labels: Record<string, string> = {
    en_attente: 'En attente',
    validee: 'Validée',
    refusee: 'Refusée',
    suspendue: 'Suspendue',
    en_attente_documents: 'Documents attendus',
    en_verification: 'En vérification',
    pre_verifiee: 'Pré-vérifiée',
    verification_manuelle: 'Vérification manuelle',
  }

  if (!status) return 'Non renseigné'

  return labels[status] || status
}

function getScoreLabel(score: number | null | undefined) {
  if (score === null || score === undefined) return '0/100'

  return `${score}/100`
}

function getScoreClass(score: number | null | undefined) {
  if (!score) return 'bg-slate-100 text-slate-600 border-slate-200'
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (score >= 50) return 'bg-orange-50 text-orange-700 border-orange-200'

  return 'bg-red-50 text-red-700 border-red-200'
}

function getDocumentLabel(type: string) {
  const labels: Record<string, string> = {
    statuts: 'Statuts',
    recepisse: 'Récépissé',
    pv_bureau: 'PV bureau',
    autre: 'Autre',
  }

  return labels[type] || type
}

function formatFileSize(size: number | null | undefined) {
  if (!size) return 'Taille inconnue'

  const mb = size / 1024 / 1024

  return `${mb.toFixed(2)} Mo`
}

export default function AdminAssociationsPage() {
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [selectedAssociation, setSelectedAssociation] =
    useState<AdminAssociation | null>(null)
  const [documentsOpenFor, setDocumentsOpenFor] = useState<string | null>(null)
  const [openingDocumentId, setOpeningDocumentId] = useState<string | null>(null)

  const associationsQuery = useQuery({
    queryKey: ['admin-associations'],
    queryFn: getAdminAssociations,
  })

  const documentsQuery = useQuery({
    queryKey: ['admin-association-documents', documentsOpenFor],
    queryFn: () => getAdminAssociationDocuments(documentsOpenFor as string),
    enabled: Boolean(documentsOpenFor),
  })

  const decisionMutation = useMutation({
    mutationFn: async ({
      associationId,
      decision,
    }: {
      associationId: string
      decision: 'validee' | 'refusee' | 'suspendue' | 'en_attente'
    }) => {
      await respondAssociationRequest(associationId, decision)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin-associations'],
      })
    },
  })

  const recomputeMutation = useMutation({
    mutationFn: recomputeAssociationVerification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin-associations'],
      })
    },
  })

  const associations = associationsQuery.data ?? []

  const filteredAssociations = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase()

    if (!cleanSearch) return associations

    return associations.filter((association) => {
      const values = [
        association.nom,
        association.email,
        association.ville,
        association.siren,
        association.siret,
        association.representant_nom,
        association.official_name,
      ]

      return values.some((value) =>
        value?.toLowerCase().includes(cleanSearch)
      )
    })
  }, [associations, search])

  async function handleOpenDocument(document: AssociationDocument) {
    try {
      setOpeningDocumentId(document.id)

      const url = await getSignedAssociationDocumentUrl(document.file_path)

      window.open(url, '_blank', 'noopener,noreferrer')
    } finally {
      setOpeningDocumentId(null)
    }
  }

  function handleOpenDocuments(association: AdminAssociation) {
    setSelectedAssociation(association)
    setDocumentsOpenFor(association.id)
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
                Administration
              </p>

              <h1 className="mt-3 text-4xl font-black text-slate-950">
                Dossiers associations
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
                Vérifie les associations, leurs informations officielles, leur
                score et leurs documents justificatifs.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
              <p>
                Total associations :{' '}
                <span className="font-black text-slate-950">
                  {associations.length}
                </span>
              </p>

              <p className="mt-1">
                À vérifier :{' '}
                <span className="font-black text-[#d94a0b]">
                  {
                    associations.filter(
                      (item) =>
                        item.statut === 'en_attente' ||
                        item.verification_status === 'verification_manuelle' ||
                        item.verification_status === 'en_attente_documents'
                    ).length
                  }
                </span>
              </p>
            </div>
          </div>

          {associationsQuery.isError && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {(associationsQuery.error as Error)?.message ||
                'Impossible de charger les associations.'}
            </div>
          )}

          {decisionMutation.isError && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {(decisionMutation.error as Error)?.message ||
                'Impossible de modifier le statut.'}
            </div>
          )}

          {recomputeMutation.isError && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {(recomputeMutation.error as Error)?.message ||
                'Impossible de recalculer le score.'}
            </div>
          )}

          <div className="mt-8">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par nom, email, SIRET, SIREN..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div className="mt-8 grid gap-5">
            {associationsQuery.isLoading && (
              <div className="rounded-3xl border border-[#eadfd6] bg-slate-50 p-6 text-slate-600">
                Chargement des associations...
              </div>
            )}

            {!associationsQuery.isLoading &&
              filteredAssociations.length === 0 && (
                <div className="rounded-3xl border border-[#eadfd6] bg-slate-50 p-6 text-slate-600">
                  Aucune association trouvée.
                </div>
              )}

            {filteredAssociations.map((association) => (
              <article
                key={association.id}
                className="rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-black text-slate-950">
                        {association.nom || 'Association sans nom'}
                      </h2>

                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">
                        {formatStatus(association.statut)}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${getScoreClass(
                          association.verification_score
                        )}`}
                      >
                        Score {getScoreLabel(association.verification_score)}
                      </span>

                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                        {formatStatus(association.verification_status)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-3">
                      <p>
                        <span className="font-black text-slate-950">
                          Email :
                        </span>{' '}
                        {association.email || 'Non renseigné'}
                      </p>

                      <p>
                        <span className="font-black text-slate-950">
                          Téléphone :
                        </span>{' '}
                        {association.telephone || 'Non renseigné'}
                      </p>

                      <p>
                        <span className="font-black text-slate-950">
                          Ville :
                        </span>{' '}
                        {association.ville || 'Non renseignée'}
                      </p>

                      <p>
                        <span className="font-black text-slate-950">
                          SIRET :
                        </span>{' '}
                        {association.siret || 'Non renseigné'}
                      </p>

                      <p>
                        <span className="font-black text-slate-950">
                          SIREN :
                        </span>{' '}
                        {association.siren || 'Non renseigné'}
                      </p>

                      <p>
                        <span className="font-black text-slate-950">
                          Représentant :
                        </span>{' '}
                        {association.representant_nom || 'Non renseigné'}
                      </p>

                      <p>
                        <span className="font-black text-slate-950">
                          Fonction :
                        </span>{' '}
                        {association.representant_fonction || 'Non renseignée'}
                      </p>

                      <p>
                        <span className="font-black text-slate-950">
                          Documents :
                        </span>{' '}
                        {association.docs_count ?? 0}
                      </p>
                    </div>

                    <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                      <p>
                        <span className="font-black text-slate-950">
                          Nom officiel :
                        </span>{' '}
                        {association.official_name || 'Non vérifié'}
                      </p>

                      <p className="mt-1">
                        <span className="font-black text-slate-950">
                          Ville officielle :
                        </span>{' '}
                        {association.official_city || 'Non vérifiée'}
                      </p>

                      <p className="mt-1">
                        <span className="font-black text-slate-950">
                          SIREN officiel :
                        </span>{' '}
                        {association.official_siren || 'Non vérifié'}
                      </p>

                      <p className="mt-1">
                        <span className="font-black text-slate-950">
                          Notes :
                        </span>{' '}
                        {association.verification_notes || 'Aucune note'}
                      </p>
                    </div>

                    {association.description && (
                      <p className="mt-4 text-sm leading-relaxed text-slate-600">
                        {association.description}
                      </p>
                    )}
                  </div>

                  <div className="flex w-full flex-col gap-2 xl:w-56">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenDocuments(association)
                      }
                      className="min-h-11 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                    >
                      Voir documents
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        recomputeMutation.mutate(association.id)
                      }
                      disabled={recomputeMutation.isPending}
                      className="min-h-11 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-black text-[#d94a0b] transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      Recalculer score
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        decisionMutation.mutate({
                          associationId: association.id,
                          decision: 'validee',
                        })
                      }
                      disabled={decisionMutation.isPending}
                      className="min-h-11 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Valider
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        decisionMutation.mutate({
                          associationId: association.id,
                          decision: 'refusee',
                        })
                      }
                      disabled={decisionMutation.isPending}
                      className="min-h-11 rounded-2xl bg-red-600 px-4 py-2 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Refuser
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        decisionMutation.mutate({
                          associationId: association.id,
                          decision: 'suspendue',
                        })
                      }
                      disabled={decisionMutation.isPending}
                      className="min-h-11 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Suspendre
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {selectedAssociation && (
          <div className="mt-8 rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
                  Documents
                </p>

                <h2 className="mt-2 text-3xl font-black text-slate-950">
                  {selectedAssociation.nom || 'Association'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedAssociation(null)
                  setDocumentsOpenFor(null)
                }}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                Fermer
              </button>
            </div>

            {documentsQuery.isLoading && (
              <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-slate-600">
                Chargement des documents...
              </div>
            )}

            {documentsQuery.isError && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {(documentsQuery.error as Error)?.message ||
                  'Impossible de charger les documents.'}
              </div>
            )}

            {!documentsQuery.isLoading &&
              !documentsQuery.isError &&
              (documentsQuery.data ?? []).length === 0 && (
                <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-slate-600">
                  Aucun document envoyé.
                </div>
              )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {(documentsQuery.data ?? []).map((document) => (
                <div
                  key={document.id}
                  className="rounded-3xl border border-[#eadfd6] bg-slate-50 p-5"
                >
                  <p className="text-lg font-black text-slate-950">
                    {getDocumentLabel(document.type_document)}
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    {document.file_name}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {formatFileSize(document.file_size)}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Statut : {formatStatus(document.verification_status)}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleOpenDocument(document)}
                    disabled={openingDocumentId === document.id}
                    className="mt-4 min-h-11 rounded-2xl bg-[#d94a0b] px-4 py-2 text-sm font-black text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {openingDocumentId === document.id
                      ? 'Ouverture...'
                      : 'Ouvrir le PDF'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}