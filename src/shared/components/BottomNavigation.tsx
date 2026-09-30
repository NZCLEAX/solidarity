import {
  useEffect,
  useState,
} from 'react'

import { NavLink } from 'react-router-dom'

import { useQuery } from '@tanstack/react-query'

import { getCurrentProfile } from '@/features/auth/api/profile'

import {
  isVolunteerValidated,
} from '@/features/auth/utils/permissions'

import {
  getLanguage,
  type AppLanguage,
} from '@/shared/i18n/i18n'

/* =========================================================
   TYPES
========================================================= */

type IconName =
  | 'home'
  | 'calendar'
  | 'plus'
  | 'interventions'
  | 'user'
  | 'admin'

type NavLabel =
  | 'home'
  | 'planning'
  | 'report'
  | 'map'
  | 'interventions'
  | 'profile'
  | 'administration'

type NavItem = {
  label: NavLabel
  path: string
  center?: boolean
  icon?: IconName
}

/* =========================================================
   TRADUCTIONS
========================================================= */

const NAV_TRANSLATIONS = {
  fr: {
    home: 'Accueil',
    planning: 'Planning',
    report: 'Signaler',
    map: 'Carte',
    interventions: 'Interventions',
    profile: 'Espace',
    administration: 'Administration',
  },

  en: {
    home: 'Home',
    planning: 'Planning',
    report: 'Report',
    map: 'Map',
    interventions: 'Interventions',
    profile: 'Profile',
    administration: 'Administration',
  },

  es: {
    home: 'Inicio',
    planning: 'Planificación',
    report: 'Señalar',
    map: 'Mapa',
    interventions: 'Intervenciones',
    profile: 'Perfil',
    administration: 'Administración',
  },

  ar: {
    home: 'الرئيسية',
    planning: 'التخطيط',
    report: 'إبلاغ',
    map: 'الخريطة',
    interventions: 'التدخلات',
    profile: 'الملف',
    administration: 'الإدارة',
  },
} as const

function getNavTranslations(
  language: AppLanguage
) {
  return (
    NAV_TRANSLATIONS[
      language as keyof typeof NAV_TRANSLATIONS
    ] ?? NAV_TRANSLATIONS.fr
  )
}

/* =========================================================
   ICÔNES

   Pas besoin de lucide-react ou d'une autre dépendance.
========================================================= */

function NavIcon({
  name,
  className = 'h-5 w-5',
}: {
  name: IconName
  className?: string
}) {
  const commonProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  /* =======================================================
     ACCUEIL
  ======================================================= */

  if (name === 'home') {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        aria-hidden="true"
        {...commonProps}
      >
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10v10h13V10" />
        <path d="M9.5 20v-6h5v6" />
      </svg>
    )
  }

  /* =======================================================
     PLANNING
  ======================================================= */

  if (name === 'calendar') {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        aria-hidden="true"
        {...commonProps}
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
        />

        <path d="M16 3v4M8 3v4M3 10h18" />

        <path d="M8 14h.01M12 14h.01M16 14h.01" />

        <path d="M8 17h.01M12 17h.01" />
      </svg>
    )
  }

  /* =======================================================
     SIGNALER
  ======================================================= */

  if (name === 'plus') {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        aria-hidden="true"
        {...commonProps}
      >
        <circle
          cx="12"
          cy="12"
          r="9"
        />

        <path d="M12 8v8M8 12h8" />
      </svg>
    )
  }

  /* =======================================================
     INTERVENTIONS
  ======================================================= */

  if (name === 'interventions') {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        aria-hidden="true"
        {...commonProps}
      >
        <rect
          x="5"
          y="4"
          width="14"
          height="17"
          rx="2"
        />

        <path d="M9 4.5V3h6v1.5" />

        <path d="M8.5 10h7M8.5 14h7M8.5 18h4" />
      </svg>
    )
  }

  /* =======================================================
     PROFIL
  ======================================================= */

  if (name === 'user') {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        aria-hidden="true"
        {...commonProps}
      >
        <circle
          cx="12"
          cy="8"
          r="4"
        />

        <path d="M4.5 21c.7-4 3.3-6 7.5-6s6.8 2 7.5 6" />
      </svg>
    )
  }

  /* =======================================================
     ADMINISTRATION
  ======================================================= */

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...commonProps}
    >
      <path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" />

      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

