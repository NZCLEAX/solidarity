import { supabase } from '@/lib/supabase'

export type AdminAssociation = {
  id: string
  nom: string | null
  email: string | null
  statut: string | null
  created_at: string | null
  updated_at: string | null
  owner_user_id: string | null
  description: string | null
  telephone: string | null
  ville: string | null
  zone_action: string | null
  type_aide_principale: string | null
  siren: string | null
  siret: string | null
  representant_nom: string | null
  representant_fonction: string | null
  official_name: string | null
  official_city: string | null
  official_siren: string | null
  official_siret: string | null
  verification_status: string | null
  verification_score: number | null
  verification_notes: string | null
  docs_count: number | null
  source: 'profile' | 'association'
}

export type AssociationDocument = {
  id: string
  association_id: string
  type_document: string
  file_path: string
  file_name: string
  mime_type: string | null
  file_size: number | null
  verification_status: string | null
  verification_score: number | null
  created_at: string | null
  updated_at: string | null
}

export async function getAdminAssociations(): Promise<AdminAssociation[]> {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'association')
    .order('created_at', { ascending: false })

  if (profilesError) throw profilesError

  const { data: associations, error: associationsError } = await supabase
    .from('associations')
    .select('*')

  if (associationsError) throw associationsError

  const { data: documents, error: documentsError } = await supabase
    .from('association_documents')
    .select('association_id')

  if (documentsError) throw documentsError

  return (profiles ?? []).map((profile: any) => {
    const association = (associations ?? []).find(
      (item: any) =>
        item.owner_user_id === profile.id ||
        item.id === profile.association_id
    )

    const associationId = association?.id ?? profile.association_id ?? profile.id

    return {
      id: associationId,
      nom: association?.nom ?? profile.nom ?? 'Association sans nom',
      email: association?.email ?? profile.email ?? null,
      statut: association?.statut ?? profile.statut_compte ?? 'en_attente',
      created_at: association?.created_at ?? profile.created_at ?? null,
      updated_at: association?.updated_at ?? profile.updated_at ?? null,
      owner_user_id: profile.id,
      description: association?.description ?? null,
      telephone: association?.telephone ?? null,
      ville: association?.ville ?? null,
      zone_action: association?.zone_action ?? null,
      type_aide_principale: association?.type_aide_principale ?? null,
      siren: association?.siren ?? null,
      siret: association?.siret ?? null,
      representant_nom: association?.representant_nom ?? null,
      representant_fonction: association?.representant_fonction ?? null,
      official_name: association?.official_name ?? null,
      official_city: association?.official_city ?? null,
      official_siren: association?.official_siren ?? null,
      official_siret: association?.official_siret ?? null,
      verification_status: association
        ? association.verification_status
        : 'profil_sans_dossier',
      verification_score: association?.verification_score ?? 0,
      verification_notes:
        association?.verification_notes ??
        "Compte association présent dans l’authentification/profil.",
      docs_count: association
        ? documents?.filter((doc) => doc.association_id === association.id)
            .length ?? 0
        : 0,
      source: association ? 'association' : 'profile',
    }
  })
}

export async function respondAssociationRequest(
  associationId: string,
  decision: 'validee' | 'refusee' | 'suspendue' | 'en_attente'
) {
  const { data: association } = await supabase
    .from('associations')
    .select('id, owner_user_id')
    .eq('id', associationId)
    .maybeSingle()

  const statutCompte =
    decision === 'validee'
      ? 'actif'
      : decision === 'refusee'
        ? 'refuse'
        : decision === 'suspendue'
          ? 'suspendu'
          : 'en_attente'

  if (association?.owner_user_id) {
    const { error } = await supabase
      .from('profiles')
      .update({
        statut_compte: statutCompte,
        updated_at: new Date().toISOString(),
      })
      .eq('id', association.owner_user_id)

    if (error) throw error
  } else {
    const { error } = await supabase
      .from('profiles')
      .update({
        statut_compte: statutCompte,
        updated_at: new Date().toISOString(),
      })
      .eq('id', associationId)

    if (error) throw error
  }

  if (association) {
    const { error } = await supabase
      .from('associations')
      .update({
        statut: decision,
        updated_at: new Date().toISOString(),
      })
      .eq('id', association.id)

    if (error) throw error
  }
}

export async function getAdminAssociationDocuments(
  associationId: string
): Promise<AssociationDocument[]> {
  const { data, error } = await supabase
    .from('association_documents')
    .select('*')
    .eq('association_id', associationId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data ?? []
}

export async function getSignedAssociationDocumentUrl(filePath: string) {
  const { data, error } = await supabase.storage
    .from('association-documents')
    .createSignedUrl(filePath, 60)

  if (error) throw error

  return data.signedUrl
}

export async function recomputeAssociationVerification(associationId: string) {
  const { data: association } = await supabase
    .from('associations')
    .select('*')
    .eq('id', associationId)
    .maybeSingle()

  if (!association) return

  const { data: documents, error: documentsError } = await supabase
    .from('association_documents')
    .select('*')
    .eq('association_id', association.id)

  if (documentsError) throw documentsError

  let score = 0
  const notes: string[] = []

  if (association.siren || association.siret) score += 25
  else notes.push('SIREN ou SIRET manquant.')

  if (association.official_name) score += 25
  else notes.push('Nom officiel non vérifié.')

  if (association.official_city) score += 20

  const hasStatuts = documents?.some((doc) => doc.type_document === 'statuts')
  const hasRecepisse = documents?.some((doc) => doc.type_document === 'recepisse')
  const hasPv = documents?.some((doc) => doc.type_document === 'pv_bureau')

  if (hasStatuts) score += 20
  else notes.push('Statuts manquants.')

  if (hasRecepisse) score += 20
  else notes.push('Récépissé manquant.')

  if (hasPv) score += 10

  const finalScore = Math.min(score, 100)

  const status =
    finalScore >= 80
      ? 'pre_verifiee'
      : finalScore >= 50
        ? 'verification_manuelle'
        : 'en_attente_documents'

  const { error } = await supabase
    .from('associations')
    .update({
      verification_score: finalScore,
      verification_status: status,
      verification_notes: notes.join(' '),
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', association.id)

  if (error) throw error
}