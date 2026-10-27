
import type { Intervention } from '../api/interventions'

export function getInterventionEndDate(
  intervention: Intervention
): Date | null {
  const date = intervention.date_intervention

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null
  }

  const time = intervention.heure_fin || '23:59:59'

  const match =
    /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(time.trim())

  if (!match) {
    return null
  }

  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3] ?? 0)

  if (hours > 23 || minutes > 59 || seconds > 59) {
    return null
  }

  const [year, month, day] = date.split('-').map(Number)

  const endDate = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    seconds
  )

  if (
    endDate.getFullYear() !== year ||
    endDate.getMonth() !== month - 1 ||
    endDate.getDate() !== day
  ) {
    return null
  }

  return endDate
}

export function isInterventionExpired(
  intervention: Intervention,
  now: Date = new Date()
): boolean {
  const endDate = getInterventionEndDate(intervention)

  if (!endDate) {
    return false
  }

  return endDate.getTime() < now.getTime()
}

export function isUpcomingIntervention(
  intervention: Intervention,
  now: Date = new Date()
): boolean {
  if (intervention.statut !== 'prevue') {
    return false
  }

  const endDate = getInterventionEndDate(intervention)

  return endDate !== null && endDate.getTime() >= now.getTime()
}
