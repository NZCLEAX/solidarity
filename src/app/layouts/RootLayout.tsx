import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { signOut } from '@/features/auth/api/auth'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/carte', label: 'Carte' },
  { to: '/points', label: 'Points' },
  { to: '/interventions', label: 'Interventions' },
  { to: '/moderation', label: 'Moderation' },
  { to: '/administration', label: 'Administration' },
  { to: '/profile', label: 'Profil' },
]

export function RootLayout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Erreur lors de la deconnexion :', error)
    }
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
          {navLinks.map(({ to, label }) => (
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
