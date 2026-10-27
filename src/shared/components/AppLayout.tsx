
import { useState } from 'react'
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import BottomNavigation from './BottomNavigation'
import PulseLogo from './PulseLogo'

import { getCurrentProfile } from '@/features/auth/api/profile'
import {
  isAssociationValidated,
  isVolunteerValidated,
} from '@/features/auth/utils/permissions'

import { signOut } from '@/features/auth/api/auth'

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [menuOpen, setMenuOpen] = useState(false)

  const isMapPage = location.pathname.startsWith('/carte')

  const { data: profile } = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
    retry: false,
  })

  const role = profile?.role

  const isAssociation =
    role === 'association' && isAssociationValidated(profile)

  const isAdmin = role === 'admin'
  const isBenevole = role === 'benevole'
  const volunteerValidated = isVolunteerValidated(profile)

  async function handleLogout() {
    try {
      await signOut()
      queryClient.clear()
      setMenuOpen(false)

      navigate('/login', {
        replace: true,
      })
    } catch (error) {
      console.error('Erreur de déconnexion :', error)
    }
  }

  return (
    <div
      className={
        isMapPage
          ? 'h-[100dvh] overflow-hidden bg-[#faf8f4]'
          : 'min-h-[100dvh] bg-[#faf8f4]'
      }
    >
      <header
        className="sticky top-0 z-[6000] border-b border-slate-200 bg-white/95 backdrop-blur"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <div className="relative mx-auto flex h-16 max-w-7xl items-center px-4 lg:justify-between lg:px-8">

          <Link
            to="/carte"
            onClick={() => setMenuOpen(false)}
            className="absolute left-1/2 flex h-16 -translate-x-1/2 items-center lg:static lg:translate-x-0"
          >
            <PulseLogo className="h-12 w-auto" />
          </Link>

          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ☰
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-[7000] mt-2 max-h-[70dvh] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">

                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Mon profil
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Réglages
                </Link>

                {isAssociation && (
                  <>
                    <div className="border-t border-slate-200" />

                    <Link
                      to="/association/equipe"
                      onClick={() => setMenuOpen(false)}
                      className="block px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Mon équipe
                    </Link>

                    <Link
                      to="/association/demandes"
                      onClick={() => setMenuOpen(false)}
                      className="block px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Mes demandes
                    </Link>
                  </>
                )}

                {isBenevole && !volunteerValidated && (
                  <>
                    <div className="border-t border-slate-200" />

                    <Link
                      to="/associations"
                      onClick={() => setMenuOpen(false)}
                      className="block px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Rejoindre une association
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <div className="border-t border-slate-200" />

                    <Link
                      to="/administration"
                      onClick={() => setMenuOpen(false)}
                      className="block px-5 py-3 text-sm font-bold text-[#d94a0b] hover:bg-orange-50"
                    >
                      Administration
                    </Link>

                    <Link
                      to="/administration/associations"
                      onClick={() => setMenuOpen(false)}
                      className="block px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Gestion associations
                    </Link>
                  </>
                )}

                <div className="border-t border-slate-200" />

                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="w-full px-5 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Déconnexion
                </button>

              </div>
            )}
          </div>
        </div>
      </header>

      <BottomNavigation />

      <main
        className={
          isMapPage
            ? 'overflow-hidden'
            : 'min-h-0 pb-32 lg:pb-8'
        }
        style={
          isMapPage
            ? {
                height: 'calc(100dvh - 64px - env(safe-area-inset-top, 0px))',
              }
            : undefined
        }
      >
        <Outlet />
      </main>
    </div>
  )
}
