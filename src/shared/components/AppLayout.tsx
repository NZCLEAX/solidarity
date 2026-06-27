import { Outlet } from 'react-router-dom'
import BottomNavigation from './BottomNavigation'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <div className="lg:hidden">
        <header className="sticky top-0 z-[4000] border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="text-xl font-black text-slate-950">
              Solidarity
            </div>

            <a
              href="/profile"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"
            >
              Réglages
            </a>
          </div>
        </header>
      </div>

      <BottomNavigation />

      <main className="pb-24 lg:pb-0">
        <Outlet />
      </main>
    </div>
  )
}