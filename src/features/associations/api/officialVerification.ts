export type OfficialAssociationData = {
  officialName: string | null
  officialCity: string | null
  officialSiren: string | null
  officialSiret: string | null
  officialActivity: string | null
  isActive: boolean | null
}

function cleanIdentifier(value: string) {
  return value.replace(/\s/g, '').trim()
}

function getFirstString(...values: unknown[]) {
  const value = values.find(
    (item) => typeof item === 'string' && item.trim().length > 0
  )

  return typeof value === 'string' ? value.trim() : null
}

export async function verifyOfficialAssociation(
  query: string
): Promise<OfficialAssociationData | null> {
  const cleanQuery = cleanIdentifier(query)

  if (cleanQuery.length < 3) {
    throw new Error('Renseigne un SIRET, SIREN nom valide.')
  }

  const url = new URL('https://recherche-entreprises.api.gouv.fr/search')
  url.searchParams.set('q', cleanQuery)
  url.searchParams.set('per_page', '5')

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error('Impossible de vérifier les données officielles.')
  }

  const data = await response.json()

  const results = Array.isArray(data?.results) ? data.results : []
  const result = results[0]

  if (!result) {
    return null
  }

  const siege = result.siege || result.matching_etablissements?.[0] || {}

  const officialName = getFirstString(
    result.nom_complet,
    result.nom_raison_sociale,
    result.denomination,
    result.nom,
    result.enseigne
  )

  const officialCity = getFirstString(
    siege.libelle_commune,
    siege.commune,
    siege.ville,
    result.commune,
    result.ville
  )

  const officialSiren = getFirstString(result.siren)
  const officialSiret = getFirstString(siege.siret, result.siret)
  const officialActivity = getFirstString(
    result.activite_principale,
    result.code_naf,
    result.section_activite_principale
  )

  const etat = getFirstString(result.etat_administratif, siege.etat_administratif)

  return {
    officialName,
    officialCity,
    officialSiren,
    officialSiret,
    officialActivity,
    isActive: etat ? etat === 'A' : null,
  }
}