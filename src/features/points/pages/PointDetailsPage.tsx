import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPointById } from '@/features/points/api/points'

function formatLabel(value: string | null) {
  if (!value) return 'Non renseigné'

  const labels: Record<string, string> = {
    signale: 'Signalé',
    a_confirmer: 'À confirmer',
    confirme: 'Confirmé',
    actif: 'Actif',
    inactif: 'Inactif',
    archive: 'Archivé',
    non_verifie: 'Non vérifié',
    verifie_terrain: 'Vérifié terrain',
    multi_verifie: 'Multi-vérifié',
    basse: 'Basse',
    moyenne: 'Moyenne',
    haute: 'Haute',
    critique: 'Critique',
  }

  return labels[value] || value
}

export default function PointDetailsPage() {
  const { pointId } = useParams()
  const navigate = useNavigate()

  const {
    data: point,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['point', pointId],
    queryFn: () => getPointById(pointId as string),
    enabled: Boolean(pointId),
  })

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-6 text-slate-600">
        Chargement du point...
      </div>
    )
  }

  if (isError || !point) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {(error as Error)?.message || 'Point introuvable.'}
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <button
        type="button"
        onClick={() => navigate('/points')}
        className="mb-4 text-sm text-slate-600 hover:text-slate-900"
      >
        ← Retour aux points
      </button>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            {point.adresse || 'Point sans adresse'}
          </h1>
          <p className="mt-2 text-slate-600">
            Fiche détaillée du point de précarité.
          </p>
        </div>

        <Link
          to={`/points/${point.id}/edit`}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Modifier
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Statut</p>
          <p className="mt-2 text-lg font-semibold">
            {formatLabel(point.statut)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Urgence</p>
          <p className="mt-2 text-lg font-semibold">
            {formatLabel(point.niveau_urgence)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Fiabilité</p>
          <p className="mt-2 text-lg font-semibold">
            {formatLabel(point.niveau_fiabilite)}
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">
          Informations principales
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Adresse</p>
            <p className="font-medium">{point.adresse || 'Non renseignée'}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Personnes estimées</p>
            <p className="font-medium">
              {point.nombre_personnes_estime ?? 'Non renseigné'}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Latitude</p>
            <p className="font-medium">{point.latitude ?? 'Non renseignée'}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Longitude</p>
            <p className="font-medium">{point.longitude ?? 'Non renseignée'}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Typologie</p>
            <p className="font-medium">{point.typologie || 'Non renseignée'}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Besoins</p>
            <p className="font-medium">{point.besoins || 'Non renseignés'}</p>
          </div>
        </div>
      </section>

      {point.commentaire && point.commentaire.trim().length > 0 && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">
            Commentaire
          </h2>
          <p className="mt-3 text-slate-700">{point.commentaire}</p>
        </section>
      )}

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">
          Suivi
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Date d’observation</p>
            <p className="font-medium">
              {point.date_observation
                ? new Date(point.date_observation).toLocaleString('fr-FR')
                : 'Non renseignée'}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Dernière mise à jour</p>
            <p className="font-medium">
              {point.updated_at
                ? new Date(point.updated_at).toLocaleString('fr-FR')
                : 'Non renseignée'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}