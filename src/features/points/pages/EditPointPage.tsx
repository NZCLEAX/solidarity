import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
import {
  ArrowLeft,
  BedDouble,
  Check,
  Droplets,
  HeartPulse,
  LocateFixed,
  Map as MapIcon,
  MoreHorizontal,
  Search,
  Shirt,
  Sparkles,
  Utensils,
} from 'lucide-react'
import {
  getPointById,
  updatePoint,
  type UpdatePointInput,
} from '@/features/points/api/points'
import {
  searchAddresses,
  type AddressSuggestion,
} from '@/features/points/api/addressSearch'
import { formatPointLabel } from '@/shared/utils/pointStyles'
import FormSection, {
  chipClass,
  formFieldClass,
  formFooterClass,
  formLabelClass,
} from '@/shared/components/FormSection'

const needsOptions = [
  { label: 'Repas', value: 'Repas', icon: Utensils },
  { label: 'Eau', value: 'Eau', icon: Droplets },
  { label: 'Hygiène', value: 'Hygiène', icon: Sparkles },
  { label: 'Vêtements', value: 'Vêtements', icon: Shirt },
  { label: 'Couvertures', value: 'Couvertures', icon: BedDouble },
  { label: 'Soins', value: 'Soins', icon: HeartPulse },
  { label: 'Autre', value: 'Autre', icon: MoreHorizontal },
]

