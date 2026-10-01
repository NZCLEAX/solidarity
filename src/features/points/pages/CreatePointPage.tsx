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

import {
  Utensils,
  Droplets,
  Sparkles,
  Shirt,
  BedDouble,
  HeartPulse,
  MoreHorizontal,
} from 'lucide-react'

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

  const selectedUrgency =
    urgencyOptions.find(
      (option) =>
        option.value ===
        niveauUrgence
    )

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

  function useCurrentPosition() {
    setPositionError('')
    setAddressError('')
    setSuccessMessage('')

    if (
      !navigator.geolocation
    ) {
      setPositionError(
        t(
          'createPoint.geolocationUnavailable',
          'La géolocalisation n’est pas disponible sur ce navigateur.'
        )
      )

      return
    }

    navigator.geolocation.getCurrentPosition(
      (
        position
      ) => {
        setLatitude(
          position.coords.latitude.toFixed(
            6
          )
        )

        setLongitude(
          position.coords.longitude.toFixed(
            6
          )
        )

        if (
          !adresse.trim()
        ) {
          setAdresse(
            'Position actuelle'
          )
        }

        setAddressSuggestions(
          []
        )

        setShowAddressSuggestions(
          false
        )
      },

      () => {
        setPositionError(
          t(
            'createPoint.geolocationError',
            'Impossible de récupérer ta position. Vérifie les autorisations du navigateur.'
          )
        )
      }
    )
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

  return (
    <div
      dir={i18n.dir()}
      className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-6 sm:px-6 lg:px-8 xl:px-10"
    >
      <div className="mx-auto w-full max-w-[1500px]">

        <Link
          to={
            getSafeBackPath()
          }
          className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 hover:text-[#d94a0b]"
        >
          <span
            aria-hidden="true"
          >
            {i18n.dir() ===
            'rtl'
              ? '→'
              : '←'}
          </span>

          <span>
            {t(
              'createPoint.back',
              'Retour'
            )}
          </span>
        </Link>

        <div className="mt-5 grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">

          <section>
            <div className="mb-7">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
                {t(
                  'createPoint.newReport',
                  'Nouveau signalement'
                )}
              </p>

              <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
                {t(
                  'createPoint.title',
                  'Signaler un point'
                )}
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {t(
                  'createPoint.description',
                  'Choisis une adresse proposée automatiquement. La latitude et la longitude seront remplies sans saisie manuelle.'
                )}
              </p>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="rounded-[2rem] border border-[#eadfd6] bg-white p-5 shadow-sm sm:p-7 lg:p-8"
            >
              {successMessage && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                  {
                    successMessage
                  }
                </div>
              )}

              {createPointMutation.isError && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {(createPointMutation.error as Error)
                    ?.message ||
                    t(
                      'createPoint.createError',
                      'Erreur lors de la création du point.'
                    )}
                </div>
              )}

              {addressError && (
                <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-medium text-orange-700">
                  {
                    addressError
                  }
                </div>
              )}

              {positionError && (
                <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-medium text-orange-700">
                  {
                    positionError
                  }
                </div>
              )}

              <div className="grid gap-6">

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    {t(
                      'createPoint.address',
                      'Adresse ou lieu'
                    )}
                  </label>

                  <div className="relative">
                    <div className="flex gap-3">
                      <input
                        value={
                          adresse
                        }
                        onChange={(
                          event
                        ) =>
                          handleAddressChange(
                            event
                              .target
                              .value
                          )
                        }
                        onFocus={() =>
                          setShowAddressSuggestions(
                            true
                          )
                        }
                        required
                        placeholder={t(
                          'createPoint.addressPlaceholder',
                          'Ex : Gare du Nord, Paris 10e'
                        )}
                        className="min-h-14 flex-1 rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowAddressSuggestions(
                            true
                          )
                        }
                        className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-300 bg-white text-sm font-black text-slate-500 transition hover:bg-orange-50 hover:text-[#d94a0b] sm:flex"
                        title={t(
                          'createPoint.searchAddress',
                          'Rechercher une adresse'
                        )}
                      >
                        OK
                      </button>
                    </div>

                    {showAddressSuggestions &&
                      adresse
                        .trim()
                        .length >=
                        3 && (
                        <div className="absolute left-0 right-0 top-16 z-50 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">

                          {isSearchingAddress && (
                            <div className="px-4 py-3 text-sm text-slate-500">
                              {t(
                                'createPoint.searchingAddresses',
                                'Recherche des adresses...'
                              )}
                            </div>
                          )}

                          {!isSearchingAddress &&
                            addressSuggestions.length ===
                              0 && (
                              <div className="px-4 py-3 text-sm text-slate-500">
                                {t(
                                  'createPoint.noAddressFound',
                                  'Aucune adresse trouvée.'
                                )}
                              </div>
                            )}

                          {!isSearchingAddress &&
                            addressSuggestions.map(
                              (
                                suggestion
                              ) => (
                                <button
                                  key={`${suggestion.label}-${suggestion.latitude}-${suggestion.longitude}`}
                                  type="button"
                                  onClick={() =>
                                    selectAddressSuggestion(
                                      suggestion
                                    )
                                  }
                                  className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-orange-50"
                                >
                                  <span>
                                    <span className="block text-sm font-bold text-slate-900">
                                      {
                                        suggestion.label
                                      }
                                    </span>

                                    {(suggestion.postcode ||
                                      suggestion.city) && (
                                      <span className="mt-1 block text-xs font-medium text-slate-500">
                                        {
                                          suggestion.postcode
                                        }{' '}
                                        {
                                          suggestion.city
                                        }
                                      </span>
                                    )}
                                  </span>
                                </button>
                              )
                            )}
                        </div>
                      )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3">

                    <button
                      type="button"
                      onClick={
                        useCurrentPosition
                      }
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      {t(
                        'createPoint.myPosition',
                        'Ma position'
                      )}
                    </button>

                    {canAccessMap() && (
                      <Link
                        to="/carte"
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                      >
                        {t(
                          'createPoint.map',
                          'Carte'
                        )}
                      </Link>
                    )}
                  </div>

                  {hasCoordinates && (
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                      {t(
                        'createPoint.coordinatesRetrieved',
                        'Coordonnées récupérées automatiquement.'
                      )}

                      <br />

                      <span className="font-semibold">
                        {t(
                          'createPoint.latitude',
                          'Latitude'
                        )}{' '}
                        :{' '}
                        {
                          latitude
                        }
                      </span>

                      {' · '}

                      <span className="font-semibold">
                        {t(
                          'createPoint.longitude',
                          'Longitude'
                        )}{' '}
                        :{' '}
                        {
                          longitude
                        }
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    {t(
                      'createPoint.estimatedPeople',
                      'Nombre de personnes estimé'
                    )}
                  </label>

                  <input
                    value={
                      nombrePersonnesEstime
                    }
                    onChange={(
                      event
                    ) =>
                      setNombrePersonnesEstime(
                        event
                          .target
                          .value
                      )
                    }
                    required
                    type="number"
                    min="1"
                    placeholder={t(
                      'createPoint.peoplePlaceholder',
                      'Ex : 20'
                    )}
                    className="min-h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-bold text-slate-800">
                    {t(
                      'createPoint.urgencyLevel',
                      'Niveau d’urgence'
                    )}
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {urgencyOptions.map(
                      (
                        option
                      ) => {
                        const isSelected =
                          niveauUrgence ===
                          option.value

                        return (
                          <button
                            key={
                              option.value
                            }
                            type="button"
                            onClick={() => {
                              setNiveauUrgence(
                                option.value
                              )

                              setSuccessMessage(
                                ''
                              )
                            }}
                            className={[
                              'rounded-2xl border p-4 text-left transition',

                              isSelected
                                ? 'border-[#d94a0b] bg-orange-50 ring-4 ring-orange-100'
                                : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/50',
                            ].join(
                              ' '
                            )}
                          >
                            <div className="text-base font-black text-slate-950">
                              {getUrgencyLabel(
                                option.value
                              )}
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                              {getUrgencyDescription(
                                option.value
                              )}
                            </p>
                          </button>
                        )
                      }
                    )}
                  </div>
                </div>

                {/* ================================
                    BESOINS AVEC ICONES LUCIDE
                ================================= */}

                <div>
                  <label className="mb-3 block text-sm font-bold text-slate-800">
                    {t(
                      'createPoint.observedNeeds',
                      'Besoins observés'
                    )}
                  </label>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
                    {needsOptions.map(
                      (
                        option
                      ) => {
                        const isSelected =
                          besoins.includes(
                            option.value
                          )

                        const Icon =
                          option.icon

                        return (
                          <button
                            key={
                              option.value
                            }
                            type="button"
                            onClick={() =>
                              toggleBesoin(
                                option.value
                              )
                            }
                            aria-pressed={
                              isSelected
                            }
                            className={[
                              'group flex min-h-[112px] flex-col items-center justify-center gap-3 rounded-2xl border p-3 text-center transition',

                              isSelected
                                ? 'border-[#d94a0b] bg-orange-50 ring-4 ring-orange-100'
                                : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/50',
                            ].join(
                              ' '
                            )}
                          >
                            <Icon
                              size={
                                28
                              }
                              strokeWidth={
                                1.8
                              }
                              aria-hidden="true"
                              className={
                                isSelected
                                  ? 'text-[#d94a0b]'
                                  : 'text-slate-500 transition group-hover:text-[#d94a0b]'
                              }
                            />

                            <span
                              className={[
                                'text-sm font-black',

                                isSelected
                                  ? 'text-[#d94a0b]'
                                  : 'text-slate-800',
                              ].join(
                                ' '
                              )}
                            >
                              {getNeedLabel(
                                option.value
                              )}
                            </span>
                          </button>
                        )
                      }
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    {t(
                      'createPoint.typology',
                      'Typologie'
                    )}
                  </label>

                  <input
                    value={
                      typologie
                    }
                    onChange={(
                      event
                    ) =>
                      setTypologie(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder={t(
                      'createPoint.typologyPlaceholder',
                      'Ex : familles, hommes seuls, migrants...'
                    )}
                    className="min-h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    {t(
                      'createPoint.comment',
                      'Commentaire'
                    )}
                  </label>

                  <textarea
                    value={
                      commentaire
                    }
                    onChange={(
                      event
                    ) =>
                      setCommentaire(
                        event
                          .target
                          .value
                      )
                    }
                    rows={5}
                    placeholder={t(
                      'createPoint.commentPlaceholder',
                      'Observations complémentaires...'
                    )}
                    className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#d94a0b] focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                  <Link
                    to={
                      getSafeBackPath()
                    }
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    {t(
                      'createPoint.cancel',
                      'Annuler'
                    )}
                  </Link>

                  <button
                    type="submit"
                    disabled={
                      createPointMutation.isPending
                    }
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#d94a0b] px-7 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#bf3f08] disabled:opacity-60 sm:min-w-56"
                  >
                    {createPointMutation.isPending
                      ? t(
                          'createPoint.sending',
                          'Envoi en cours...'
                        )
                      : t(
                          'createPoint.submit',
                          'Envoyer le signalement'
                        )}
                  </button>
                </div>
              </div>
            </form>
          </section>

          {/* =====================================
              APERÇU DESKTOP
          ====================================== */}

          <aside className="hidden xl:block">
            <div className="sticky top-28 space-y-5">

              <div className="rounded-[2rem] border border-[#eadfd6] bg-white p-6 shadow-sm">

                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d94a0b]">
                  {t(
                    'createPoint.preview',
                    'Aperçu'
                  )}
                </p>

                <h2 className="mt-3 text-2xl font-black text-slate-950">
                  {adresse ||
                    t(
                      'createPoint.pointAddress',
                      'Adresse du point'
                    )}
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">
                      {t(
                        'createPoint.people',
                        'Personnes'
                      )}
                    </p>

                    <p className="mt-2 text-3xl font-black text-slate-950">
                      {nombrePersonnesEstime ||
                        '0'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-orange-50 p-4">
                    <p className="text-xs font-bold uppercase text-orange-600">
                      {t(
                        'createPoint.urgency',
                        'Urgence'
                      )}
                    </p>

                    <p className="mt-2 text-lg font-black text-orange-700">
                      {selectedUrgency
                        ? getUrgencyLabel(
                            selectedUrgency.value
                          )
                        : '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-bold text-slate-800">
                    {t(
                      'createPoint.coordinates',
                      'Coordonnées'
                    )}
                  </p>

                  {hasCoordinates ? (
                    <p className="mt-2 text-sm leading-relaxed text-emerald-700">
                      {t(
                        'createPoint.coordinatesRetrieved',
                        'Coordonnées récupérées automatiquement.'
                      )}

                      <br />

                      {t(
                        'createPoint.latitude',
                        'Latitude'
                      )}{' '}
                      :{' '}

                      <span className="font-bold">
                        {
                          latitude
                        }
                      </span>

                      <br />

                      {t(
                        'createPoint.longitude',
                        'Longitude'
                      )}{' '}
                      :{' '}

                      <span className="font-bold">
                        {
                          longitude
                        }
                      </span>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {t(
                        'createPoint.coordinatesHelp',
                        'Choisis une adresse proposée ou utilise “Ma position”.'
                      )}
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  <p className="text-sm font-bold text-slate-800">
                    {t(
                      'createPoint.selectedNeeds',
                      'Besoins sélectionnés'
                    )}
                  </p>

                  {besoins.length ===
                  0 ? (
                    <p className="mt-2 text-sm text-slate-500">
                      {t(
                        'createPoint.noSelectedNeeds',
                        'Aucun besoin sélectionné pour le moment.'
                      )}
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {besoins.map(
                        (
                          besoin
                        ) => (
                          <span
                            key={
                              besoin
                            }
                            className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200"
                          >
                            {getNeedLabel(
                              besoin
                            )}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6">
                <h3 className="text-lg font-black text-emerald-900">
                  {t(
                    'createPoint.fieldTips',
                    'Conseils terrain'
                  )}
                </h3>

                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-emerald-800">

                  <li>
                    {t(
                      'createPoint.tipAddress',
                      'Choisis une adresse proposée dans la liste.'
                    )}
                  </li>

                  <li>
                    {t(
                      'createPoint.tipCoordinates',
                      'Les coordonnées seront remplies automatiquement.'
                    )}
                  </li>

                  <li>
                    {t(
                      'createPoint.tipPosition',
                      'Utilise “Ma position” si tu es sur place.'
                    )}
                  </li>

                  <li>
                    {t(
                      'createPoint.tipComment',
                      'Ajoute un commentaire si la situation est urgente.'
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}