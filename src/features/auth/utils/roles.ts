export type UserRole = 'civil' | 'benevole' | 'association' | 'administrateur'

export const publicRegisterRoles: Array<{
  label: string
  value: Exclude<UserRole, 'administrateur'>
}> = [
  {
    label: 'Civil',
    value: 'civil',
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

export function formatRole(role: string | null | undefined) {
  const labels: Record<string, string> = {
    civil: 'Civil',
    benevole: 'Bénévole',
    association: 'Association',
    administrateur: 'Administrateur',
  }

  if (!role) return 'Non renseigné'

  return labels[role] || role
}