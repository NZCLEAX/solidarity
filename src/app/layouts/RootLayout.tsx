import { NavLink, Outlet } from 'react-router-dom'

const navLinks = [
  { to: '/',              label: 'Dashboard' },
  { to: '/map',           label: 'Carte' },
  { to: '/points',        label: 'Points' },
  { to: '/interventions', label: 'Interventions' },
  { to: '/moderation',    label: 'Modération' },
  { to: '/admin',         label: 'Administration' },
]

export function RootLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-700">
          <span className="text-lg font-bold tracking-tight">🤝 Solidarity</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
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

        {/* Footer sidebar */}
        <div className="px-5 py-3 border-t border-gray-700 text-xs text-gray-500">
          MVP v0.1.0
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6">
          <button
            type="button"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Déconnexion
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
