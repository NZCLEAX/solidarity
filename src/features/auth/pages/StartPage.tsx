import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { getCurrentProfile } from '@/features/auth/api/profile'
import { getDefaultPathForProfile } from '@/features/auth/utils/permissions'

export default function StartPage() {
  const {
    data: session,
    isLoading: sessionLoading,
    isError: sessionError,
  } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data, error } =
        await supabase.auth.getSession()

      if (error) {
        throw error
      }

      return data.session
    },
    retry: false,
  })

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({
    queryKey: ['current-profile'],
    queryFn: getCurrentProfile,
    enabled: Boolean(session?.user),
    retry: false,
  })

  if (
    sessionLoading ||
    (session && profileLoading)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#d94a0b]" />

          <p className="mt-4 text-sm font-bold text-white">
            Chargement de PULSE...
          </p>
        </div>
      </div>
    )
  }

  if (
    sessionError ||
    !session ||
    !session.user
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (
    profileError ||
    !profile
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  const defaultPath =
    getDefaultPathForProfile(profile)

  return (
    <Navigate
      to={defaultPath}
      replace
    />
  )
}