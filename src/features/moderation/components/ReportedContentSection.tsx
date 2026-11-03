import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  MissingModerationTablesError,
  getOpenContentReports,
  resolveContentReport,
} from '@/features/moderation/api/contentReports'
import { rejectPoint } from '@/features/points/api/points'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

// Contenus signalés par les utilisateurs, en tête de la page Modération.
// Même présentation que la liste des interventions.
export default function ReportedContentSection() {
  const queryClient = useQueryClient()

  const {
    data: reports = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['signalements-contenu'],
    queryFn: getOpenContentReports,
  })

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['signalements-contenu'] })
    queryClient.invalidateQueries({ queryKey: ['points'] })
  }

  const removeMutation = useMutation({
    mutationFn: async (input: { reportId: string; pointId: string }) => {
      await rejectPoint(input.pointId)
      await resolveContentReport(input.reportId, 'traite')
    },
    onSuccess: refresh,
  })

  const dismissMutation = useMutation({
    mutationFn: (input: { reportId: string; statut: 'traite' | 'rejete' }) =>
      resolveContentReport(input.reportId, input.statut),
    onSuccess: refresh,
  })

  const isUpdating = removeMutation.isPending || dismissMutation.isPending
  const errorMessage =
    (error instanceof MissingModerationTablesError
      ? error.message
      : (error as Error | null)?.message) ||
    (removeMutation.error as Error | null)?.message ||
    (dismissMutation.error as Error | null)?.message ||
    ''

  return (
    <section className="mb-8 border-t border-slate-200 pt-5">
      <h2 className="text-base font-semibold text-slate-950">
        Contenus signalés ({reports.length})
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        À traiter rapidement : retire le point s’il enfreint les CGU, ou
        classe le signalement sans suite.
      </p>

      {isLoading && (
        <p className="mt-3 text-sm text-slate-500">
          Chargement des signalements...
        </p>
      )}

      {errorMessage && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      )}

      {!isLoading && !error && reports.length === 0 && (
        <p className="mt-3 text-sm text-slate-500">
          Aucun contenu signalé pour le moment.
        </p>
      )}

      {reports.length > 0 && (
        <div className="mt-4 space-y-3">
          {reports.map((report) => {
            const pointRemoved = report.point?.actif === false

            return (
              <article
                key={report.id}
                className="min-w-0 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="break-words font-semibold text-slate-950">
                    {report.point?.adresse || 'Point supprimé ou introuvable'}
                  </h3>

                  <span className="shrink-0 text-xs font-medium text-red-600">
                    {report.motif}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Signalé le {formatDate(report.created_at)}
                  {pointRemoved && ' · point déjà retiré de la carte'}
                </p>

                {report.point?.commentaire && (
                  <p className="mt-2 break-words text-sm italic text-slate-500">
                    « {report.point.commentaire} »
                  </p>
                )}

                {report.details && (
                  <p className="mt-2 break-words text-sm text-slate-600">
                    Précisions : {report.details}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 whitespace-nowrap text-sm font-semibold">
                  {report.point && (
                    <Link
                      to={`/points/${report.point_id}`}
                      className="text-[#d94a0b]"
                    >
                      Voir le point
                    </Link>
                  )}

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() =>
                      dismissMutation.mutate({
                        reportId: report.id,
                        statut: pointRemoved ? 'traite' : 'rejete',
                      })
                    }
                    className="text-slate-600 disabled:opacity-50"
                  >
                    {pointRemoved ? 'Marquer comme traité' : 'Classer sans suite'}
                  </button>

                  {report.point && !pointRemoved && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() =>
                        removeMutation.mutate({
                          reportId: report.id,
                          pointId: report.point_id,
                        })
                      }
                      className="ml-auto text-red-600 disabled:opacity-50"
                    >
                      Retirer le point
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
