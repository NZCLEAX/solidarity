export function formatPointLabel(value: string | null | undefined) {
  if (!value) return 'Non renseigné'

  const labels: Record<string, string> = {
    signale: 'Signalé',
    confirme: 'Confirmé',
    rejete: 'Rejeté',
    archive: 'Archivé',
    a_confirmer: 'À confirmer',
    actif: 'Actif',
    inactif: 'Inactif',
    non_verifie: 'Non vérifié',
    verifie_terrain: 'Vérifié terrain',
    basse: 'Basse',
    moyenne: 'Moyenne',
    haute: 'Haute',
    critique: 'Critique',
  }

  return labels[value] || value
}

export function getStatusBadgeClass(status: string | null | undefined) {
  switch (status) {
    case 'confirme':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    case 'signale':
      return 'bg-amber-50 text-amber-700 ring-amber-200'
    case 'rejete':
      return 'bg-red-50 text-red-700 ring-red-200'
    case 'archive':
      return 'bg-slate-100 text-slate-600 ring-slate-200'
    case 'a_confirmer':
      return 'bg-orange-50 text-orange-700 ring-orange-200'
    case 'actif':
      return 'bg-green-50 text-green-700 ring-green-200'
    case 'inactif':
      return 'bg-gray-100 text-gray-600 ring-gray-200'
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-200'
  }
}

export function getUrgencyBadgeClass(urgence: string | null | undefined) {
  switch (urgence) {
    case 'critique':
      return 'bg-red-50 text-red-700 ring-red-200'
    case 'haute':
      return 'bg-orange-50 text-orange-700 ring-orange-200'
    case 'moyenne':
      return 'bg-amber-50 text-amber-700 ring-amber-200'
    case 'basse':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-200'
  }
}

export function getReliabilityBadgeClass(value: string | null | undefined) {
  switch (value) {
    case 'verifie_terrain':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    case 'non_verifie':
      return 'bg-amber-50 text-amber-700 ring-amber-200'
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-200'
  }
}

export function getUrgencyMarkerColor(urgence: string | null | undefined) {
  switch (urgence) {
    case 'critique':
      return '#dc2626'
    case 'haute':
      return '#ea580c'
    case 'moyenne':
      return '#d97706'
    case 'basse':
      return '#059669'
    default:
      return '#64748b'
  }
}