import {
  type FormEvent,
  useEffect,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import {
  useMutation,
  useQuery,
} from '@tanstack/react-query'

import { useTranslation } from 'react-i18next'
import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
import {
  Utensils,
  Droplets,
  Sparkles,
  Shirt,
  BedDouble,
  HeartPulse,
  MoreHorizontal,
  ArrowLeft,
  Check,
  LocateFixed,
  Map as MapIcon,
  Search,
} from 'lucide-react'

import FormSection, {
  chipClass,
  formFieldClass,
  formFooterClass,
  formLabelClass,
} from '@/shared/components/FormSection'

import {
  createPoint,
} from '@/features/points/api/points'

import {
  getCurrentProfile,
} from '@/features/auth/api/profile'

import {
  searchAddresses,
  type AddressSuggestion,
} from '@/features/points/api/addressSearch'

const needsOptions = [
  {
    value: 'Repas',
    icon: Utensils,
  },
  {
    value: 'Eau',
    icon: Droplets,
  },
  {
    value: 'Hygiène',
    icon: Sparkles,
  },
  {
    value: 'Vêtements',
    icon: Shirt,
  },
  {
    value: 'Couvertures',
    icon: BedDouble,
  },
  {
    value: 'Soins',
    icon: HeartPulse,
  },
  {
    value: 'Autre',
    icon: MoreHorizontal,
  },
] as const

const urgencyOptions = [
  {
    value: 'basse',
  },
  {
    value: 'moyenne',
  },
  {
    value: 'haute',
  },
  {
    value: 'critique',
  },
] as const

// Couleur du point devant chaque niveau d'urgence.
const urgencyDotClass: Record<string, string> = {
  basse: 'bg-emerald-500',
  moyenne: 'bg-amber-400',
  haute: 'bg-orange-500',
  critique: 'bg-red-500',
}

type UrgencyValue =
  (typeof urgencyOptions)[number]['value']

export default function CreatePointPage() {
  const {
    t,
    i18n,
  } = useTranslation()

  const {
    data: profile,
  } = useQuery({
    queryKey: [
      'current-profile',
    ],
    queryFn:
      getCurrentProfile,
  })

  const [
    adresse,
    setAdresse,
  ] = useState('')

  const [
    latitude,
    setLatitude,
  ] = useState('')

  const [
    longitude,
    setLongitude,
  ] = useState('')

  const [
    nombrePersonnesEstime,
    setNombrePersonnesEstime,
  ] = useState('')

  const [
    niveauUrgence,
    setNiveauUrgence,
  ] =
    useState<UrgencyValue>(
      'moyenne'
    )

  const [
    besoins,
    setBesoins,
  ] = useState<string[]>(
    []
  )

  const [
    typologie,
    setTypologie,
  ] = useState('')

  const [
    commentaire,
    setCommentaire,
  ] = useState('')

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')

  const [
    addressSuggestions,
    setAddressSuggestions,
  ] =
    useState<
      AddressSuggestion[]
    >([])

  const [
    isSearchingAddress,
    setIsSearchingAddress,
  ] =
    useState(false)

  const [
    showAddressSuggestions,
    setShowAddressSuggestions,
  ] =
    useState(false)

  const [
    addressError,
    setAddressError,
  ] = useState('')

  const [
    positionError,
    setPositionError,
  ] = useState('')

  const [isLocating, setIsLocating] =
    useState(false)

  const hasCoordinates =
    latitude.trim() !==
      '' &&
    longitude.trim() !==
      ''

  function getNeedLabel(
    value: string
  ) {
    switch (value) {
      case 'Repas':
        return t(
          'createPoint.needRepas',
          'Repas'
        )

      case 'Eau':
        return t(
          'createPoint.needEau',
          'Eau'
        )

      case 'Hygiène':
        return t(
          'createPoint.needHygiene',
          'Hygiène'
        )

      case 'Vêtements':
        return t(
          'createPoint.needVetements',
          'Vêtements'
        )

      case 'Couvertures':
        return t(
          'createPoint.needCouvertures',
          'Couvertures'
        )

      case 'Soins':
        return t(
          'createPoint.needSoins',
          'Soins'
        )

      case 'Autre':
        return t(
          'createPoint.needAutre',
          'Autre'
        )

      default:
        return value
    }
  }

  function getUrgencyLabel(
    value:
      UrgencyValue
  ) {
    switch (value) {
      case 'basse':
        return t(
          'createPoint.urgencyLow',
          'Basse'
        )

      case 'moyenne':
        return t(
          'createPoint.urgencyMedium',
          'Moyenne'
        )

      case 'haute':
        return t(
          'createPoint.urgencyHigh',
          'Haute'
        )

      case 'critique':
        return t(
          'createPoint.urgencyCritical',
          'Critique'
        )
    }
  }

  function getUrgencyDescription(
    value:
      UrgencyValue
  ) {
    switch (value) {
      case 'basse':
        return t(
          'createPoint.urgencyLowDescription',
          'Situation stable'
        )

      case 'moyenne':
        return t(
          'createPoint.urgencyMediumDescription',
          'Besoin à suivre'
        )

      case 'haute':
        return t(
          'createPoint.urgencyHighDescription',
          'Intervention recommandée'
        )

      case 'critique':
        return t(
          'createPoint.urgencyCriticalDescription',
          'Priorité immédiate'
        )
    }
  }


  const createPointMutation =
    useMutation({
      mutationFn:
        createPoint,

      onSuccess: () => {
        setSuccessMessage(
          t(
            'createPoint.success',
            'Votre signalement a bien été pris en compte.'
          )
        )

        setAdresse('')
        setLatitude('')
        setLongitude('')
        setNombrePersonnesEstime(
          ''
        )
        setNiveauUrgence(
          'moyenne'
        )
        setBesoins([])
        setTypologie('')
        setCommentaire('')
        setAddressSuggestions(
          []
        )
        setShowAddressSuggestions(
          false
        )
        setAddressError('')
        setPositionError('')

        window.scrollTo({
          top: 0,
          behavior:
            'smooth',
        })
      },
    })

  useEffect(() => {
    const cleanAddress =
      adresse.trim()

    if (
      cleanAddress.length <
        3 ||
      !showAddressSuggestions
    ) {
      setAddressSuggestions(
        []
      )

      return
    }

    const timeoutId =
      window.setTimeout(
        async () => {
          setIsSearchingAddress(
            true
          )

          setAddressError(
            ''
          )

          try {
            const results =
              await searchAddresses(
                cleanAddress
              )

            setAddressSuggestions(
              results
            )
          } catch {
            setAddressSuggestions(
              []
            )

            setAddressError(
              t(
                'createPoint.addressSearchError',
                'Impossible de rechercher les adresses pour le moment.'
              )
            )
          } finally {
            setIsSearchingAddress(
              false
            )
          }
        },
        350
      )

    return () =>
      window.clearTimeout(
        timeoutId
      )
  }, [
    adresse,
    showAddressSuggestions,
    t,
  ])

  function handleAddressChange(
    value: string
  ) {
    setAdresse(value)
    setLatitude('')
    setLongitude('')
    setAddressError('')
    setSuccessMessage('')
    setShowAddressSuggestions(
      true
    )
  }

  function selectAddressSuggestion(
    suggestion:
      AddressSuggestion
  ) {
    setAdresse(
      suggestion.label
    )

    setLatitude(
      String(
        suggestion.latitude
      )
    )

    setLongitude(
      String(
        suggestion.longitude
      )
    )

    setAddressSuggestions(
      []
    )

    setShowAddressSuggestions(
      false
    )

    setAddressError('')
  }

  function toggleBesoin(
    value: string
  ) {
    setSuccessMessage('')

    setBesoins(
      (
        currentBesoins
      ) =>
        currentBesoins.includes(
          value
        )
          ? currentBesoins.filter(
              (
                besoin
              ) =>
                besoin !==
                value
            )
          : [
              ...currentBesoins,
              value,
            ]
    )
  }

  function getSafeBackPath() {
    const role =
      profile?.role ??
      'citoyen'

    if (
      role ===
        'admin' ||
      role ===
        'association'
    ) {
      return '/carte'
    }

    return '/profile'
  }

  function canAccessMap() {
    return (
      profile?.role ===
        'admin' ||
      profile?.role ===
        'association'
    )
  }

    async function useCurrentPosition() {
    setPositionError('')
    setAddressError('')
    setSuccessMessage('')
    setIsLocating(true)

    try {
      // Sur iPhone / Android, on demande l'autorisation explicitement.
      if (Capacitor.isNativePlatform()) {
        const permission =
          await Geolocation.requestPermissions()

        if (permission.location !== 'granted') {
          setPositionError(
            t(
              'createPoint.geolocationDenied',
              'Autorise la localisation pour PULSE dans les réglages du téléphone.'
            )
          )

          return
        }
      }

      const position =
        await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        })

      setLatitude(
        position.coords.latitude.toFixed(6)
      )

      setLongitude(
        position.coords.longitude.toFixed(6)
      )

      if (!adresse.trim()) {
        setAdresse('Position actuelle')
      }

      setAddressSuggestions([])
      setShowAddressSuggestions(false)
    } catch {
      setPositionError(
        t(
          'createPoint.geolocationError',
          'Impossible de récupérer ta position. Vérifie les autorisations du navigateur.'
        )
      )
    } finally {
      setIsLocating(false)
    }
  }


  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setSuccessMessage('')

    if (
      !hasCoordinates
    ) {
      setAddressError(
        t(
          'createPoint.selectAddressError',
          'Sélectionne une adresse proposée dans la liste ou utilise “Ma position”.'
        )
      )

      return
    }

    if (
      besoins.length ===
      0
    ) {
      setAddressError(
        t(
          'createPoint.selectNeedError',
          'Sélectionne au moins un besoin observé.'
        )
      )

      return
    }

    createPointMutation.mutate(
      {
        adresse,

        latitude:
          Number(
            latitude
          ),

        longitude:
          Number(
            longitude
          ),

        nombrePersonnesEstime:
          Number(
            nombrePersonnesEstime
          ),

        typologie,

        besoins,

        niveauUrgence,

        commentaire,
      }
    )
  }

  const formErrorMessage = createPointMutation.isError
    ? (createPointMutation.error as Error)?.message ||
      t(
        'createPoint.createError',
        'Erreur lors de la création du point.'
      )
    : addressError || positionError

  const summary = [
    `${nombrePersonnesEstime || '—'} ${t(
      'createPoint.people',
      'Personnes'
    ).toLowerCase()}`,
    `${t('createPoint.urgency', 'Urgence').toLowerCase()} ${getUrgencyLabel(
      niveauUrgence
    ).toLowerCase()}`,
    besoins.length > 0
      ? besoins
          .map((besoin) => getNeedLabel(besoin))
          .join(', ')
          .toLowerCase()
      : t(
          'createPoint.noSelectedNeeds',
          'Aucun besoin sélectionné pour le moment.'
        ),
  ].join(' · ')

  return (
    <div
      dir={i18n.dir()}
      className="min-w-0 px-4 pt-4"
    >
      <div className="mx-auto w-full max-w-xl">
        <Link
          to={getSafeBackPath()}
          className="inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft
            size={16}
            className={i18n.dir() === 'rtl' ? 'rotate-180' : ''}
          />
          {t('createPoint.back', 'Retour')}
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-950">
          {t('createPoint.title', 'Signaler un point')}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {t(
            'createPoint.description',
            'Choisis une adresse proposée automatiquement. La latitude et la longitude seront remplies sans saisie manuelle.'
          )}
        </p>

        {successMessage && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
            {successMessage}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-5"
        >
          {/* 1. LIEU */}

          <FormSection
            number={1}
            title={t('createPoint.address', 'Adresse ou lieu')}
          >
            <div className="relative">
              <div className="flex gap-2">
                <input
                  value={adresse}
                  onChange={(event) =>
                    handleAddressChange(event.target.value)
                  }
                  onFocus={() =>
                    setShowAddressSuggestions(true)
                  }
                  required
                  aria-label={t(
                    'createPoint.address',
                    'Adresse ou lieu'
                  )}
                  placeholder={t(
                    'createPoint.addressPlaceholder',
                    'Ex : Gare du Nord, Paris 10e'
                  )}
                  className={formFieldClass}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowAddressSuggestions(true)
                  }
                  title={t(
                    'createPoint.searchAddress',
                    'Rechercher une adresse'
                  )}
                  aria-label={t(
                    'createPoint.searchAddress',
                    'Rechercher une adresse'
                  )}
                  className="flex min-h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-600"
                >
                  <Search size={18} />
                </button>
              </div>

              {showAddressSuggestions &&
                adresse.trim().length >= 3 && (
                  <div className="absolute left-0 right-0 top-12 z-50 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                    {isSearchingAddress && (
                      <p className="px-3 py-2 text-sm text-slate-500">
                        {t(
                          'createPoint.searchingAddresses',
                          'Recherche des adresses...'
                        )}
                      </p>
                    )}

                    {!isSearchingAddress &&
                      addressSuggestions.length === 0 && (
                        <p className="px-3 py-2 text-sm text-slate-500">
                          {t(
                            'createPoint.noAddressFound',
                            'Aucune adresse trouvée.'
                          )}
                        </p>
                      )}

                    {!isSearchingAddress &&
                      addressSuggestions.map((suggestion) => (
                        <button
                          key={`${suggestion.label}-${suggestion.latitude}-${suggestion.longitude}`}
                          type="button"
                          onClick={() =>
                            selectAddressSuggestion(suggestion)
                          }
                          className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-slate-50"
                        >
                          <span className="block font-medium text-slate-900">
                            {suggestion.label}
                          </span>

                          {(suggestion.postcode ||
                            suggestion.city) && (
                            <span className="block text-xs text-slate-500">
                              {suggestion.postcode}{' '}
                              {suggestion.city}
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
                {isLocating
                  ? t('createPoint.locating', 'Localisation...')
                  : t('createPoint.myPosition', 'Ma position')}
              </button>

              {canAccessMap() && (
                <Link
                  to="/carte"
                  className="inline-flex items-center gap-1 text-slate-600"
                >
                  <MapIcon size={15} />
                  {t('createPoint.map', 'Carte')}
                </Link>
              )}
            </div>

            {hasCoordinates ? (
              <p className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
                <Check size={15} />
                {t(
                  'createPoint.coordinatesRetrieved',
                  'Coordonnées récupérées automatiquement.'
                )}{' '}
                {Number(latitude).toFixed(6)},{' '}
                {Number(longitude).toFixed(6)}
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                {t(
                  'createPoint.coordinatesHelp',
                  'Choisis une adresse proposée ou utilise “Ma position”.'
                )}
              </p>
            )}
          </FormSection>

          {/* 2. SITUATION */}

          <FormSection
            number={2}
            title={t('createPoint.situation', 'Situation')}
          >
            <label className={formLabelClass}>
              {t(
                'createPoint.estimatedPeople',
                'Nombre de personnes estimé'
              )}
            </label>

            <input
              value={nombrePersonnesEstime}
              onChange={(event) =>
                setNombrePersonnesEstime(event.target.value)
              }
              required
              type="number"
              min="1"
              placeholder={t(
                'createPoint.peoplePlaceholder',
                'Ex : 20'
              )}
              className={formFieldClass}
            />

            <label className={`${formLabelClass} mt-4`}>
              {t('createPoint.urgencyLevel', 'Niveau d’urgence')}
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
                  <span
                    className={`h-2 w-2 rounded-full ${urgencyDotClass[option.value]}`}
                  />
                  {getUrgencyLabel(option.value)}
                </button>
              ))}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {getUrgencyDescription(niveauUrgence)}
            </p>
          </FormSection>

          {/* 3. BESOINS OBSERVÉS */}

          <FormSection
            number={3}
            title={t('createPoint.observedNeeds', 'Besoins observés')}
          >
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
                    {selected ? (
                      <Check size={15} />
                    ) : (
                      <Icon size={15} />
                    )}
                    {getNeedLabel(option.value)}
                  </button>
                )
              })}
            </div>
          </FormSection>

          {/* 4. DÉTAILS */}

          <FormSection
            number={4}
            title={t('createPoint.details', 'Détails')}
          >
            <label className={formLabelClass}>
              {t('createPoint.typology', 'Typologie')}
            </label>

            <input
              value={typologie}
              onChange={(event) =>
                setTypologie(event.target.value)
              }
              placeholder={t(
                'createPoint.typologyPlaceholder',
                'Ex : familles, hommes seuls, migrants...'
              )}
              className={formFieldClass}
            />

            <label className={`${formLabelClass} mt-4`}>
              {t('createPoint.comment', 'Commentaire')}
            </label>

            <textarea
              rows={3}
              value={commentaire}
              onChange={(event) =>
                setCommentaire(event.target.value)
              }
              placeholder={t(
                'createPoint.commentPlaceholder',
                'Observations complémentaires...'
              )}
              className={`${formFieldClass} py-2`}
            />

            <p className="mt-2 text-xs text-slate-500">
              {t(
                'createPoint.tipComment',
                'Ajoute un commentaire si la situation est urgente.'
              )}
            </p>
          </FormSection>

          {/* RÉCAPITULATIF + ENVOI */}

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
                disabled={createPointMutation.isPending}
                className="min-h-11 flex-1 rounded-lg bg-[#d94a0b] px-4 text-sm font-semibold text-white transition hover:bg-[#b93607] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createPointMutation.isPending
                  ? t('createPoint.sending', 'Envoi en cours...')
                  : t('createPoint.submit', 'Envoyer le signalement')}
              </button>

              <Link
                to={getSafeBackPath()}
                className="text-sm font-medium text-slate-600"
              >
                {t('createPoint.cancel', 'Annuler')}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
