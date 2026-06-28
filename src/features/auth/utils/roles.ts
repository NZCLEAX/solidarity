export type UserRole =
  | 'citoyen'
  | 'benevole'
  | 'association'
  | 'moderateur'
  | 'admin'
  | 'administrateur'

export function normalizeRole(role: string | null | undefined): UserRole | null {
  if (!role) return null

  const normalized = role.toLowerCase()

  if (normalized === 'administrateur') return 'admin'
  if (normalized === 'moderator') return 'moderateur'

  if (
    normalized === 'citoyen' ||
    normalized === 'benevole' ||
    normalized === 'association' ||
    normalized === 'moderateur' ||
    normalized === 'admin'
  ) {
    return normalized
  }

  return null
}

export type PublicRegisterRole = Exclude<
  UserRole,
  'association' | 'admin' | 'moderateur' | 'administrateur'
>

export const publicRegisterRoles: Array<{
  label: string
  value: PublicRegisterRole
}> = [
  { label: 'Citoyen', value: 'citoyen' },
  { label: 'Bénévole', value: 'benevole' },
]

export const adminManageableRoles: Array<{
  label: string
  value: UserRole
}> = [
  { label: 'Citoyen', value: 'citoyen' },
  { label: 'Bénévole', value: 'benevole' },
  { label: 'Association', value: 'association' },
  { label: 'Modérateur', value: 'moderateur' },
  { label: 'Administrateur', value: 'admin' },
]

export function formatRole(role: string | null | undefined) {
  const labels: Record<string, string> = {
    citoyen: 'Citoyen',
    benevole: 'Bénévole',
    association: 'Association',
    moderateur: 'Modérateur',
    admin: 'Administrateur',
    administrateur: 'Administrateur',
  }

  if (!role) return 'Non renseigné'

  const normalized = normalizeRole(role) ?? role

  return labels[normalized] || labels[role] || role
}
