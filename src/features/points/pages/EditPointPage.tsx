import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  getPointById,
  updatePoint,
  type UpdatePointInput,
} from '@/features/points/api/points'
import {
  searchAddresses,
  type AddressSuggestion,
} from '@/features/points/api/addressSearch'
import {
  formatPointLabel,
  getStatusBadgeClass,
  getUrgencyBadgeClass,
} from '@/shared/utils/pointStyles'

const needsOptions = [
  { label: 'Repas', value: 'Repas', icon: '🍽️' },
  { label: 'Eau', value: 'Eau', icon: '💧' },
  { label: 'Hygiène', value: 'Hygiène', icon: '🧼' },
  { label: 'Vêtements', value: 'Vêtements', icon: '👕' },
  { label: 'Couvertures', value: 'Couvertures', icon: '🛏️' },
  { label: 'Soins', value: 'Soins', icon: '🏥' },
  { label: 'Autre', value: 'Autre', icon: '📦' },
]

const urgencyOptions = [
  {
    label: 'Basse',
    value: 'basse',
    icon: '🟢',
    description: 'Situation stable',
  },
  {
    label: 'Moyenne',
    value: 'moyenne',
    icon: '🟡',
    description: 'Besoin à suivre',
  },
  {
    label: 'Haute',
    value: 'haute',
    icon: '🟠',
    description: 'Intervention recommandée',
  },
  {
    label: 'Critique',
    value: 'critique',
    icon: '🔴',
    description: 'Priorité immédiate',
  },
] as const

const statusOptions: Array<{
  label: string
  value: UpdatePointInput['statut']
}> = [
  { label: 'Signalé', value: 'signale' },
  { label: 'À confirmer', value: 'a_confirmer' },
  { label: 'Confirmé', value: 'confirme' },
  { label: 'Actif', value: 'actif' },
  { label: 'Inactif', value: 'inactif' },
  { label: 'Archivé', value: 'archive' },
  { label: 'Rejeté', value: 'rejete' },
]

type UrgencyValue = (typeof urgencyOptions)[number]['value']

