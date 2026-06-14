import { useAuth } from '@/features/auth/auth-context'
import { getPermissions, hasPermission, type Permission } from '@/features/auth/model/permissions'

export function usePermissions() {
  const { user } = useAuth()

  if (!user) {
    return {
      can: (_permission: Permission) => false,
      list: [] as Permission[],
    }
  }

  return {
    can: (permission: Permission) => hasPermission(user.role, permission),
    list: getPermissions(user.role),
  }
}
