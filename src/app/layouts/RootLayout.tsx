import { NavLink, Outlet } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/map', label: 'Carte' },
  { to: '/points', label: 'Points' },
  { to: '/interventions', label: 'Interventions' },
  { to: '/moderation', label: 'Moderation' },
  { to: '/admin', label: 'Administration' },
  { to: '/profile', label: 'Profil' },
]

export function RootLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col bg-gray-900 text-white">
        <div className="border-b border-gray-700 px-5 py-4">
          <span className="text-lg font-bold tracking-tight">Solidarity</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navLinks.map(({ to, label }) => (
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

        <div className="border-t border-gray-700 px-5 py-3 text-xs text-gray-500">
          MVP v0.1.0
        </div>
      </aside>

      <div className="flex flex-1 flex-col bg-gray-50">
        <header className="flex h-14 items-center justify-end gap-4 border-b border-gray-200 bg-white px-6">
          <NavLink
            to="/profile"
            className="text-sm text-gray-600 transition-colors hover:text-gray-900"
          >
            Mon profil
          </NavLink>
          <button
            type="button"
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
