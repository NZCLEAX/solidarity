import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  confirmPoint,
  deactivateStalePoints,
  getPoints,
  rejectPoint,
} from '@/features/points/api/points'
import {
  formatPointLabel,
  getStatusBadgeClass,
  getUrgencyBadgeClass,
} from '@/shared/utils/pointStyles'

function normalizeText(value: string | null | undefined) {
  return value?.toLowerCase().trim() || ''
}

function splitBesoins(value: string | null) {
  if (!value) return []

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getReliabilityBadgeClass(value: string | null | undefined) {
  switch (value) {
    case 'verifie_terrain':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    case 'non_verifie':
      return 'bg-amber-50 text-amber-700 ring-amber-200'
    default:
      return 'bg-slate-50 text-slate-700 ring-slate-200'
  }
}

export default function ModerationPage() {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('all')

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

  const deactivateMutation = useMutation({
    mutationFn: deactivateStalePoints,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points'] })
    },
  })

  const pointsAModerer = useMemo(() => {
    const search = normalizeText(searchTerm)

    return points
      .filter(
        (point) =>
          point.actif !== false &&
          (point.statut === 'signale' ||
            point.niveau_fiabilite === 'non_verifie')
      )
      .filter((point) => {
        const content = [
          point.adresse,
          point.besoins,
          point.commentaire,
          point.typologie,
          point.niveau_urgence,
          point.statut,
          point.niveau_fiabilite,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        const matchesSearch = search.length === 0 || content.includes(search)

        const matchesUrgency =
          urgencyFilter === 'all' || point.niveau_urgence === urgencyFilter

        return matchesSearch && matchesUrgency
      })
  }, [points, searchTerm, urgencyFilter])

  const urgentCount = pointsAModerer.filter(
    (point) =>
      point.niveau_urgence === 'haute' || point.niveau_urgence === 'critique'
  ).length

  const criticalCount = pointsAModerer.filter(
    (point) => point.niveau_urgence === 'critique'
  ).length

  const estimatedPeopleCount = pointsAModerer.reduce(
    (total, point) => total + (point.nombre_personnes_estime ?? 0),
    0
  )

  const nonVerifiedCount = pointsAModerer.filter(
    (point) => point.niveau_fiabilite === 'non_verifie'
  ).length

  const isUpdating =
    confirmMutation.isPending ||
    rejectMutation.isPending ||
    deactivateMutation.isPending

  function resetFilters() {
    setSearchTerm('')
    setUrgencyFilter('all')
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
              Validation terrain
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl xl:text-5xl">
              Modération des points
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Confirme ou rejette les points signalés avant leur validation sur
              le terrain.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => deactivateMutation.mutate()}
              disabled={isUpdating}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-black text-orange-700 shadow-sm transition hover:bg-orange-100 disabled:opacity-60"
            >
              Inactiver les points de +30 jours
            </button>

            <Link
              to="/moderation/doublons"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Voir les doublons
            </Link>
          </div>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              À modérer
            </p>
            <p className="mt-3 text-4xl font-black text-slate-950">
              {pointsAModerer.length}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Point(s) en attente
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-red-500">
              Urgents
            </p>
            <p className="mt-3 text-4xl font-black text-red-700">
              {urgentCount}
            </p>
            <p className="mt-2 text-sm font-medium text-red-600">
              dont {criticalCount} critique(s)
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
              Personnes estimées
            </p>
            <p className="mt-3 text-4xl font-black text-emerald-700">
              {estimatedPeopleCount}
            </p>
            <p className="mt-2 text-sm font-medium text-emerald-600">
              Sur les points visibles
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
              Non vérifiés
            </p>
            <p className="mt-3 text-4xl font-black text-amber-700">
              {nonVerifiedCount}
            </p>
            <p className="mt-2 text-sm font-medium text-amber-600">
              À confirmer
            </p>
          </article>
        </section>

        <section className="mb-6 rounded-[2rem] border border-[#eadfd6] bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 xl:grid-cols-[1fr_260px_auto] xl:items-end">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Rechercher un point
              </label>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Adresse, besoin, commentaire, typologie..."
                className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Urgence
              </label>

              <select
                value={urgencyFilter}
                onChange={(event) => setUrgencyFilter(event.target.value)}
                className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
              >
                <option value="all">Toutes les urgences</option>
                <option value="critique">Critique</option>
                <option value="haute">Haute</option>
                <option value="moyenne">Moyenne</option>
                <option value="basse">Basse</option>
              </select>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Réinitialiser
            </button>
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            {pointsAModerer.length} point(s) affiché(s) à modérer
          </p>
        </section>

        {isLoading && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
            Chargement des points à modérer...
          </div>
        )}

        {isError && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
            {(error as Error)?.message ||
              'Erreur lors du chargement des points à modérer.'}
          </div>
        )}

        {(confirmMutation.isError ||
          rejectMutation.isError ||
          deactivateMutation.isError) && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {(confirmMutation.error as Error)?.message ||
              (rejectMutation.error as Error)?.message ||
              (deactivateMutation.error as Error)?.message ||
              'Erreur lors de la mise à jour du point.'}
          </div>
        )}

        {deactivateMutation.isSuccess && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            Les points anciens ont été vérifiés et mis à jour.
          </div>
        )}

        {!isLoading && !isError && pointsAModerer.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
              
            </div>

            <h2 className="mt-4 text-xl font-black text-slate-950">
              Aucun point en attente
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Tous les signalements visibles sont déjà traités ou ne
              correspondent pas aux filtres.
            </p>
          </div>
        )}

        {!isLoading && !isError && pointsAModerer.length > 0 && (
          <div className="grid gap-5">
            {pointsAModerer.map((point) => {
              const besoins = splitBesoins(point.besoins)

              return (
                <article
                  key={point.id}
                  className="rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
                            {point.adresse || 'Adresse non renseignée'}
                          </h2>

                          <p className="mt-2 text-sm text-slate-500">
                            {point.latitude ?? '—'}, {point.longitude ?? '—'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusBadgeClass(
                              point.statut
                            )}`}
                          >
                            {formatPointLabel(point.statut)}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getReliabilityBadgeClass(
                              point.niveau_fiabilite
                            )}`}
                          >
                            {formatPointLabel(point.niveau_fiabilite)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Personnes estimées
                          </p>
                          <p className="mt-2 text-2xl font-black text-slate-950">
                            {point.nombre_personnes_estime ?? 'Non renseigné'}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-orange-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                            Urgence
                          </p>
                          <p className="mt-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getUrgencyBadgeClass(
                                point.niveau_urgence
                              )}`}
                            >
                              {formatPointLabel(point.niveau_urgence)}
                            </span>
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Besoins
                          </p>

                          {besoins.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {besoins.map((besoin) => (
                                <span
                                  key={besoin}
                                  className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
                                >
                                  {besoin}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 font-black text-slate-950">
                              Non renseigné
                            </p>
                          )}
                        </div>
                      </div>

                      {point.commentaire &&
                        point.commentaire.trim().length > 0 && (
                          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                            <p className="mb-2 text-sm font-bold text-slate-700">
                              Commentaire
                            </p>
                            <p className="text-sm leading-relaxed text-slate-600">
                              {point.commentaire}
                            </p>
                          </div>
                        )}
                    </div>

                    <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[180px]">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => confirmMutation.mutate(point.id)}
                        className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Confirmer
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => rejectMutation.mutate(point.id)}
                        className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60"
                      >
                        Rejeter
                      </button>

                      <Link
                        to={`/points/${point.id}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        Voir détail
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}