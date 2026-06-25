export function formatLabel(value: string | null | undefined): string {
  if (!value) return 'Non renseigné'

  const labels: Record<string, string> = {
    // Statuts de point
    signale: 'Signalé',
    a_confirmer: 'À confirmer',
    confirme: 'Confirmé',
    actif: 'Actif',
    inactif: 'Inactif',
    archive: 'Archivé',
    // Fiabilité de point
    non_verifie: 'Non vérifié',
    verifie_terrain: 'Vérifié terrain',
    multi_verifie: 'Multi-vérifié',
    // Urgence de point
    basse: 'Basse',
    moyenne: 'Moyenne',
    haute: 'Haute',
    critique: 'Critique',
    // Statuts d'intervention
    declaree: 'Déclarée',
    planifiee: 'Planifiée',
    en_cours: 'En cours',
    terminee: 'Terminée',
    annulee: 'Annulée',
  }

  return labels[value] || value
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return 'Non renseignée'
  return new Date(value).toLocaleDateString('fr-FR')
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return '--:--'
  return value.slice(0, 5)
}