function splitBesoins(value: string | null) {
  if (!value) return []

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function EditPointPage() {
  const { pointId } = useParams()
  const navigate = useNavigate()

  const [adresse, setAdresse] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [nombrePersonnesEstime, setNombrePersonnesEstime] = useState('')
  const [niveauUrgence, setNiveauUrgence] = useState<UrgencyValue>('moyenne')
  const [statut, setStatut] = useState<UpdatePointInput['statut']>('signale')
  const [besoins, setBesoins] = useState<string[]>([])
  const [typologie, setTypologie] = useState('')
  const [commentaire, setCommentaire] = useState('')

  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([])
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [formError, setFormError] = useState('')
  const [positionError, setPositionError] = useState('')

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

  const updateMutation = useMutation({
    mutationFn: (input: UpdatePointInput) =>
      updatePoint(pointId as string, input),
    onSuccess: () => {
      navigate(`/points/${pointId}`)
    },
  })

  const hasCoordinates = latitude.trim() !== '' && longitude.trim() !== ''

  const selectedUrgency = useMemo(() => {
    return urgencyOptions.find((option) => option.value === niveauUrgence)
  }, [niveauUrgence])

  useEffect(() => {
    if (!point) return

    setAdresse(point.adresse || '')
    setLatitude(point.latitude !== null ? String(point.latitude) : '')
    setLongitude(point.longitude !== null ? String(point.longitude) : '')
    setNombrePersonnesEstime(
      point.nombre_personnes_estime !== null
        ? String(point.nombre_personnes_estime)
        : ''
    )
    setNiveauUrgence((point.niveau_urgence as UrgencyValue) || 'moyenne')
    setStatut((point.statut as UpdatePointInput['statut']) || 'signale')
    setBesoins(splitBesoins(point.besoins))
    setTypologie(point.typologie || '')
    setCommentaire(point.commentaire || '')
  }, [point])

  useEffect(() => {
    const cleanAddress = adresse.trim()

    if (cleanAddress.length < 3 || !showAddressSuggestions) {
      setAddressSuggestions([])
      return
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSearchingAddress(true)
      setFormError('')

      try {
        const results = await searchAddresses(cleanAddress)
        setAddressSuggestions(results)
      } catch {
        setAddressSuggestions([])
        setFormError('Impossible de rechercher les adresses pour le moment.')
      } finally {
        setIsSearchingAddress(false)
      }
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [adresse, showAddressSuggestions])

  function handleAddressChange(value: string) {
    setAdresse(value)
    setFormError('')
    setShowAddressSuggestions(true)
  }

  function selectAddressSuggestion(suggestion: AddressSuggestion) {
    setAdresse(suggestion.label)
    setLatitude(String(suggestion.latitude))
    setLongitude(String(suggestion.longitude))
    setAddressSuggestions([])
    setShowAddressSuggestions(false)
    setFormError('')
  }

  function toggleBesoin(value: string) {
    setBesoins((currentBesoins) =>
      currentBesoins.includes(value)
        ? currentBesoins.filter((besoin) => besoin !== value)
        : [...currentBesoins, value]
    )
  }

  function useCurrentPosition() {
    setPositionError('')
    setFormError('')

    if (!navigator.geolocation) {
      setPositionError(
        'La géolocalisation n’est pas disponible sur ce navigateur.'
      )
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLatitude = position.coords.latitude.toFixed(6)
        const nextLongitude = position.coords.longitude.toFixed(6)

        setLatitude(nextLatitude)
        setLongitude(nextLongitude)

        if (!adresse.trim()) {
          setAdresse('Position actuelle')
        }

        setAddressSuggestions([])
        setShowAddressSuggestions(false)
      },
      () => {
        setPositionError(
          'Impossible de récupérer ta position. Vérifie les autorisations du navigateur.'
        )
      }
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setPositionError('')

    if (!adresse.trim()) {
      setFormError("L’adresse est obligatoire.")
      return
    }

    if (!latitude.trim() || Number.isNaN(Number(latitude))) {
      setFormError(
        'La latitude est invalide. Sélectionne une adresse proposée ou utilise ta position.'
      )
      return
    }

    if (!longitude.trim() || Number.isNaN(Number(longitude))) {
      setFormError(
        'La longitude est invalide. Sélectionne une adresse proposée ou utilise ta position.'
      )
      return
    }

    if (
      !nombrePersonnesEstime.trim() ||
      Number.isNaN(Number(nombrePersonnesEstime)) ||
      Number(nombrePersonnesEstime) < 0
    ) {
      setFormError('Le nombre de personnes estimé est invalide.')
      return
    }

    if (besoins.length === 0) {
      setFormError('Sélectionne au moins un besoin observé.')
      return
    }

    updateMutation.mutate({
      adresse: adresse.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      nombrePersonnesEstime: Number(nombrePersonnesEstime),
      typologie: typologie.trim(),
      besoins,
      niveauUrgence,
      statut,
      commentaire: commentaire.trim(),
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[1500px]">
          <div className="rounded-[2rem] border border-[#eadfd6] bg-white p-8 text-slate-600 shadow-sm">
            Chargement du point...
          </div>
        </div>
      </div>
    )
  }

  if (isError || !point) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[1500px]">
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
            {(error as Error)?.message ||
              'Erreur lors du chargement du point.'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-[1500px]">
        <Link
          to={`/points/${point.id}`}
          className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 hover:text-[#d94a0b]"
        >
          <span>←</span>
          <span>Retour au point</span>
        </Link>

        <div className="mt-5 grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
          <section>
            <div className="mb-7">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
                Mise à jour
              </p>

              <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
                Modifier un point
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Mets à jour les informations du point sélectionné.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm sm:p-7 lg:p-8"
            >
              {updateMutation.isError && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {(updateMutation.error as Error)?.message ||
                    'Erreur lors de la mise à jour du point.'}
                </div>
              )}

              {formError && (
                <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-medium text-orange-700">
                  {formError}
                </div>
              )}

              {positionError && (
                <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-medium text-orange-700">
                  {positionError}
                </div>
              )}

              <div className="grid gap-6">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    Adresse ou lieu *
                  </label>

                  <div className="relative">
                    <div className="flex gap-3">
                      <input
                        value={adresse}
                        onChange={(event) =>
                          handleAddressChange(event.target.value)
                        }
                        onFocus={() => setShowAddressSuggestions(true)}
                        required
                        placeholder="Ex : Gare du Nord, Paris 10e"
                        className="min-h-14 flex-1 rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                      />

                      <button
                        type="button"
                        onClick={() => setShowAddressSuggestions(true)}
                        className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-300 bg-white text-sm font-black text-slate-600 transition hover:bg-orange-50 hover:text-[#d94a0b] sm:flex"
                        title="Rechercher une adresse"
                      >
                        🔎
                      </button>
                    </div>

                    {showAddressSuggestions && adresse.trim().length >= 3 && (
                      <div className="absolute left-0 right-0 top-16 z-50 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                        {isSearchingAddress && (
                          <div className="px-4 py-3 text-sm text-slate-500">
                            Recherche des adresses...
                          </div>
                        )}

                        {!isSearchingAddress &&
                          addressSuggestions.length === 0 && (
                            <div className="px-4 py-3 text-sm text-slate-500">
                              Aucune adresse trouvée.
                            </div>
                          )}

                        {!isSearchingAddress &&
                          addressSuggestions.map((suggestion) => (
                            <button
                              key={`${suggestion.label}-${suggestion.latitude}-${suggestion.longitude}`}
                              type="button"
                              onClick={() =>
                                selectAddressSuggestion(suggestion)
                              }
                              className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-orange-50"
                            >
                              <span>
                                <span className="block text-sm font-bold text-slate-900">
                                  {suggestion.label}
                                </span>

                                {(suggestion.postcode || suggestion.city) && (
                                  <span className="mt-1 block text-xs font-medium text-slate-500">
                                    {suggestion.postcode} {suggestion.city}
                                  </span>
                                )}
                              </span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={useCurrentPosition}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Ma position
                    </button>

                    <Link
                      to="/carte"
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Carte
                    </Link>
                  </div>

                  {hasCoordinates && (
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                      Coordonnées récupérées.
                      <br />
                      <span className="font-semibold">
                        Latitude : {latitude}
                      </span>{' '}
                      ·{' '}
                      <span className="font-semibold">
                        Longitude : {longitude}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    Nombre de personnes estimé *
                  </label>

                  <input
                    value={nombrePersonnesEstime}
                    onChange={(event) =>
                      setNombrePersonnesEstime(event.target.value)
                    }
                    required
                    type="number"
                    min="0"
                    placeholder="Ex : 20"
                    className="min-h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-bold text-slate-800">
                    Niveau d’urgence *
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {urgencyOptions.map((option) => {
                      const isSelected = niveauUrgence === option.value

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setNiveauUrgence(option.value)}
                          className={[
                            'rounded-2xl border p-4 text-left transition',
                            isSelected
                              ? 'border-[#d94a0b] bg-orange-50 ring-4 ring-orange-100'
                              : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/50',
                          ].join(' ')}
                        >
                          <div className="flex items-center gap-2 text-base font-black text-slate-950">
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {option.description}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    Statut *
                  </label>

                  <select
                    value={statut}
                    onChange={(event) =>
                      setStatut(event.target.value as UpdatePointInput['statut'])
                    }
                    className="min-h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-800 outline-none transition focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-bold text-slate-800">
                    Besoins observés *
                  </label>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
                    {needsOptions.map((option) => {
                      const isSelected = besoins.includes(option.value)

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleBesoin(option.value)}
                          className={[
                            'min-h-24 rounded-2xl border p-3 text-center transition',
                            isSelected
                              ? 'border-emerald-300 bg-emerald-50 ring-4 ring-emerald-100'
                              : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/50',
                          ].join(' ')}
                        >
                          <div className="text-2xl">{option.icon}</div>

                          <div className="mt-2 text-sm font-bold text-slate-800">
                            {option.label}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    Typologie
                  </label>

                  <input
                    value={typologie}
                    onChange={(event) => setTypologie(event.target.value)}
                    placeholder="Ex : familles, hommes seuls, migrants..."
                    className="min-h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    Commentaire
                  </label>

                  <textarea
                    value={commentaire}
                    onChange={(event) => setCommentaire(event.target.value)}
                    rows={5}
                    placeholder="Observations complémentaires..."
                    className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    to={`/points/${point.id}`}
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Annuler
                  </Link>

                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#2f8b6b] px-7 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#28785d] disabled:opacity-60 sm:min-w-56"
                  >
                    {updateMutation.isPending
                      ? 'Mise à jour en cours...'
                      : 'Mettre à jour'}
                  </button>
                </div>
              </div>
            </form>
          </section>

          <aside className="hidden xl:block">
            <div className="sticky top-28 space-y-5">
              <div className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
                  Aperçu
                </p>

                <h2 className="mt-3 text-2xl font-black text-slate-950">
                  {adresse || 'Adresse du point'}
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusBadgeClass(
                      statut
                    )}`}
                  >
                    {formatPointLabel(statut)}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${getUrgencyBadgeClass(
                      niveauUrgence
                    )}`}
                  >
                    {selectedUrgency?.icon} {selectedUrgency?.label}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">
                      Personnes
                    </p>
                    <p className="mt-2 text-3xl font-black text-slate-950">
                      {nombrePersonnesEstime || '0'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-orange-50 p-4">
                    <p className="text-xs font-bold uppercase text-orange-600">
                      Urgence
                    </p>
                    <p className="mt-2 text-lg font-black text-orange-700">
                      {selectedUrgency?.icon} {selectedUrgency?.label}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-bold text-slate-800">
                    Coordonnées
                  </p>

                  {hasCoordinates ? (
                    <p className="mt-2 text-sm leading-relaxed text-emerald-700">
                      Latitude : <span className="font-bold">{latitude}</span>
                      <br />
                      Longitude :{' '}
                      <span className="font-bold">{longitude}</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      Sélectionne une adresse proposée ou utilise ta position.
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  <p className="text-sm font-bold text-slate-800">
                    Besoins sélectionnés
                  </p>

                  {besoins.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">
                      Aucun besoin sélectionné pour le moment.
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {besoins.map((besoin) => (
                        <span
                          key={besoin}
                          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200"
                        >
                          {besoin}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {commentaire.trim().length > 0 && (
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-800">
                      Commentaire
                    </p>
                    <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-600">
                      {commentaire}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}