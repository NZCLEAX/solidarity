import type { Intervention } from '@/features/interventions/api/interventions'

export function includesHelpType(value: string | null | undefined, help: string) {
  return value?.toLowerCase().includes(help.toLowerCase()) ?? false
}

export function getPointInterventions(
  pointId: string,
  interventions: Intervention[]
) {
  return interventions.filter((intervention) => intervention.point_id === pointId)
}

export function getRepasCoverage(
  nombrePersonnes: number | null | undefined,
  interventions: Intervention[]
) {
  const totalBesoin = nombrePersonnes ?? 0

  const repasCouverts = interventions
    .filter((intervention) => includesHelpType(intervention.type_aide, 'repas'))
    .reduce((total, intervention) => total + (intervention.nombre_repas ?? 0), 0)

  return {
    totalBesoin,
    repasCouverts,
    repasRestants: Math.max(totalBesoin - repasCouverts, 0),
    estCouvert: repasCouverts >= totalBesoin && totalBesoin > 0,
  }
}

export function formatInterventionDate(value: string | null | undefined) {
  if (!value) return 'Date non renseignée'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Date non renseignée'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}