import { NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { getCurrentProfile } from '@/features/auth/api/profile'

type NavItem = {
  label: string
  path: string
  center?: boolean
}

const citoyenItems: NavItem[] = [
  { label: 'Accueil', path: '/dashboard' },
  { label: 'Signaler', path: '/points/new', center: true },
  { label: 'Espace', path: '/profile' },
]

const benevoleItems: NavItem[] = [
  { label: 'Accueil', path: '/dashboard' },
  { label: 'Signaler', path: '/points/new', center: true },
  { label: 'Interventions', path: '/interventions' },
  { label: 'Espace', path: '/profile' },
]

const associationItems: NavItem[] = [
  { label: 'Accueil', path: '/dashboard' },
  { label: 'Planning', path: '/planning' },
  { label: 'Carte', path: '/carte', center: true },
  { label: 'Interventions', path: '/interventions' },
  { label: 'Espace', path: '/profile' },
]

const adminItems: NavItem[] = [
  { label: 'Accueil', path: '/dashboard' },
  { label: 'Planning', path: '/planning' },
  { label: 'Carte', path: '/carte', center: true },
  { label: 'Interventions', path: '/interventions' },
  { label: 'Administration', path: '/administration' },
]

export default function BottomNavigation() {
  const { data: profile } = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
  })

  const role = profile?.role ?? 'citoyen'

  let items = citoyenItems

  if (role === 'benevole') items = benevoleItems
  if (role === 'association') items = associationItems
  if (role === 'admin') items = adminItems

  const columns =
    items.length === 3
      ? 'grid-cols-3'
      : items.length === 4
        ? 'grid-cols-4'
        : 'grid-cols-5'

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-[5000] border-t border-slate-200 bg-white/95 px-2 pb-3 pt-2 shadow-2xl backdrop-blur lg:hidden">
        <div className={`mx-auto grid max-w-md ${columns} items-end`}>
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                item.center
                  ? `-mt-8 flex flex-col items-center ${
                      isActive ? 'text-[#d94a0b]' : 'text-slate-500'
                    }`
                  : `flex flex-col items-center gap-1 py-2 text-[11px] font-black ${
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
                      {item.label}
                    </div>

                    <span className="mt-1 text-[11px] font-black">
                      {item.label}
                    </span>
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

      <nav className="hidden h-16 border-b border-slate-200 bg-white lg:sticky lg:top-16 lg:z-[5000] lg:block">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-center px-6">
          <div className="flex items-center gap-8">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `border-b-2 px-2 py-5 text-sm font-black ${
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
        </div>
      </nav>
    </>
  )
}