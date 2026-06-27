import { NavLink } from 'react-router-dom'

const items = [
  { label: 'Accueil', path: '/dashboard' },
  { label: 'Planning', path: '/planning' },
  { label: 'Carte', path: '/carte', center: true },
  { label: 'Interventions', path: '/interventions' },
  { label: 'Espace', path: '/profile' },
]

export default function BottomNavigation() {
  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-[5000] border-t border-slate-200 bg-white/95 px-2 pb-3 pt-2 shadow-2xl backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 items-end">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                item.center
                  ? `-mt-8 flex flex-col items-center justify-center ${
                      isActive ? 'text-[#d94a0b]' : 'text-slate-500'
                    }`
                  : `flex flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-black ${
                      isActive ? 'text-[#d94a0b]' : 'text-slate-500'
                    }`
              }
            >
              {({ isActive }) =>
                item.center ? (
                  <>
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-full text-sm font-black text-white shadow-xl ${
                        isActive ? 'bg-[#d94a0b]' : 'bg-slate-900'
                      }`}
                    >
                      Carte
                    </div>
                    <span className="mt-1 text-[11px] font-black">Carte</span>
                  </>
                ) : (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                    <span>{item.label}</span>
                  </>
                )
              }
            </NavLink>
          ))}
        </div>
      </nav>

      <nav className="hidden h-16 border-b border-slate-200 bg-white/95 backdrop-blur lg:sticky lg:top-0 lg:z-[5000] lg:block">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          <NavLink to="/carte" className="text-xl font-black text-slate-950">
            Solidarity
          </NavLink>

          <div className="flex items-center gap-8">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `border-b-2 px-2 py-5 text-sm font-black transition ${
                    isActive
                      ? 'border-[#d94a0b] text-[#d94a0b]'
                      : 'border-transparent text-slate-600 hover:text-slate-950'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <NavLink
            to="/profile"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"
          >
            Réglages
          </NavLink>
        </div>
      </nav>
    </>
  )
}