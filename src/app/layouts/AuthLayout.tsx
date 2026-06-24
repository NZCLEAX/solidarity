import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center px-4 py-10">
      <Outlet />
    </div>
  )
}
