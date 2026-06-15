import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAssociationJoinRequests,
  respondJoinRequest,
} from '@/features/associations/api/associations'

function formatDate(value: string | null | undefined) {
  if (!value) return 'Non renseignée'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Non renseignée'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatRequestStatus(status: string | null | undefined) {
  const labels: Record<string, string> = {
    en_attente: 'En attente',
    acceptee: 'Acceptée',
    refusee: 'Refusée',
    annulee: 'Annulée',
  }

  if (!status) return 'Non renseigné'

  return labels[status] || status
}

function getRequestStatusClass(status: string | null | undefined) {
  if (status === 'acceptee') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  }

  if (status === 'en_attente') {
    return 'bg-orange-50 text-orange-700 ring-orange-200'
  }

  if (status === 'refusee') {
    return 'bg-red-50 text-red-700 ring-red-200'
  }

  return 'bg-slate-100 text-slate-700 ring-slate-200'
}

export default function AssociationRequestsPage() {
  const queryClient = useQueryClient()

  const {
    data: requests = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['association-join-requests'],
    queryFn: getAssociationJoinRequests,
  })

  const respondMutation = useMutation({
    mutationFn: ({
      requestId,
      decision,
    }: {
      requestId: string
      decision: 'acceptee' | 'refusee'
    }) => respondJoinRequest(requestId, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['association-join-requests'],
      })
      queryClient.invalidateQueries({
        queryKey: ['current-profile'],
      })
    },
  })

  const pendingRequests = requests.filter(
    (request) => request.statut === 'en_attente'
  )

  const handledRequests = requests.filter(
    (request) => request.statut !== 'en_attente'
  )

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#eadfd6] bg-white p-8 text-slate-600">
          Chargement des demandes bénévoles...
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700">
          {(error as Error)?.message ||
            'Impossible de charger les demandes bénévoles.'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
              Association
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Demandes bénévoles
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Accepte ou refuse les bénévoles qui souhaitent rejoindre ton
              association.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-orange-200 bg-orange-50 px-5 py-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                En attente
              </p>
              <p className="mt-1 text-3xl font-black text-orange-700">
                {pendingRequests.length}
              </p>
            </div>

            <div className="rounded-3xl border border-[#eadfd6] bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Total
              </p>
              <p className="mt-1 text-3xl font-black text-slate-950">
                {requests.length}
              </p>
            </div>
          </div>
        </div>

        {respondMutation.isError && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {(respondMutation.error as Error)?.message ||
              'Impossible de traiter la demande.'}
          </div>
        )}

        {respondMutation.isSuccess && (
          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">
            Demande traitée avec succès.
          </div>
        )}

        <section>
          <h2 className="mb-4 text-2xl font-black text-slate-950">
            Demandes en attente
          </h2>

          {pendingRequests.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              Aucune demande en attente.
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {pendingRequests.map((request) => (
                <article
                  key={request.id}
                  className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-slate-950">
                        {request.benevole_nom || 'Bénévole sans nom'}
                      </h3>

                      <p className="mt-2 break-all text-sm font-semibold text-slate-500">
                        {request.benevole_email || 'Email non renseigné'}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${getRequestStatusClass(
                        request.statut
                      )}`}
                    >
                      {formatRequestStatus(request.statut)}
                    </span>
                  </div>

                  <div className="mt-5 rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Message
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {request.message || 'Aucun message envoyé.'}
                    </p>
                  </div>

                  <div className="mt-5 rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Date de demande
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-950">
                      {formatDate(request.created_at)}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={respondMutation.isPending}
                      onClick={() =>
                        respondMutation.mutate({
                          requestId: request.id,
                          decision: 'acceptee',
                        })
                      }
                      className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Accepter
                    </button>

                    <button
                      type="button"
                      disabled={respondMutation.isPending}
                      onClick={() =>
                        respondMutation.mutate({
                          requestId: request.id,
                          decision: 'refusee',
                        })
                      }
                      className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                    >
                      Refuser
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-black text-slate-950">
            Historique
          </h2>

          {handledRequests.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              Aucun historique pour le moment.
            </div>
          ) : (
            <div className="grid gap-4">
              {handledRequests.map((request) => (
                <article
                  key={request.id}
                  className="rounded-3xl border border-[#eadfd6] bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-950">
                        {request.benevole_nom || 'Bénévole sans nom'}
                      </h3>

                      <p className="mt-1 break-all text-sm font-semibold text-slate-500">
                        {request.benevole_email || 'Email non renseigné'}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${getRequestStatusClass(
                        request.statut
                      )}`}
                    >
                      {formatRequestStatus(request.statut)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}