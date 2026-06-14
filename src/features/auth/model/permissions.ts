import type { UserRole } from './roles'

export type Permission =
  | 'map.view_sensitive_layers'
  | 'report.create'
  | 'report.view_own'
  | 'interventions.manage'
  | 'interventions.comment'
  | 'association.manage_team'
  | 'moderation.review'
  | 'admin.access'
  | 'analytics.view_sensitive'
  | 'export.data'
  | 'roles.manage'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  citoyen: ['report.create', 'report.view_own'],
  benevole: ['map.view_sensitive_layers', 'interventions.manage', 'interventions.comment'],
  association: [
    'map.view_sensitive_layers',
    'interventions.manage',
    'interventions.comment',
    'association.manage_team',
  ],
  moderateur: ['map.view_sensitive_layers', 'moderation.review', 'interventions.comment'],
  admin: [
    'map.view_sensitive_layers',
    'report.create',
    'report.view_own',
    'interventions.manage',
    'interventions.comment',
    'association.manage_team',
    'moderation.review',
    'admin.access',
    'analytics.view_sensitive',
    'export.data',
    'roles.manage',
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role]
}