/* =========================================================
   CITOYEN
========================================================= */

const citoyenItems: NavItem[] = [
  {
    label: 'report',
    path: '/points/new',
    center: true,
  },

  {
    label: 'profile',
    path: '/profile',
    icon: 'user',
  },
]

/* =========================================================
   BÉNÉVOLE NON VALIDÉ
========================================================= */

const benevoleNonValideItems: NavItem[] = [
  {
    label: 'report',
    path: '/points/new',
    center: true,
  },

  {
    label: 'profile',
    path: '/profile',
    icon: 'user',
  },
]

/* =========================================================
   BÉNÉVOLE VALIDÉ

   Planning
   Signaler
   Carte
   Espace

   PAS de gestion des interventions.
   PAS de modification des points.
========================================================= */

const benevoleValideItems: NavItem[] = [
  {
    label: 'planning',
    path: '/planning',
    icon: 'calendar',
  },

  {
    label: 'report',
    path: '/points/new',
    icon: 'plus',
  },

  {
    label: 'map',
    path: '/carte',
    center: true,
  },

  {
    label: 'profile',
    path: '/profile',
    icon: 'user',
  },
]

/* =========================================================
   ASSOCIATION
========================================================= */

const associationItems: NavItem[] = [
  {
    label: 'home',
    path: '/dashboard',
    icon: 'home',
  },

  {
    label: 'planning',
    path: '/planning',
    icon: 'calendar',
  },

  {
    label: 'map',
    path: '/carte',
    center: true,
  },

  {
    label: 'interventions',
    path: '/interventions',
    icon: 'interventions',
  },

  {
    label: 'profile',
    path: '/profile',
    icon: 'user',
  },
]

/* =========================================================
   ADMIN
========================================================= */

const adminItems: NavItem[] = [
  {
    label: 'home',
    path: '/dashboard',
    icon: 'home',
  },

  {
    label: 'planning',
    path: '/planning',
    icon: 'calendar',
  },

  {
    label: 'map',
    path: '/carte',
    center: true,
  },

  {
    label: 'interventions',
    path: '/interventions',
    icon: 'interventions',
  },

  {
    label: 'administration',
    path: '/administration',
    icon: 'admin',
  },
]

/* =========================================================
   COMPOSANT
========================================================= */

