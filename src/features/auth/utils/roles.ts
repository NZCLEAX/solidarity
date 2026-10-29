export type UserRole =
  | 'citoyen'
  | 'benevole'
  | 'association'
  | 'moderateur'
  | 'admin'

export type PublicRegisterRole = Exclude<
  UserRole,
  'association' | 'admin' | 'moderateur'
>

// Rôle choisi à l'inscription, appliqué au retour d'Apple / Google.
export const PENDING_ROLE_STORAGE_KEY = 'pulse-pending-role'

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
  }

  if (!role) return 'Non renseigné'

  return labels[role] || role
}