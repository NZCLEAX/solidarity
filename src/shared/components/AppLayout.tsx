import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { signOut } from '@/features/auth/api/auth'
import { getCurrentProfile } from '@/features/auth/api/profile'
import {
  hasPermission,
  type AppPermission,
} from '@/features/auth/utils/permissions'

const navItems: Array<{
  label: string
  to: string
  icon: string
  permission: AppPermission
}> = [
  { label: 'Dashboard', to: '/dashboard', icon: '', permission: 'dashboard' },
  { label: 'Carte', to: '/carte', icon: '', permission: 'view_map' },
  { label: 'Points', to: '/points', icon: '', permission: 'view_points' },
  {
    label: 'Signaler',
    to: '/points/new',
    icon: '',
    permission: 'create_point',
  },
  {
    label: 'Interventions',
    to: '/interventions',
    icon: '',
    permission: 'manage_interventions',
  },
  {
    label: 'Modération',
    to: '/moderation',
    icon: '',
    permission: 'moderation',
  },
  {
    label: 'Administration',
    to: '/administration',
    icon: '',
    permission: 'administration',
  },
  {
  label: 'Demandes',
  to: '/association/demandes',
  icon: '',
  permission: 'manage_association_requests',
},
  {
  label: 'Équipe',
  to: '/association/equipe',
  icon: '',
  permission: 'manage_association_requests',
},
{
  label: 'Rejoindre une asso',
  to: '/associations',
  icon: '',
  permission: 'view_associations',
},
]

export default function AppLayout() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
    retry: false,
  })

  const visibleNavItems = navItems.filter((item) =>
    hasPermission(profile, item.permission)
  )

  const userInitial =
    profile?.nom?.trim()?.charAt(0)?.toUpperCase() ||
    profile?.email?.trim()?.charAt(0)?.toUpperCase() ||
    'S'

  async function handleLogout() {
    await signOut()
    setIsProfileOpen(false)
    setIsMenuOpen(false)
    navigate('/login')
  }

  function closeMenus() {
    setIsMenuOpen(false)
    setIsProfileOpen(false)
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#faf8f4] text-slate-950">
      <header className="sticky top-0 z-[2000] border-b border-[#eadfd6] bg-[#faf8f4]/95 backdrop-blur">
        <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <NavLink
            to="/"
            onClick={closeMenus}
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d94a0b] text-xl font-bold text-white shadow-lg shadow-orange-900/20">
              ♡
            </div>

            <div className="text-2xl font-extrabold tracking-tight text-slate-950">
              Solidarity
            </div>
          </NavLink>

          <nav className="hidden flex-1 items-center justify-center gap-3 xl:flex">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 rounded-2xl px-5 py-3 text-base font-bold transition',
                    isActive
                      ? 'bg-orange-100 text-[#d94a0b]'
                      : 'text-slate-600 hover:bg-orange-50 hover:text-[#d94a0b]',
                  ].join(' ')
                }
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen((value) => !value)
                setIsProfileOpen(false)
              }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eadfd6] bg-white text-2xl font-bold text-slate-800 shadow-sm transition hover:bg-orange-50 hover:text-[#d94a0b] xl:hidden"
              aria-label="Ouvrir le menu"
            >
              {isMenuOpen ? '×' : '☰'}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen((value) => !value)
                  setIsMenuOpen(false)
                }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d94a0b] text-sm font-bold text-white shadow-lg shadow-orange-900/20 transition hover:bg-[#b93607]"
                aria-label="Ouvrir le menu profil"
              >
                {userInitial}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-16 w-64 rounded-3xl border border-[#eadfd6] bg-white p-3 shadow-2xl shadow-slate-900/15">
                  <div className="mb-3 border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-bold text-slate-950">
                      {profile?.nom || 'Compte utilisateur'}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {profile?.role || 'Rôle non renseigné'}
                    </p>

                    {profile?.role === 'benevole' &&
                      profile.statut_compte !== 'actif' && (
                        <p className="mt-2 rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
                          En attente de validation association
                        </p>
                      )}
                  </div>

                  <NavLink
                    to="/profile"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-orange-50 hover:text-[#d94a0b]"
                  >
                    <span>◉</span>
                    <span>Mon profil</span>
                  </NavLink>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <span>↪</span>
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-[#eadfd6] bg-[#faf8f4] px-4 py-4 shadow-lg xl:hidden">
            <nav className="grid gap-2 sm:grid-cols-2">
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMenus}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-2xl px-5 py-4 text-base font-bold transition',
                      isActive
                        ? 'bg-orange-100 text-[#d94a0b]'
                        : 'bg-white text-slate-700 hover:bg-orange-50 hover:text-[#d94a0b]',
                    ].join(' ')
                  }
                >
                  <span className="w-6 text-center text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="w-full">
        <Outlet />
      </main>
    </div>
  )
}