export default function BottomNavigation() {
  const { data: profile } = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
  })

  /* =======================================================
     LANGUE
  ======================================================= */

  const [language, setLanguage] =
    useState<AppLanguage>(() => getLanguage())

  /*
   * La page Réglages modifie l'attribut lang de <html>.
   *
   * MutationObserver permet donc à BottomNavigation
   * de réagir immédiatement au changement de langue,
   * sans rechargement de la page.
   */
  useEffect(() => {
    function syncLanguage() {
      const nextLanguage =
        getLanguage()

      setLanguage((current) =>
        current === nextLanguage
          ? current
          : nextLanguage
      )
    }

    /*
     * Synchronisation initiale.
     */
    syncLanguage()

    /*
     * Changement effectué depuis un autre onglet.
     */
    function handleStorage(
      event: StorageEvent
    ) {
      if (
        event.key ===
        'pulse-language'
      ) {
        syncLanguage()
      }
    }

    window.addEventListener(
      'storage',
      handleStorage
    )

    /*
     * Changement effectué dans l'onglet actuel.
     *
     * SettingsPage change :
     *
     * document.documentElement.lang
     *
     * On surveille donc cet attribut.
     */
    const observer =
      new MutationObserver(() => {
        syncLanguage()
      })

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: ['lang'],
      }
    )

    return () => {
      window.removeEventListener(
        'storage',
        handleStorage
      )

      observer.disconnect()
    }
  }, [])

  const labels =
    getNavTranslations(language)

  /* =======================================================
     RÔLE
  ======================================================= */

  const role =
    profile?.role ?? 'citoyen'

  const volunteerValidated =
    isVolunteerValidated(profile)

  let items: NavItem[] =
    citoyenItems

  if (role === 'admin') {
    items = adminItems
  } else if (
    role === 'association'
  ) {
    items = associationItems
  } else if (
    role === 'benevole'
  ) {
    items = volunteerValidated
      ? benevoleValideItems
      : benevoleNonValideItems
  }

  /* =======================================================
     COLONNES MOBILE
  ======================================================= */

  const columns =
    items.length === 2
      ? 'grid-cols-2'
      : items.length === 3
        ? 'grid-cols-3'
        : items.length === 4
          ? 'grid-cols-4'
          : 'grid-cols-5'

  /* =======================================================
     RENDU
  ======================================================= */

  return (
    <>
      {/* =====================================================
          NAVIGATION MOBILE
      ===================================================== */}

      <nav className="fixed bottom-0 left-0 right-0 z-[5000] border-t border-slate-200 bg-white/95 px-2 pb-3 pt-2 shadow-2xl backdrop-blur lg:hidden">
        <div
          className={`mx-auto grid max-w-md ${columns} items-end`}
        >
          {items.map((item) => {
            const label =
              labels[item.label]

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({
                  isActive,
                }) =>
                  item.center
                    ? `-mt-8 flex flex-col items-center ${
                        isActive
                          ? 'text-[#d94a0b]'
                          : 'text-slate-500'
                      }`
                    : `flex min-w-0 flex-col items-center justify-center gap-1 py-2 text-[11px] font-black transition ${
                        isActive
                          ? 'text-[#d94a0b]'
                          : 'text-slate-500'
                      }`
                }
              >
                {({ isActive }) =>
                  item.center ? (
                    <>
                      {/* =========================================
                          BOUTON CENTRAL PULSE
                      ========================================= */}

                      <div
                        className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full shadow-xl transition ${
                          isActive
                            ? 'bg-[#d94a0b]'
                            : 'bg-slate-900'
                        }`}
                      >
                        <img
                          src="/branding/pulse-icon-dark.png"
                          alt=""
                          className="h-12 w-12 object-contain"
                        />
                      </div>

                      <span className="mt-1 max-w-full truncate text-[11px] font-black">
                        {label}
                      </span>
                    </>
                  ) : (
                    <>
                      {/* =========================================
                          ICÔNE
                      ========================================= */}

                      {item.icon && (
                        <NavIcon
                          name={
                            item.icon
                          }
                          className="h-[21px] w-[21px]"
                        />
                      )}

                      {/* =========================================
                          LABEL
                      ========================================= */}

                      <span className="max-w-full truncate">
                        {label}
                      </span>
                    </>
                  )
                }
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* =====================================================
          NAVIGATION DESKTOP
      ===================================================== */}

      <nav className="hidden h-16 border-b border-slate-200 bg-white lg:sticky lg:top-16 lg:z-[5000] lg:block">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-center px-6">
          <div className="flex items-center gap-8">
            {items.map((item) => {
              const label =
                labels[item.label]

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({
                    isActive,
                  }) =>
                    `flex items-center gap-2 border-b-2 px-2 py-5 text-sm font-black transition ${
                      isActive
                        ? 'border-[#d94a0b] text-[#d94a0b]'
                        : 'border-transparent text-slate-600 hover:text-slate-950'
                    }`
                  }
                >
                  {!item.center &&
                    item.icon && (
                      <NavIcon
                        name={
                          item.icon
                        }
                        className="h-[18px] w-[18px]"
                      />
                    )}

                  {label}
                </NavLink>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}