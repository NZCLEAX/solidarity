import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import BottomNavigation from './BottomNavigation'
import PulseLogo from './PulseLogo'

import { getCurrentProfile } from '@/features/auth/api/profile'
import {
  isAssociationValidated,
  isVolunteerValidated,
} from '@/features/auth/utils/permissions'

import { supabase } from '@/lib/supabase'

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()

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
      await supabase.auth.signOut()

      setMenuOpen(false)

      navigate('/login', {
        replace: true,
      })
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error)
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
      {/* =====================================================
          HEADER PULSE
      ===================================================== */}

      <header className="sticky top-0 z-[6000] border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center px-4 lg:justify-between lg:px-8">

          {/* LOGO */}

          <Link
            to="/carte"
            onClick={() => setMenuOpen(false)}
            className="absolute left-1/2 flex h-16 -translate-x-1/2 items-center lg:static lg:translate-x-0"
          >
            <PulseLogo className="h-12 w-auto" />
          </Link>

          {/* MENU HAMBURGER */}

          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ☰
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-[7000] mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                {/* PROFIL */}

                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Mon profil
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Réglages
                </Link>

                {/* ASSOCIATION */}

                {isAssociation && (
                  <>
                    <div className="border-t border-slate-200" />

                    <Link
                      to="/association/equipe"
                      onClick={() => setMenuOpen(false)}
                      className="block px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Mon équipe
                    </Link>

                    <Link
                      to="/association/demandes"
                      onClick={() => setMenuOpen(false)}
                      className="block px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Mes demandes
                    </Link>
                  </>
                )}

                {/* BÉNÉVOLE NON ENCORE RATTACHÉ */}

                {isBenevole && !volunteerValidated && (
                  <>
                    <div className="border-t border-slate-200" />

                    <Link
                      to="/associations"
                      onClick={() => setMenuOpen(false)}
                      className="block px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Rejoindre une association
                    </Link>
                  </>
                )}

                {/* ADMIN */}

                {isAdmin && (
                  <>
                    <div className="border-t border-slate-200" />

                    <Link
                      to="/administration"
                      onClick={() => setMenuOpen(false)}
                      className="block px-5 py-3 text-sm font-bold text-[#d94a0b] transition hover:bg-orange-50"
                    >
                      Administration
                    </Link>

                    <Link
                      to="/administration/associations"
                      onClick={() => setMenuOpen(false)}
                      className="block px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Gestion associations
                    </Link>
                  </>
                )}

                {/* DÉCONNEXION */}

                <div className="border-t border-slate-200" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-5 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================
          NAVIGATION

          MOBILE  -> barre fixe en bas
          DESKTOP -> barre horizontale en haut

          NE PAS SUPPRIMER
      ===================================================== */}

      <BottomNavigation />

      {/* =====================================================
          CONTENU DES PAGES
      ===================================================== */}

      <main
        className={
          isMapPage
            ? 'h-[calc(100dvh-64px)] overflow-hidden'
            : 'min-h-[calc(100dvh-64px)] pb-32 lg:pb-8'
        }
      >
        <Outlet />
      </main>
    </div>
  )
}