import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/auth-context'
import type { UserRole } from '@/features/auth/model/roles'

type NavLinkItem = {
  to: string
  label: string
  roles?: UserRole[]
}

const navLinks: NavLinkItem[] = [
  { to: '/', label: 'Dashboard' },
  { to: '/map', label: 'Carte' },
  { to: '/points', label: 'Points' },
  {
    to: '/interventions',
    label: 'Interventions',
    roles: ['benevole', 'association', 'moderateur', 'admin'],
  },
  { to: '/moderation', label: 'Moderation', roles: ['moderateur', 'admin'] },
  { to: '/admin', label: 'Administration', roles: ['admin'] },
]

export function RootLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const visibleLinks = navLinks.filter((link) => !link.roles || (user && link.roles.includes(user.role)))

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col bg-gray-900 text-white">
        <div className="border-b border-gray-700 px-5 py-4">
          <span className="text-lg font-bold tracking-tight">Solidarity</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {visibleLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-700 px-5 py-3 text-xs text-gray-500">MVP v0.1.0</div>
      </aside>

      <div className="flex flex-1 flex-col bg-gray-50">
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
          <span className="text-xs uppercase tracking-wide text-gray-500">Role: {user?.role}</span>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            Deconnexion
          </button>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
