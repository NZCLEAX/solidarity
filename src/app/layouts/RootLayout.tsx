import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from '@/features/auth/api/auth'

export function RootLayout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error)
    }
  }

  const baseLinkClass = 'block px-4 py-3 rounded-lg'
  const activeLinkClass = 'bg-indigo-600 text-white font-medium'
  const inactiveLinkClass = 'text-white hover:bg-slate-900'

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-72 bg-slate-950 text-white flex flex-col">
        <div className="px-8 py-6 border-b border-slate-800 text-3xl font-bold">
          🤝 Solidarity
        </div>

        <nav className="flex-1 px-4 py-6 space-y-3">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/carte"
            className={({ isActive }) =>
              `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            Carte
          </NavLink>

          <NavLink
            to="/points"
            className={({ isActive }) =>
              `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            Points
          </NavLink>

          <NavLink
            to="/interventions"
            className={({ isActive }) =>
              `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            Interventions
          </NavLink>

          <NavLink
            to="/moderation"
            className={({ isActive }) =>
              `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            Modération
          </NavLink>

          <NavLink
            to="/administration"
            className={({ isActive }) =>
              `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            Administration
          </NavLink>
        </nav>

        <div className="px-6 py-4 border-t border-slate-800 text-sm text-slate-400">
          MVP v0.1.0
        </div>
      </aside>

      <main className="flex-1">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-end px-8">
          <button
            type="button"
            onClick={handleLogout}
            className="text-slate-700 hover:text-red-600"
          >
            Déconnexion
          </button>
        </header>

        <section className="p-8">
          <Outlet />
        </section>
      </main>
    </div>
  )
}