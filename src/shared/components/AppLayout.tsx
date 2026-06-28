import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import BottomNavigation from './BottomNavigation'
import { getCurrentProfile } from '@/features/auth/api/profile'
import { supabase } from '@/lib/supabase'

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isMapPage = location.pathname.startsWith('/carte')
  const [menuOpen, setMenuOpen] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
  })

  const role = profile?.role ?? 'citoyen'
  const isAssociation = role === 'association'
  const isAdmin = role === 'admin'
  const isBenevole = role === 'benevole'
  const isCitoyen = role === 'citoyen'

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div
      className={
        isMapPage
          ? 'h-[100dvh] overflow-hidden bg-[#faf8f4]'
          : 'min-h-[100dvh] bg-[#faf8f4]'
      }
    >
      <header className="sticky top-0 z-[6000] border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/carte" className="text-xl font-black text-slate-950">
            Solidarity
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ☰
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-[7000] mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
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

                {(isBenevole || isCitoyen) && (
                  <>
                    <div className="border-t border-slate-200" />

                    <Link
                      to="/interventions"
                      onClick={() => setMenuOpen(false)}
                      className="block px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Mes interventions
                    </Link>

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
                  onClick={handleLogout}
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
            ? 'h-[calc(100dvh-64px)] overflow-hidden'
            : 'min-h-[calc(100dvh-64px)] pb-28 lg:pb-8'
        }
      >
        <Outlet />
      </main>
    </div>
  )
}