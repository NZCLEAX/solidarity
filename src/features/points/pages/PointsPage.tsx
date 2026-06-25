import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPoints } from '@/features/points/api/points'

export default function PointsPage() {
  const {
    data: points = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['points'],
    queryFn: getPoints,
  })

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Points signalés
          </h1>
          <p className="mt-2 text-slate-600">
            Liste des points de précarité enregistrés dans l’application.
          </p>
        </div>

        <Link
          to="/points/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Nouveau point
        </Link>
      </div>

      {isLoading && (
        <div className="rounded-xl bg-white p-6 text-slate-600">
          Chargement des points...
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {(error as Error).message || 'Erreur lors du chargement des points.'}
        </div>
      )}

      {!isLoading && !isError && points.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-slate-500">
          Aucun point enregistré pour le moment.
        </div>
      )}

      {!isLoading && !isError && points.length > 0 && (
        <div className="grid gap-4">
          {points.map((point) => (
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
                <div className="flex flex-shrink-0 items-center gap-2">
                  <Link
                    to={`/points/${point.id}`}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Voir détail
                  </Link>
                  <Link
                    to={`/points/${point.id}/edit`}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Modifier
                  </Link>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    {point.statut || 'statut inconnu'}
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
                  <p className="text-xs uppercase text-slate-500">
                    Urgence
                  </p>
                  <p className="mt-1 font-semibold">
                    {point.niveau_urgence || 'Non renseignée'}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">
                    Fiabilité
                  </p>
                  <p className="mt-1 font-semibold">
                    {point.niveau_fiabilite || 'Non renseignée'}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-700">
                {point.besoins && (
                  <p>
                    <span className="font-medium">Besoins :</span>{' '}
                    {point.besoins}
                  </p>
                )}

                {point.typologie && (
                  <p>
                    <span className="font-medium">Typologie :</span>{' '}
                    {point.typologie}
                  </p>
                )}

                {point.commentaire && point.commentaire.trim().length > 0 && (
  <p>
    <span className="font-medium">Commentaire :</span>{' '}
    {point.commentaire}
  </p>
)}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}