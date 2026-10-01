import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { getCurrentUser } from '@/features/auth/api/auth'

export default function StartPage() {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#d94a0b]" />

          <p className="mt-4 text-sm font-bold text-white">
            Chargement de PULSE...
          </p>
        </div>
      </div>
    )
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to="/carte" replace />
}