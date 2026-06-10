import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  confirmPoint,
  deactivateStalePoints,
  getPoints,
  rejectPoint,
} from '@/features/points/api/points'

function formatLabel(value: string | null) {
  if (!value) return 'Non renseigné'

  const labels: Record<string, string> = {
    signale: 'Signalé',
    a_confirmer: 'À confirmer',
    confirme: 'Confirmé',
    rejete: 'Rejeté',
    actif: 'Actif',
    inactif: 'Inactif',
    archive: 'Archivé',
    non_verifie: 'Non vérifié',
    verifie_terrain: 'Vérifié terrain',
    basse: 'Basse',
    moyenne: 'Moyenne',
    haute: 'Haute',
    critique: 'Critique',
  }

  return labels[value] || value
}

export default function ModerationPage() {
  const queryClient = useQueryClient()

  const {
    data: points = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['points'],
    queryFn: getPoints,
  })

  const confirmMutation = useMutation({
    mutationFn: confirmPoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: rejectPoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points'] })
    },
  })

  const deactivateStaleMutation = useMutation({
    mutationFn: deactivateStalePoints,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points'] })
    },
  })

  const pointsAModerer = points.filter(
    (point) =>
      point.actif !== false &&
      (point.statut === 'signale' ||
        point.niveau_fiabilite === 'non_verifie')
  )

  const isUpdating =
    confirmMutation.isPending ||
    rejectMutation.isPending ||
    deactivateStaleMutation.isPending

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Modération des points
          </h1>
          <p className="mt-2 text-slate-600">
            Confirme ou rejette les points signalés avant leur validation
            terrain.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => deactivateStaleMutation.mutate()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Inactiver les points de +30 jours
          </button>

          <Link
            to="/moderation/doublons"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Voir les doublons
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl bg-white p-6 text-slate-600">
          Chargement des points à modérer...
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {(error as Error).message ||
            'Erreur lors du chargement des points à modérer.'}
        </div>
      )}

      {(confirmMutation.isError || rejectMutation.isError) && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(confirmMutation.error as Error)?.message ||
            (rejectMutation.error as Error)?.message ||
            'Erreur lors de la mise à jour du point.'}
        </div>
      )}

      {deactivateStaleMutation.isError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(deactivateStaleMutation.error as Error)?.message ||
            'Erreur lors de l’inactivation des points anciens.'}
        </div>
      )}

      {deactivateStaleMutation.isSuccess && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {deactivateStaleMutation.data.length} point(s) ancien(s) passé(s) en
          inactif.
        </div>
      )}

      {!isLoading && !isError && pointsAModerer.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-slate-500">
          Aucun point en attente de modération.
        </div>
      )}

      {!isLoading && !isError && pointsAModerer.length > 0 && (
        <div className="grid gap-4">
          {pointsAModerer.map((point) => (
            <article
              key={point.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    {point.adresse || 'Adresse non renseignée'}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {point.latitude}, {point.longitude}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    {formatLabel(point.statut)}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {formatLabel(point.niveau_fiabilite)}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">
                    Personnes estimées
                  </p>
                  <p className="mt-1 font-semibold">
                    {point.nombre_personnes_estime ?? 'Non renseigné'}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">Urgence</p>
                  <p className="mt-1 font-semibold">
                    {formatLabel(point.niveau_urgence)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">Besoins</p>
                  <p className="mt-1 font-semibold">
                    {point.besoins || 'Non renseigné'}
                  </p>
                </div>
              </div>

              {point.commentaire && point.commentaire.trim().length > 0 && (
                <p className="mt-4 text-sm text-slate-700">
                  <span className="font-medium">Commentaire :</span>{' '}
                  {point.commentaire}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => confirmMutation.mutate(point.id)}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                >
                  Confirmer
                </button>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => rejectMutation.mutate(point.id)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                >
                  Rejeter
                </button>

                <Link
                  to={`/points/${point.id}`}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Voir détail
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}