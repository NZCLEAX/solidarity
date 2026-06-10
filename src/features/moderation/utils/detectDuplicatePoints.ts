import type { Point } from '@/features/points/api/points'

export type DuplicateReason =
  | 'Adresse identique'
  | 'Adresse similaire'
  | 'Coordonnées proches'

export type DuplicateGroup = {
  id: string
  reason: DuplicateReason
  distanceMeters?: number
  points: Point[]
}

function normalizeText(value: string | null) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasValidCoordinates(point: Point) {
  const latitude = Number(point.latitude)
  const longitude = Number(point.longitude)

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0)
  )
}

function getDistanceMeters(pointA: Point, pointB: Point) {
  const lat1 = Number(pointA.latitude)
  const lon1 = Number(pointA.longitude)
  const lat2 = Number(pointB.latitude)
  const lon2 = Number(pointB.longitude)

  const earthRadius = 6371000
  const toRadians = (degree: number) => (degree * Math.PI) / 180

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadius * c
}

function areAddressesSimilar(addressA: string, addressB: string) {
  if (!addressA || !addressB) return false

  if (addressA === addressB) return true

  return (
    addressA.length >= 6 &&
    addressB.length >= 6 &&
    (addressA.includes(addressB) || addressB.includes(addressA))
  )
}

export function detectDuplicatePoints(points: Point[]): DuplicateGroup[] {
  const activePoints = points.filter((point) => point.actif !== false)
  const groups: DuplicateGroup[] = []
  const seenPairs = new Set<string>()

  for (let i = 0; i < activePoints.length; i += 1) {
    for (let j = i + 1; j < activePoints.length; j += 1) {
      const pointA = activePoints[i]
      const pointB = activePoints[j]

      const pairKey = [pointA.id, pointB.id].sort().join('-')

      if (seenPairs.has(pairKey)) continue

      const addressA = normalizeText(pointA.adresse)
      const addressB = normalizeText(pointB.adresse)

      let reason: DuplicateReason | null = null
      let distanceMeters: number | undefined

      if (addressA && addressB && addressA === addressB) {
        reason = 'Adresse identique'
      } else if (areAddressesSimilar(addressA, addressB)) {
        reason = 'Adresse similaire'
      } else if (hasValidCoordinates(pointA) && hasValidCoordinates(pointB)) {
        const distance = getDistanceMeters(pointA, pointB)

        if (distance <= 200) {
          reason = 'Coordonnées proches'
          distanceMeters = Math.round(distance)
        }
      }

      if (reason) {
        seenPairs.add(pairKey)

        groups.push({
          id: pairKey,
          reason,
          distanceMeters,
          points: [pointA, pointB],
        })
      }
    }
  }

  return groups
}