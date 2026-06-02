import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom'
import { HeaderDashboard } from '@/components/ui/HeaderDashboard'


const navLinks = [
  { to: '/',              label: 'Dashboard', image: "src/assets/img/logo_dashboard.png" },
  { to: '/map',           label: 'Carte', image: 'src/assets/img/logo_carte.png' },
  { to: '/points',        label: 'Points', image: '' },
  { to: '/interventions', label: 'Interventions', image: 'src/assets/img/logo_intervention.png' },
  { to: '/moderation',    label: 'Modération', image: '' },
  { to: '/admin',         label: 'Administration', image: 'src/assets/img/logo_administration.png' },
]

function SideBar() {

  const [sideBar, setSideBar] = useState(true);

  function handleSideBar() {
    if(sideBar == true) {
      setSideBar(false);
    }
    else {
      setSideBar(true);
    }
  }

  if(sideBar == true) {
       return(
          <aside className="w-60 shrink-0 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="px-5 py-4 border-gray-700">
          <span className="text-lg font-bold tracking-tight grid grid-rows-3 justify-center">            
            <img src="https://cdn.helloasso.com/img/photos/adhesions/croppedimage-6235f7bf35db4269b76f1e0a5cf12b4b.png?width=220&height=220&quality=80&img_format=webp" alt="logo" className='' width={75}/>
            <p className='text-center relative top-6'>Solidarity</p>
            <img onClick={handleSideBar} src="src\assets\img\layouting.png" alt="layout" className='relative top-6 left-5 cursor-pointer' width={35}/>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-10 px-3 py-4 space-y-1">
          {navLinks.map(({ to, label, image }) => (
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
              <img src={image} alt="logo" className='inline-block me-2' width={25}/>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="px-5 py-3 border-t border-gray-700 text-xs text-gray-500">
          <p className='w-full h-10 border border-none rounded-lg bg-indigo-600 pt-2 ps-8'>
            <img src="src\assets\img\option-de-deconnexion.png" alt="déconnexion" className="inline-block" width={25}/> 
            <p style={{ top: "1.5px"}} className='inline-block text-sm font-medium text-white relative left-2'>Déconnexion</p>
          </p>
          <button ></button>
        </div>
      </aside>
       ) 
      }
      else {
        return(
            <aside className="w-16 shrink-0 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="px-5 py-4 border-gray-700">
          <span className="text-lg font-bold tracking-tight grid grid-rows-3 justify-center">            
            <img src="https://cdn.helloasso.com/img/photos/adhesions/croppedimage-6235f7bf35db4269b76f1e0a5cf12b4b.png?width=220&height=220&quality=80&img_format=webp" alt="logo" className='ms-2' width={45}/>
            <p style={{ fontSize: "13px"}} className='text-center relative top-6'>Solidarity</p>
            <img onClick={handleSideBar} src="src\assets\img\layouting.png" alt="layout" className='relative top-6 left-2 cursor-pointer' width={35}/>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-10 px-3 py-4 space-y-1">
          {navLinks.map(({ to, label, image }) => (
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
            <img src={image} alt="logo" className='' width={75}/>

            </NavLink>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="px-5 py-3 border-t border-gray-700 text-xs text-gray-500">
            <img src="src\assets\img\option-de-deconnexion.png" alt="déconnexion" className="inline-block" width={25}/> 
          <button ></button>
        </div>
      </aside>
        )
      }
}

export function RootLayout() {

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      
      <SideBar />

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-gray-50 ">
        {/* Top bar */}
        <HeaderDashboard />

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
