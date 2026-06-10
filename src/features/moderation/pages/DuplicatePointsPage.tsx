import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPoints } from '@/features/points/api/points'
import { detectDuplicatePoints } from '@/features/moderation/utils/detectDuplicatePoints'

function formatLabel(value: string | null) {
  if (!value) return 'Non renseigné'

  const labels: Record<string, string> = {
    signale: 'Signalé',
    a_confirmer: 'À confirmer',
    confirme: 'Confirmé',
    actif: 'Actif',
    inactif: 'Inactif',
    archive: 'Archivé',
    rejete: 'Rejeté',
    non_verifie: 'Non vérifié',
    verifie_terrain: 'Vérifié terrain',
    basse: 'Basse',
    moyenne: 'Moyenne',
    haute: 'Haute',
    critique: 'Critique',
  }

  return labels[value] || value
}

export default function DuplicatePointsPage() {
  const {
    data: points = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['points'],
    queryFn: getPoints,
  })

  const duplicateGroups = detectDuplicatePoints(points)

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Points potentiellement doublons
          </h1>
          <p className="mt-2 text-slate-600">
            Détection des points actifs ayant une adresse similaire ou des
            coordonnées proches.
          </p>
        </div>

        <Link
          to="/moderation"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Retour modération
        </Link>
      </div>

      {isLoading && (
        <div className="rounded-xl bg-white p-6 text-slate-600">
          Analyse des points en cours...
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {(error as Error).message ||
            'Erreur lors du chargement des points.'}
        </div>
      )}

      {!isLoading && !isError && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Résultat de l’analyse
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {duplicateGroups.length} doublon(s) potentiel(s) détecté(s) sur{' '}
            {points.length} point(s).
          </p>
        </section>
      )}

      {!isLoading && !isError && duplicateGroups.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-slate-500">
          Aucun doublon potentiel détecté pour le moment.
        </div>
      )}

      {!isLoading && !isError && duplicateGroups.length > 0 && (
        <div className="grid gap-5">
          {duplicateGroups.map((group) => (
            <article
              key={group.id}
              className="rounded-xl border border-orange-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    Doublon potentiel détecté
                  </h2>

                  <p className="mt-1 text-sm text-slate-600">
                    Raison :{' '}
                    <span className="font-medium text-orange-700">
                      {group.reason}
                    </span>
                    {group.distanceMeters !== undefined && (
                      <>
                        {' '}
                        — distance estimée :{' '}
                        <span className="font-medium">
                          {group.distanceMeters} m
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {group.points.map((point) => (
                  <div
                    key={point.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {point.adresse || 'Adresse non renseignée'}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {point.latitude}, {point.longitude}
                        </p>
                      </div>

                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                        {formatLabel(point.statut)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-lg bg-white p-3">
                        <p className="text-xs uppercase text-slate-500">
                          Personnes
                        </p>
                        <p className="mt-1 font-semibold">
                          {point.nombre_personnes_estime ?? 'Non renseigné'}
                        </p>
                      </div>

                      <div className="rounded-lg bg-white p-3">
                        <p className="text-xs uppercase text-slate-500">
                          Urgence
                        </p>
                        <p className="mt-1 font-semibold">
                          {formatLabel(point.niveau_urgence)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-white p-3">
                        <p className="text-xs uppercase text-slate-500">
                          Fiabilité
                        </p>
                        <p className="mt-1 font-semibold">
                          {formatLabel(point.niveau_fiabilite)}
                        </p>
                      </div>
                    </div>

                    {point.besoins && (
                      <p className="mt-3 text-sm text-slate-700">
                        <span className="font-medium">Besoins :</span>{' '}
                        {point.besoins}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        to={`/points/${point.id}`}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Voir détail
                      </Link>

                      <Link
                        to={`/points/${point.id}/edit`}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Modifier
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}