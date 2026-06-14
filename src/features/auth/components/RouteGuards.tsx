import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/auth-context'
import type { UserRole } from '@/features/auth/model/roles'
import { logSecurityEvent } from '@/features/security/services/security-audit'

export function RequireAuth() {
  const { user, isLoading, isMfaRequired } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="text-sm text-gray-500">Chargement de la session...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (isMfaRequired) {
    return <Navigate to="/mfa-required" replace />
  }

  return <Outlet />
}

export function RequireRole({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (user && !allowedRoles.includes(user.role)) {
      void logSecurityEvent({
        action: 'auth.access.denied',
        resource: location.pathname,
        outcome: 'denied',
        details: { required_roles: allowedRoles, current_role: user.role },
      })
    }
  }, [allowedRoles, location.pathname, user])

  if (isLoading) {
    return <div className="text-sm text-gray-500">Verification des droits...</div>
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}

export function GuestOnly() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="text-sm text-gray-500">Chargement...</div>
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
