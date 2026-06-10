export type UserRole =
  | 'citoyen'
  | 'benevole'
  | 'association'
  | 'moderateur'
  | 'admin'

export type PublicRegisterRole = Exclude<UserRole, 'admin' | 'moderateur'>

export const publicRegisterRoles: Array<{
  label: string
  value: PublicRegisterRole
}> = [
  {
    label: 'Citoyen',
    value: 'citoyen',
  },
  {
    label: 'Bénévole',
    value: 'benevole',
  },
  {
    label: 'Association',
    value: 'association',
  },
]

export const adminManageableRoles: Array<{
  label: string
  value: UserRole
}> = [
  {
    label: 'Citoyen',
    value: 'citoyen',
  },
  {
    label: 'Bénévole',
    value: 'benevole',
  },
  {
    label: 'Association',
    value: 'association',
  },
  {
    label: 'Modérateur',
    value: 'moderateur',
  },
  {
    label: 'Administrateur',
    value: 'admin',
  },
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