const urgencyOptions = [
  {
    label: 'Basse',
    value: 'basse',
    dot: 'bg-emerald-500',
    description: 'Situation stable',
  },
  {
    label: 'Moyenne',
    value: 'moyenne',
    dot: 'bg-amber-400',
    description: 'Besoin à suivre',
  },
  {
    label: 'Haute',
    value: 'haute',
    dot: 'bg-orange-500',
    description: 'Intervention recommandée',
  },
  {
    label: 'Critique',
    value: 'critique',
    dot: 'bg-red-500',
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
  const [isLocating, setIsLocating] = useState(false)

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

  async function useCurrentPosition() {
    setPositionError('')
    setFormError('')
    setIsLocating(true)

    try {
      // Sur iPhone / Android, on demande l'autorisation explicitement.
      if (Capacitor.isNativePlatform()) {
        const permission = await Geolocation.requestPermissions()

        if (permission.location !== 'granted') {
          setPositionError(
            'Autorise la localisation pour PULSE dans les réglages du téléphone.'
          )
          return
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      })

      setLatitude(position.coords.latitude.toFixed(6))
      setLongitude(position.coords.longitude.toFixed(6))

      if (!adresse.trim()) {
        setAdresse('Position actuelle')
      }

      setAddressSuggestions([])
      setShowAddressSuggestions(false)
    } catch {
      setPositionError(
        'Impossible de récupérer ta position. Vérifie les autorisations du navigateur.'
      )
    } finally {
      setIsLocating(false)
    }
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
      <div className="mx-auto w-full max-w-xl px-4 py-8 text-sm text-slate-500">
        Chargement du point...
      </div>
    )
  }

  if (isError || !point) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(error as Error)?.message ||
            'Erreur lors du chargement du point.'}
        </div>
      </div>
    )
  }

  const formErrorMessage = updateMutation.isError
    ? (updateMutation.error as Error)?.message ||
      'Erreur lors de la mise à jour du point.'
    : formError || positionError

  const summary = [
    `${nombrePersonnesEstime || '0'} personnes`,
    `urgence ${selectedUrgency?.label.toLowerCase() ?? ''}`,
    `statut ${formatPointLabel(statut).toLowerCase()}`,
    besoins.length > 0
      ? besoins.join(', ').toLowerCase()
      : 'aucun besoin',
  ].join(' · ')

  return (
    <div className="min-w-0 px-4 pt-4">
      <div className="mx-auto w-full max-w-xl">
        <Link
          to={`/points/${point.id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Retour au point
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-950">
          Modifier un point
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Mets à jour les informations du point sélectionné.
        </p>

        <form onSubmit={handleSubmit} className="mt-5">
          {/* 1. LIEU */}

          <FormSection number={1} title="Adresse ou lieu">
            <div className="relative">
              <div className="flex gap-2">
                <input
                  value={adresse}
                  onChange={(event) =>
                    handleAddressChange(event.target.value)
                  }
                  onFocus={() => setShowAddressSuggestions(true)}
                  required
                  aria-label="Adresse ou lieu"
                  placeholder="Ex : Gare du Nord, Paris 10e"
                  className={formFieldClass}
                />

                <button
                  type="button"
                  onClick={() => setShowAddressSuggestions(true)}
                  title="Rechercher une adresse"
                  aria-label="Rechercher une adresse"
                  className="flex min-h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-600"
                >
                  <Search size={18} />
                </button>
              </div>

              {showAddressSuggestions && adresse.trim().length >= 3 && (
                <div className="absolute left-0 right-0 top-12 z-50 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                  {isSearchingAddress && (
                    <p className="px-3 py-2 text-sm text-slate-500">
                      Recherche des adresses...
                    </p>
                  )}

                  {!isSearchingAddress &&
                    addressSuggestions.length === 0 && (
                      <p className="px-3 py-2 text-sm text-slate-500">
                        Aucune adresse trouvée.
                      </p>
                    )}

                  {!isSearchingAddress &&
                    addressSuggestions.map((suggestion) => (
                      <button
                        key={`${suggestion.label}-${suggestion.latitude}-${suggestion.longitude}`}
                        type="button"
                        onClick={() => selectAddressSuggestion(suggestion)}
                        className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-slate-50"
                      >
                        <span className="block font-medium text-slate-900">
                          {suggestion.label}
                        </span>

                        {(suggestion.postcode || suggestion.city) && (
                          <span className="block text-xs text-slate-500">
                            {suggestion.postcode} {suggestion.city}
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium">
              <button
                type="button"
                onClick={() => void useCurrentPosition()}
                disabled={isLocating}
                className="inline-flex items-center gap-1 text-[#d94a0b] disabled:opacity-60"
              >
                <LocateFixed size={15} />
                {isLocating ? 'Localisation...' : 'Ma position'}
              </button>

              <Link
                to="/carte"
                className="inline-flex items-center gap-1 text-slate-600"
              >
                <MapIcon size={15} />
                Carte
              </Link>
            </div>

            {hasCoordinates && (
              <p className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
                <Check size={15} />
                Coordonnées récupérées ·{' '}
                {Number(latitude).toFixed(6)},{' '}
                {Number(longitude).toFixed(6)}
              </p>
            )}
          </FormSection>

          {/* 2. SITUATION */}

          <FormSection number={2} title="Situation">
            <label className={formLabelClass}>
              Nombre de personnes estimé
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
              className={formFieldClass}
            />

            <label className={`${formLabelClass} mt-4`}>
              Niveau d’urgence
            </label>

            <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-300 p-1 sm:grid-cols-4">
              {urgencyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={niveauUrgence === option.value}
                  onClick={() => setNiveauUrgence(option.value)}
                  className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition ${
                    niveauUrgence === option.value
                      ? 'bg-slate-100 text-slate-950'
                      : 'text-slate-600'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${option.dot}`} />
                  {option.label}
                </button>
              ))}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {selectedUrgency?.description}
            </p>

            <label className={`${formLabelClass} mt-4`}>Statut</label>

            <select
              value={statut}
              onChange={(event) =>
                setStatut(event.target.value as UpdatePointInput['statut'])
              }
              className={formFieldClass}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormSection>

          {/* 3. BESOINS OBSERVÉS */}

          <FormSection number={3} title="Besoins observés">
            <div className="flex flex-wrap gap-2">
              {needsOptions.map((option) => {
                const selected = besoins.includes(option.value)
                const Icon = option.icon

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleBesoin(option.value)}
                    className={chipClass(selected)}
                  >
                    {selected ? <Check size={15} /> : <Icon size={15} />}
                    {option.label}
                  </button>
                )
              })}
            </div>
          </FormSection>

          {/* 4. DÉTAILS */}

          <FormSection number={4} title="Détails">
            <label className={formLabelClass}>Typologie</label>

            <input
              value={typologie}
              onChange={(event) => setTypologie(event.target.value)}
              placeholder="Ex : familles, hommes seuls, migrants..."
              className={formFieldClass}
            />

            <label className={`${formLabelClass} mt-4`}>Commentaire</label>

            <textarea
              value={commentaire}
              onChange={(event) => setCommentaire(event.target.value)}
              rows={3}
              placeholder="Observations complémentaires..."
              className={`${formFieldClass} py-2`}
            />
          </FormSection>

          {/* RÉCAPITULATIF + ENREGISTREMENT */}

          <div className={formFooterClass}>
            {formErrorMessage && (
              <p
                role="alert"
                className="mb-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {formErrorMessage}
              </p>
            )}

            <p className="text-sm text-slate-600">{summary}</p>

            <div className="mt-2 flex items-center gap-4">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="min-h-11 flex-1 rounded-lg bg-[#d94a0b] px-4 text-sm font-semibold text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateMutation.isPending
                  ? 'Mise à jour en cours...'
                  : 'Enregistrer les modifications'}
              </button>

              <Link
                to={`/points/${point.id}`}
                className="text-sm font-medium text-slate-600"
              >
                Annuler
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
