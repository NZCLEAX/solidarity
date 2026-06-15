import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCurrentProfile } from '@/features/auth/api/profile'
import { getDefaultPathForProfile } from '@/features/auth/utils/permissions'

export default function HomeRedirect() {
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#faf8f4] px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#eadfd6] bg-white p-8 text-slate-600 shadow-sm">
          Chargement...
        </div>
      </div>
    )
  }

  if (isError || !profile) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={getDefaultPathForProfile(profile)} replace />
}