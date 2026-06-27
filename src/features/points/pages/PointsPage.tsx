import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPoints } from '@/features/points/api/points'
import {
  formatPointLabel,
  getReliabilityBadgeClass,
  getStatusBadgeClass,
  getUrgencyBadgeClass,
} from '@/shared/utils/pointStyles'

function splitBesoins(value: string | null) {
  if (!value) return []

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function PointsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const {
    data: points = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['points'],
    queryFn: getPoints,
  })

  const filteredPoints = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()

    if (!normalized) return points

    return points.filter((point) => {
      const content = [
        point.adresse,
        point.typologie,
        point.besoins,
        point.statut,
        point.niveau_fiabilite,
        point.niveau_urgence,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return content.includes(normalized)
    })
  }, [points, searchTerm])

  const totalPeople = filteredPoints.reduce(
    (sum, point) => sum + (point.nombre_personnes_estime ?? 0),
    0
  )

  const totalUnverified = filteredPoints.filter(
    (point) => point.niveau_fiabilite === 'non_verifie'
  ).length

  const totalUrgent = filteredPoints.filter(
    (point) =>
      point.niveau_urgence === 'haute' || point.niveau_urgence === 'critique'
  ).length

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
              Gestion terrain
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl xl:text-5xl">
              Points signalés
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Liste des points de précarité enregistrés dans l’application.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/points/new"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700"
            >
              + Nouveau point
            </Link>
          </div>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Points affichés
            </p>
            <p className="mt-3 text-4xl font-black text-slate-950">
              {filteredPoints.length}
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-red-500">
              Points urgents
            </p>
            <p className="mt-3 text-4xl font-black text-red-700">
              {totalUrgent}
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
              Personnes estimées
            </p>
            <p className="mt-3 text-4xl font-black text-emerald-700">
              {totalPeople}
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
              Non vérifiés
            </p>
            <p className="mt-3 text-4xl font-black text-amber-700">
              {totalUnverified}
            </p>
          </article>
        </section>

        <section className="mb-6 rounded-[2rem] border border-[#eadfd6] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="w-full xl:max-w-xl">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Rechercher un point
              </label>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Adresse, typologie, besoins, statut..."
                className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <p className="text-sm font-medium text-slate-500">
              {filteredPoints.length} point(s) affiché(s) sur {points.length}
            </p>
          </div>
        </section>

        {isLoading && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
            Chargement des points...
          </div>
        )}

        {isError && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
            {(error as Error)?.message ||
              'Erreur lors du chargement des points.'}
          </div>
        )}

        {!isLoading && !isError && filteredPoints.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
            Aucun point trouvé.
          </div>
        )}

        {!isLoading && !isError && filteredPoints.length > 0 && (
          <div className="grid gap-5">
            {filteredPoints.map((point) => {
              const besoins = splitBesoins(point.besoins)

              return (
                <article
                  key={point.id}
                  className="rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
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
                            className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getUrgencyBadgeClass(
                              point.niveau_urgence
                            )}`}
                          >
                            {formatPointLabel(point.niveau_urgence)}
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

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Typologie
                          </p>
                          <p className="mt-2 font-black text-slate-950">
                            {point.typologie || 'Non renseignée'}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Actif
                          </p>
                          <p className="mt-2 font-black text-slate-950">
                            {point.actif === false ? 'Non' : 'Oui'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <p className="mb-3 text-sm font-bold text-slate-700">
                          Besoins observés
                        </p>

                        {besoins.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {besoins.map((besoin) => (
                              <span
                                key={besoin}
                                className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 ring-1 ring-orange-200"
                              >
                                {besoin}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            Aucun besoin renseigné.
                          </p>
                        )}
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
                      <Link
                        to={`/points/${point.id}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        Voir détail
                      </Link>

                      <Link
                        to={`/points/${point.id}/edit`}
                        className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                      >
                        Modifier
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