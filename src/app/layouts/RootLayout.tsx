import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/auth-context'
import type { UserRole } from '@/features/auth/model/roles'
import { logSecurityEvent } from '@/features/security/services/security-audit'

type NavLinkItem = {
  to: string
  label: string
  roles?: UserRole[]
}

const navLinks: NavLinkItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/carte', label: 'Carte' },
  { to: '/points', label: 'Points' },
  {
    to: '/interventions',
    label: 'Interventions',
    roles: ['benevole', 'association', 'moderateur', 'admin'],
  },
  { to: '/moderation', label: 'Moderation', roles: ['moderateur', 'admin'] },
  { to: '/administration', label: 'Administration', roles: ['admin'] },
  { to: '/profile', label: 'Profil' },
]

export function RootLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const visibleLinks = navLinks.filter(
    (link) => !link.roles || (user && link.roles.includes(user.role))
  )

  const handleLogout = async () => {
    void logSecurityEvent({
      action: 'auth.logout',
      resource: 'session',
      outcome: 'success',
      details: { role: user?.role ?? null },
    })

    await logout()
    navigate('/login', { replace: true })
  }

  const baseLinkClass = 'block rounded-lg px-4 py-3 transition-colors'
  const activeLinkClass = 'bg-indigo-600 font-medium text-white'
  const inactiveLinkClass = 'text-white hover:bg-slate-900'

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="flex w-72 flex-col bg-slate-950 text-white">
        <div className="border-b border-slate-800 px-8 py-6 text-3xl font-bold">
          Solidarity
        </div>

        <nav className="flex-1 space-y-3 px-4 py-6">
          {visibleLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 px-6 py-4 text-sm text-slate-400">
          MVP v0.1.0
        </div>
      </aside>

      <main className="flex-1">
        <header className="flex h-20 items-center justify-end gap-4 border-b border-slate-200 bg-white px-8">
          <span className="text-xs uppercase tracking-wide text-slate-500">
            Role: {user?.role}
          </span>
          <NavLink
            to="/profile"
            className="text-sm text-slate-700 transition-colors hover:text-indigo-600"
          >
            Mon profil
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-slate-700 transition-colors hover:text-red-600"
          >
            Deconnexion
          </button>
        </header>

        <section className="p-8">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
