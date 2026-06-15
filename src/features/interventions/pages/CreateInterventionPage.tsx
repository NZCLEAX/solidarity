import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getPoints } from '@/features/points/api/points'
import { createIntervention } from '@/features/interventions/api/interventions'

const typeAideOptions = [
  { value: 'Distribution de repas', label: 'Repas', icon: '🍽️' },
  { value: "Distribution d'eau", label: 'Eau', icon: '💧' },
  { value: 'Distribution de vêtements', label: 'Vêtements', icon: '👕' },
  { value: 'Maraude', label: 'Maraude', icon: '🚶' },
  { value: 'Soins', label: 'Soins', icon: '🏥' },
  { value: 'Accompagnement social', label: 'Accompagnement', icon: '🤝' },
  { value: 'Autre', label: 'Autre', icon: '📦' },
]

function formatPointLabel(adresse: string | null | undefined) {
  if (!adresse || adresse.trim().length === 0) {
    return 'Adresse non renseignée'
  }

  return adresse
}

function formatDatePreview(date: string) {
  if (!date) return 'Non renseignée'

  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return date

  return parsedDate.toLocaleDateString('fr-FR')
}

export default function CreateInterventionPage() {
  const navigate = useNavigate()

  const [pointId, setPointId] = useState('')
  const [dateIntervention, setDateIntervention] = useState('')
  const [heureDebut, setHeureDebut] = useState('')
  const [heureFin, setHeureFin] = useState('')
  const [typesAide, setTypesAide] = useState<string[]>([
    'Distribution de repas',
  ])
  const [nombreRepas, setNombreRepas] = useState('')
  const [nombreBenevoles, setNombreBenevoles] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [error, setError] = useState<string | null>(null)

  const {
    data: points = [],
    isLoading: pointsLoading,
    isError: pointsError,
    error: pointsErrorDetails,
  } = useQuery({
    queryKey: ['points'],
    queryFn: getPoints,
  })

  const selectedPoint = useMemo(() => {
    return points.find((point) => point.id === pointId) ?? null
  }, [points, pointId])

  const selectedTypesAide = useMemo(() => {
    return typeAideOptions.filter((option) => typesAide.includes(option.value))
  }, [typesAide])

  const createMutation = useMutation({
    mutationFn: createIntervention,
    onSuccess: () => {
      navigate('/interventions')
    },
  })

  const isSubmitting = createMutation.isPending

  function toggleTypeAide(value: string) {
    setTypesAide((currentTypes) =>
      currentTypes.includes(value)
        ? currentTypes.filter((type) => type !== value)
        : [...currentTypes, value]
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!pointId) {
      setError('Veuillez sélectionner un point concerné.')
      return
    }

    if (!dateIntervention) {
      setError("Veuillez renseigner la date de l'intervention.")
      return
    }

    if (!heureDebut) {
      setError("Veuillez renseigner l'heure de début.")
      return
    }

    if (!heureFin) {
      setError("Veuillez renseigner l'heure de fin.")
      return
    }

    if (heureFin <= heureDebut) {
      setError("L'heure de fin doit être après l'heure de début.")
      return
    }

    if (typesAide.length === 0) {
      setError("Veuillez sélectionner au moins un type d'aide.")
      return
    }

    if (!nombreRepas || Number(nombreRepas) < 0) {
      setError('Veuillez renseigner un nombre de repas valide.')
      return
    }

    if (!nombreBenevoles || Number(nombreBenevoles) <= 0) {
      setError('Veuillez renseigner un nombre de bénévoles valide.')
      return
    }

    try {
      await createMutation.mutateAsync({
        pointId,
        dateIntervention,
        heureDebut,
        heureFin,
        typeAide: typesAide.join(', '),
        nombreRepas: Number(nombreRepas),
        nombreBenevoles: Number(nombreBenevoles),
        commentaire: commentaire.trim() || undefined,
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la déclaration."
      )
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="mb-5">
          <Link
            to="/interventions"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <span>←</span>
            <span>Retour aux interventions</span>
          </Link>
        </div>

        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#d94a0b]">
            Intervention terrain
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl xl:text-5xl">
            Déclarer une intervention
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Renseigne les informations de l’intervention réalisée sur un point
            afin d’assurer un suivi clair des actions de terrain.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_320px] 2xl:grid-cols-[minmax(0,1.45fr)_340px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
                  Point concerné
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Sélectionne le point sur lequel l’intervention a été réalisée.
                </p>
              </div>

              {pointsLoading && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Chargement des points...
                </div>
              )}

              {pointsError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {(pointsErrorDetails as Error)?.message ||
                    'Impossible de charger les points.'}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Point concerné *
                </label>

                <select
                  value={pointId}
                  onChange={(event) => setPointId(event.target.value)}
                  className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                >
                  <option value="">Sélectionner un point</option>
                  {points.map((point) => (
                    <option key={point.id} value={point.id}>
                      {formatPointLabel(point.adresse)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPoint && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                  <p className="text-sm font-bold text-emerald-800">
                    Point sélectionné
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    {formatPointLabel(selectedPoint.adresse)}
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
                  Informations de l’intervention
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Indique la date, les horaires et les types d’aide apportés.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={dateIntervention}
                    onChange={(event) => setDateIntervention(event.target.value)}
                    className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Heure de début *
                  </label>
                  <input
                    type="time"
                    value={heureDebut}
                    onChange={(event) => setHeureDebut(event.target.value)}
                    className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Heure de fin *
                  </label>
                  <input
                    type="time"
                    value={heureFin}
                    onChange={(event) => setHeureFin(event.target.value)}
                    className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-3 block text-sm font-bold text-slate-700">
                  Type d’aide * — plusieurs choix possibles
                </label>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4">
                  {typeAideOptions.map((option) => {
                    const isActive = typesAide.includes(option.value)

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleTypeAide(option.value)}
                        className={`relative flex min-h-[110px] flex-col items-center justify-center rounded-[1.4rem] border px-3 py-4 text-center transition ${
                          isActive
                            ? 'border-[#d94a0b] bg-orange-50 shadow-sm ring-4 ring-orange-100'
                            : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/40'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#d94a0b] text-xs font-black text-white">
                            ✓
                          </span>
                        )}

                        <span className="text-2xl">{option.icon}</span>
                        <span className="mt-3 text-sm font-bold text-slate-900">
                          {option.label}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {typesAide.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedTypesAide.map((option) => (
                      <span
                        key={option.value}
                        className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 ring-1 ring-orange-200"
                      >
                        {option.icon} {option.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
                  Moyens mobilisés
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Renseigne les quantités mobilisées pendant l’intervention.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Nombre de repas *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={nombreRepas}
                    onChange={(event) => setNombreRepas(event.target.value)}
                    placeholder="Ex : 80"
                    className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Nombre de bénévoles *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={nombreBenevoles}
                    onChange={(event) => setNombreBenevoles(event.target.value)}
                    placeholder="Ex : 6"
                    className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Commentaire
                </label>
                <textarea
                  value={commentaire}
                  onChange={(event) => setCommentaire(event.target.value)}
                  placeholder="Informations complémentaires..."
                  rows={5}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </section>

            {(error || createMutation.isError) && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error ||
                  (createMutation.error as Error)?.message ||
                  'Une erreur est survenue.'}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#544cf0] px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? 'Déclaration en cours...'
                  : "Déclarer l'intervention"}
              </button>

              <button
                type="button"
                onClick={() => navigate('/interventions')}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Annuler
              </button>
            </div>
          </form>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm sm:p-6 xl:sticky xl:top-24">
              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-950">
                  Résumé
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Aperçu de l’intervention avant validation.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Point
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {selectedPoint
                      ? formatPointLabel(selectedPoint.adresse)
                      : 'Non sélectionné'}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Date
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {dateIntervention
                      ? formatDatePreview(dateIntervention)
                      : 'Non renseignée'}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Horaires
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {heureDebut || '--:--'} → {heureFin || '--:--'}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Types d’aide
                  </p>

                  {selectedTypesAide.length === 0 ? (
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      Non renseigné
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedTypesAide.map((option) => (
                        <span
                          key={option.value}
                          className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 ring-1 ring-orange-200"
                        >
                          {option.icon} {option.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                      Repas
                    </p>
                    <p className="mt-2 text-2xl font-black text-emerald-700">
                      {nombreRepas || '0'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                      Bénévoles
                    </p>
                    <p className="mt-2 text-2xl font-black text-indigo-700">
                      {nombreBenevoles || '0'}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <p className="text-sm font-bold text-orange-800">
                    Conseil
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-orange-700">
                    Tu peux sélectionner plusieurs types d’aide si
                    l’intervention comprend plusieurs actions en même temps.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}