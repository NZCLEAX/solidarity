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

// Liste des contenus signalés par les utilisateurs, en tête de la page
// Modération. Le modérateur peut retirer le point ou classer sans suite.
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
  const actionError =
    (removeMutation.error as Error | null)?.message ||
    (dismissMutation.error as Error | null)?.message ||
    ''

  return (
    <section className="mb-8 rounded-[2rem] border border-red-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
            Signalements des utilisateurs
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Contenus signalés ({reports.length})
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            À traiter rapidement : retire le point s’il enfreint les CGU, ou
            classe le signalement sans suite.
          </p>
        </div>
      </div>

      {isLoading && (
        <p className="mt-5 text-sm text-slate-500">
          Chargement des signalements…
        </p>
      )}

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error instanceof MissingModerationTablesError
            ? error.message
            : (error as Error).message ||
              'Impossible de charger les signalements.'}
        </div>
      )}

      {actionError && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {actionError}
        </div>
      )}

      {!isLoading && !error && reports.length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
          Aucun contenu signalé pour le moment.
        </div>
      )}

      {reports.length > 0 && (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {reports.map((report) => (
            <article
              key={report.id}
              className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700 ring-1 ring-red-200">
                  {report.motif}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {formatDate(report.created_at)}
                </span>
              </div>

              <p className="mt-4 font-black text-slate-950">
                {report.point?.adresse || 'Point supprimé ou introuvable'}
              </p>

              {report.point?.commentaire && (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Commentaire du point : « {report.point.commentaire} »
                </p>
              )}

              {report.details && (
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  <span className="font-black">Précisions :</span>{' '}
                  {report.details}
                </p>
              )}

              {report.point?.actif === false && (
                <p className="mt-2 text-xs font-bold text-slate-500">
                  Ce point est déjà retiré de la carte.
                </p>
              )}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {report.point && (
                  <Link
                    to={`/points/${report.point_id}`}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    Voir le point
                  </Link>
                )}

                {report.point && report.point.actif !== false && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() =>
                      removeMutation.mutate({
                        reportId: report.id,
                        pointId: report.point_id,
                      })
                    }
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl bg-red-600 px-4 py-2 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    Retirer le point
                  </button>
                )}

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() =>
                    dismissMutation.mutate({
                      reportId: report.id,
                      statut:
                        report.point?.actif === false ? 'traite' : 'rejete',
                    })
                  }
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  {report.point?.actif === false
                    ? 'Marquer comme traité'
                    : 'Classer sans suite'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
