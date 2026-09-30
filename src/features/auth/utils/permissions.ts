import type { CurrentProfile } from '@/features/auth/api/profile'

export type AppPermission =
  | 'dashboard'
  | 'view_map'
  | 'view_points'
  | 'create_point'
  | 'edit_point'
  | 'planning'
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

  // =========================================================
  // PROFIL
  // =========================================================

  if (permission === 'profile') {
    return true
  }

  // =========================================================
  // CRÉER / SIGNALER UN POINT
  //
  // Citoyen : OUI
  // Bénévole : OUI
  // Association : OUI si validée
  // Modérateur : OUI
  // Admin : OUI
  // =========================================================

  if (permission === 'create_point') {
    if (role === 'association') {
      return isAssociationValidated(profile)
    }

    return [
      'citoyen',
      'benevole',
      'moderateur',
      'admin',
    ].includes(role)
  }

  // =========================================================
  // MODIFIER UN POINT
  //
  // IMPORTANT :
  // Le bénévole ne peut JAMAIS modifier un point.
  // Le citoyen non plus.
  // =========================================================

  if (permission === 'edit_point') {
    if (role === 'association') {
      return isAssociationValidated(profile)
    }

    return ['moderateur', 'admin'].includes(role)
  }

  // =========================================================
  // ASSOCIATIONS
  // =========================================================

  if (permission === 'view_associations') {
    return (
      role === 'benevole' &&
      !isVolunteerValidated(profile)
    )
  }

  // =========================================================
  // CARTE
  // =========================================================

  if (permission === 'view_map') {
    if (role === 'benevole') {
      return isVolunteerValidated(profile)
    }

    if (role === 'association') {
      return isAssociationValidated(profile)
    }

    return ['moderateur', 'admin'].includes(role)
  }

  // =========================================================
  // CONSULTATION DES POINTS
  //
  // Le bénévole validé peut consulter un point,
  // notamment depuis la carte.
  //
  // Mais il ne peut PAS le modifier grâce à edit_point.
  // =========================================================

  if (permission === 'view_points') {
    if (role === 'benevole') {
      return isVolunteerValidated(profile)
    }

    if (role === 'association') {
      return isAssociationValidated(profile)
    }

    return ['moderateur', 'admin'].includes(role)
  }

  // =========================================================
  // PLANNING
  // =========================================================

  if (permission === 'planning') {
    if (role === 'benevole') {
      return isVolunteerValidated(profile)
    }

    if (role === 'association') {
      return isAssociationValidated(profile)
    }

    return ['moderateur', 'admin'].includes(role)
  }

  // =========================================================
  // INTERVENTIONS
  //
  // Le bénévole consulte le planning mais ne crée/modifie
  // pas les interventions.
  // =========================================================

  if (permission === 'manage_interventions') {
    if (role === 'association') {
      return isAssociationValidated(profile)
    }

    return ['moderateur', 'admin'].includes(role)
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  if (permission === 'dashboard') {
    if (role === 'association') {
      return isAssociationValidated(profile)
    }

    return ['moderateur', 'admin'].includes(role)
  }

  // =========================================================
  // DEMANDES BÉNÉVOLES / ÉQUIPE
  // =========================================================

  if (permission === 'manage_association_requests') {
    return isAssociationValidated(profile)
  }

  // =========================================================
  // MODÉRATION
  // =========================================================

  if (permission === 'moderation') {
    return ['moderateur', 'admin'].includes(role)
  }

  // =========================================================
  // ADMINISTRATION
  // =========================================================

  if (permission === 'administration') {
    return role === 'admin'
  }

  return false
}

export function getDefaultPathForProfile(
  profile: CurrentProfile | null | undefined
) {
  if (!profile?.role) {
    return '/login'
  }

  if (profile.role === 'admin') {
    return '/dashboard'
  }

  if (profile.role === 'moderateur') {
    return '/dashboard'
  }

  if (profile.role === 'association') {
    if (isAssociationValidated(profile)) {
      return '/dashboard'
    }

    return '/profile'
  }

  if (profile.role === 'benevole') {
    if (isVolunteerValidated(profile)) {
      return '/carte'
    }

    return '/associations'
  }

  if (profile.role === 'citoyen') {
    return '/points/new'
  }

  return '/profile'
}