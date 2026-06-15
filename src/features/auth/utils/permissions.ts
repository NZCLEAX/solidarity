import type { CurrentProfile } from '@/features/auth/api/profile'

export type AppPermission =
  | 'dashboard'
  | 'view_map'
  | 'view_points'
  | 'create_point'
  | 'manage_interventions'
  | 'moderation'
  | 'administration'
  | 'view_associations'
  | 'manage_association_requests'
  | 'profile'

export function isVolunteerValidated(
  profile: CurrentProfile | null | undefined
) {
  if (!profile) return false

  return (
    profile.role === 'benevole' &&
    profile.statut_compte === 'actif' &&
    Boolean(profile.association_id)
  )
}

export function isAssociationValidated(
  profile: CurrentProfile | null | undefined
) {
  if (!profile) return false

  return (
    profile.role === 'association' &&
    profile.statut_compte === 'actif' &&
    Boolean(profile.association_id)
  )
}

export function hasPermission(
  profile: CurrentProfile | null | undefined,
  permission: AppPermission
) {
  if (!profile?.role) return false

  const role = profile.role

  if (permission === 'profile') {
    return true
  }

  if (permission === 'create_point') {
    if (role === 'association') return isAssociationValidated(profile)

    return ['citoyen', 'benevole', 'moderateur', 'admin'].includes(role)
  }

  // Bénévole non validé ou bénévole sans association :
  // il doit voir le bouton pour rejoindre une association.
  if (permission === 'view_associations') {
    return role === 'benevole' && !isVolunteerValidated(profile)
  }

  if (permission === 'view_map') {
    if (role === 'benevole') return isVolunteerValidated(profile)
    if (role === 'association') return isAssociationValidated(profile)

    return ['moderateur', 'admin'].includes(role)
  }

  if (permission === 'view_points') {
    if (role === 'benevole') return isVolunteerValidated(profile)
    if (role === 'association') return isAssociationValidated(profile)

    return ['moderateur', 'admin'].includes(role)
  }

  if (permission === 'manage_interventions') {
    if (role === 'benevole') return isVolunteerValidated(profile)
    if (role === 'association') return isAssociationValidated(profile)

    return ['moderateur', 'admin'].includes(role)
  }

  if (permission === 'dashboard') {
    if (role === 'association') return isAssociationValidated(profile)

    return ['moderateur', 'admin'].includes(role)
  }

  // Demandes + Équipe uniquement pour une association validée
  if (permission === 'manage_association_requests') {
    return isAssociationValidated(profile)
  }

  if (permission === 'moderation') {
    return ['moderateur', 'admin'].includes(role)
  }

  if (permission === 'administration') {
    return role === 'admin'
  }

  return false
}

export function getDefaultPathForProfile(
  profile: CurrentProfile | null | undefined
) {
  if (!profile?.role) return '/login'

  if (profile.role === 'admin') return '/dashboard'
  if (profile.role === 'moderateur') return '/dashboard'

  if (profile.role === 'association') {
    if (isAssociationValidated(profile)) return '/dashboard'
    return '/profile'
  }

  if (profile.role === 'benevole') {
    if (isVolunteerValidated(profile)) return '/carte'
    return '/associations'
  }

  if (profile.role === 'citoyen') return '/points/new'

  return '/profile'
}