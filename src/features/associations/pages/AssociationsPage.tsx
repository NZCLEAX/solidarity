import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrentProfile } from '@/features/auth/api/profile'
import {
  getMyJoinRequests,
  getValidatedAssociations,
  requestJoinAssociation,
} from '@/features/associations/api/associations'

function formatRequestStatus(status: string | null | undefined) {
  const labels: Record<string, string> = {
    en_attente: 'En attente',
    acceptee: 'Acceptée',
    refusee: 'Refusée',
    annulee: 'Annulée',
  }

  if (!status) return 'Disponible'

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

export default function AssociationsPage() {
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<Record<string, string>>({})

  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    error: profileError,
  } = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
    retry: false,
  })

  const {
    data: associations = [],
    isLoading: isLoadingAssociations,
    isError: isAssociationsError,
    error: associationsError,
  } = useQuery({
    queryKey: ['validated-associations'],
    queryFn: getValidatedAssociations,
  })

  const {
    data: myRequests = [],
    isLoading: isLoadingRequests,
    isError: isRequestsError,
    error: requestsError,
  } = useQuery({
    queryKey: ['my-join-requests'],
    queryFn: getMyJoinRequests,
    enabled: profile?.role === 'benevole',
  })

  const requestMutation = useMutation({
    mutationFn: ({
      associationId,
      message,
    }: {
      associationId: string
      message: string
    }) => requestJoinAssociation(associationId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-join-requests'] })
      queryClient.invalidateQueries({ queryKey: ['current-profile'] })
    },
  })

  const requestsByAssociationId = useMemo(() => {
    const result: Record<string, (typeof myRequests)[number]> = {}

    myRequests.forEach((request) => {
      if (!result[request.association_id]) {
        result[request.association_id] = request
      }

      if (request.statut === 'en_attente') {
        result[request.association_id] = request
      }

      if (request.statut === 'acceptee') {
        result[request.association_id] = request
      }
    })

    return result
  }, [myRequests])

  const isLoading =
    isLoadingProfile || isLoadingAssociations || isLoadingRequests

  const isError = isProfileError || isAssociationsError || isRequestsError

  function handleMessageChange(associationId: string, value: string) {
    setMessages((current) => ({
      ...current,
      [associationId]: value,
    }))
  }

  function handleRequest(associationId: string) {
    requestMutation.mutate({
      associationId,
      message:
        messages[associationId]?.trim() ||
        'Je souhaite rejoindre votre association en tant que bénévole.',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#eadfd6] bg-white p-8 text-slate-600">
          Chargement des associations...
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700">
          {(profileError as Error)?.message ||
            (associationsError as Error)?.message ||
            (requestsError as Error)?.message ||
            'Impossible de charger les associations.'}
        </div>
      </div>
    )
  }

  if (profile?.role !== 'benevole') {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-orange-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
            Associations
          </p>

          <h1 className="mt-3 text-4xl font-black text-slate-950">
            Accès réservé aux bénévoles
          </h1>

          <p className="mt-3 text-slate-600">
            Cette page permet aux bénévoles de demander à rejoindre une
            association validée.
          </p>
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
              Associations
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Rejoindre une association
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Choisis une association validée, envoie ta demande, puis attends
              sa validation pour accéder aux points terrain.
            </p>
          </div>

          <div className="rounded-3xl border border-[#eadfd6] bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Associations disponibles
            </p>
            <p className="mt-1 text-3xl font-black text-slate-950">
              {associations.length}
            </p>
          </div>
        </div>

        {requestMutation.isError && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {(requestMutation.error as Error)?.message ||
              'Impossible d’envoyer la demande.'}
          </div>
        )}

        {requestMutation.isSuccess && (
          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">
            Demande envoyée avec succès.
          </div>
        )}

        {associations.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Aucune association validée n’est disponible pour le moment.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {associations.map((association) => {
              const request = requestsByAssociationId[association.id]
              const isPending = request?.statut === 'en_attente'
              const isAccepted = request?.statut === 'acceptee'
              const isDisabled =
                requestMutation.isPending || isPending || isAccepted

              return (
                <article
                  key={association.id}
                  className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-950">
                        {association.nom || 'Association sans nom'}
                      </h2>

                      <p className="mt-2 text-sm font-medium text-slate-500">
                        {association.ville || 'Ville non renseignée'}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${getRequestStatusClass(
                        request?.statut
                      )}`}
                    >
                      {request
                        ? formatRequestStatus(request.statut)
                        : 'Disponible'}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
                        Type d’aide
                      </p>
                      <p className="mt-2 text-sm font-black text-slate-950">
                        {association.type_aide_principale || 'Non renseigné'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Description
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {association.description ||
                        'Aucune description renseignée.'}
                    </p>
                  </div>

                  <div className="mt-5 rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Contact
                    </p>
                    <p className="mt-2 break-all text-sm font-black text-slate-950">
                      {association.email || 'Non renseigné'}
                    </p>
                  </div>

                  {!isPending && !isAccepted && (
                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-bold text-slate-800">
                        Message pour l’association
                      </label>

                      <textarea
                        value={messages[association.id] || ''}
                        onChange={(event) =>
                          handleMessageChange(
                            association.id,
                            event.target.value
                          )
                        }
                        rows={3}
                        placeholder="Explique rapidement pourquoi tu veux rejoindre cette association..."
                        className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                      />
                    </div>
                  )}

                  {isPending && (
                    <div className="mt-5 rounded-3xl border border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-orange-700">
                      Ta demande est en attente de réponse.
                    </div>
                  )}

                  {isAccepted && (
                    <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                      Ta demande a été acceptée. Ton compte est maintenant
                      rattaché à cette association.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRequest(association.id)}
                    disabled={isDisabled}
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#d94a0b] px-5 py-3 text-sm font-black text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isPending
                      ? 'Demande en attente'
                      : isAccepted
                        ? 'Déjà accepté'
                        : requestMutation.isPending
                          ? 'Envoi en cours...'
                          : 'Demander à rejoindre'}
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}