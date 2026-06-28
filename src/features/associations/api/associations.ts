import { supabase } from '@/lib/supabase'
import type { OfficialAssociationData } from './officialVerification'
import { getCurrentUser, signUp } from '@/features/auth/api/auth'

export type AssociationDocumentType =
  | 'statuts'
  | 'recepisse'
  | 'pv_bureau'
  | 'attestation'
  | 'assurance'
  | 'autre'

export type Association = {
  id: string
  nom: string | null
  description: string | null
  email: string | null
  telephone: string | null
  ville: string | null
  zone_action: string | null
  type_aide_principale: string | null
  statut: string | null
  created_at: string | null
  updated_at: string | null
  owner_user_id: string | null
  siren: string | null
  siret: string | null
  verification_status: string | null
  verification_score: number | null
}

export type CreateAssociationRequestInput = {
  nom: string
  email: string
  password: string
  telephone: string
  ville: string
  zoneAction: string
  typeAidePrincipale: string
  description: string
  siren: string
  siret: string
  representantNom: string
  representantFonction: string
  officialData: OfficialAssociationData | null
}

export type AssociationDocumentUpload = {
  type: AssociationDocumentType
  file: File
}

export type MyJoinRequest = {
  id: string
  association_id: string
  association_nom: string | null
  association_ville: string | null
  association_zone_action: string | null
  association_description: string | null
  message: string | null
  statut: string
  created_at: string
  updated_at: string
}

export type AssociationJoinRequest = {
  id: string
  association_id: string
  association_nom: string | null
  benevole_id: string
  benevole_nom: string | null
  benevole_email: string | null
  message: string | null
  statut: string
  created_at: string
  updated_at: string
}

export type AssociationVolunteer = {
  id: string
  nom: string | null
  email: string | null
  role: string | null
  association_id: string | null
  statut_compte: string | null
  created_at: string | null
  updated_at: string | null
}

export type VolunteerAction = 'actif' | 'suspendu' | 'en_attente' | 'retirer'

function safeFileName(fileName: string) {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .toLowerCase()
}

export async function getValidatedAssociations(): Promise<Association[]> {
  const { data, error } = await supabase
    .from('associations')
    .select('*')
    .eq('statut', 'validee')
    .order('created_at', { ascending: false })

  if (error) throw error

  return data ?? []
}

export async function createAssociationRequest(
  input: CreateAssociationRequestInput
) {
  const email = input.email.trim()
  const password = input.password

  await signUp(email, password, input.nom.trim(), 'association')

  const { data, error } = await supabase.rpc('upsert_association_dossier', {
    p_nom: input.nom?.trim() ?? '',
    p_email: email,
    p_telephone: input.telephone?.trim() ?? '',
    p_ville: input.ville?.trim() ?? '',
    p_zone_action: input.zoneAction?.trim() ?? '',
    p_type_aide_principale: input.typeAidePrincipale?.trim() ?? '',
    p_description: input.description?.trim() ?? '',
    p_siren: input.siren?.trim() ?? '',
    p_siret: input.siret?.trim() ?? '',
    p_representant_nom: input.representantNom?.trim() ?? '',
    p_representant_fonction: input.representantFonction?.trim() ?? '',
    p_official_name: input.officialData?.officialName ?? '',
    p_official_city: input.officialData?.officialCity ?? '',
    p_official_siren: input.officialData?.officialSiren ?? '',
    p_official_siret: input.officialData?.officialSiret ?? '',
  })

  if (error) throw error

  return data as string
}

export async function uploadAssociationDocuments(
  associationId: string,
  documents: AssociationDocumentUpload[]
) {
  if (!associationId) {
    throw new Error("Association introuvable pour l'envoi des documents.")
  }

  if (documents.length === 0) {
    throw new Error('Aucun document sélectionné.')
  }

  for (const document of documents) {
    const file = document.file

    const path = `${associationId}/${document.type}-${Date.now()}-${safeFileName(
      file.name
    )}`

    const { error: uploadError } = await supabase.storage
      .from('association-documents')
      .upload(path, file, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Erreur upload Storage : ${uploadError.message}`)
    }

    const { error: insertError } = await supabase
      .from('association_documents')
      .insert({
        association_id: associationId,
        type_document: document.type,
        file_path: path,
        file_name: file.name,
        mime_type: file.type || 'application/pdf',
        file_size: file.size,
        verification_status: 'envoye',
        verification_score: 10,
      })

    if (insertError) {
      throw new Error(`Erreur enregistrement document : ${insertError.message}`)
    }
  }

  await updateAssociationVerificationScore(associationId)
}

export async function updateAssociationVerificationScore(associationId: string) {
  const { data: association, error: associationError } = await supabase
    .from('associations')
    .select('*')
    .eq('id', associationId)
    .single()

  if (associationError) throw associationError

  const { data: documents, error: documentsError } = await supabase
    .from('association_documents')
    .select('*')
    .eq('association_id', associationId)

  if (documentsError) throw documentsError

  let score = 0
  const notes: string[] = []

  if (association.siren || association.siret ) {
    score += 25
    notes.push('Identifiant administratif renseigné.')
  } else {
    notes.push('Aucun SIREN, SIRET.')
  }

  if (association.official_name) {
    score += 20
    notes.push('Données officielles récupérées.')
  } else {
    notes.push('Données officielles non vérifiées.')
  }

  if (association.official_city) {
    score += 10
    notes.push('Ville officielle récupérée.')
  }

  const hasStatuts = documents?.some((doc) => doc.type_document === 'statuts')
  const hasRecepisse = documents?.some((doc) => doc.type_document === 'recepisse')
  const hasPv = documents?.some((doc) => doc.type_document === 'pv_bureau')
  const hasAttestation = documents?.some(
    (doc) => doc.type_document === 'attestation'
  )

  if (hasStatuts) {
    score += 20
    notes.push('Statuts envoyés.')
  } else {
    notes.push('Statuts manquants.')
  }

  if (hasRecepisse) {
    score += 15
    notes.push('Récépissé envoyé.')
  } else {
    notes.push('Récépissé manquant.')
  }

  if (hasPv) {
    score += 10
    notes.push('PV du bureau envoyé.')
  } else {
    notes.push('PV du bureau manquant.')
  }

  if (hasAttestation) {
    score += 10
    notes.push('Attestation envoyée.')
  }

  const finalScore = Math.min(score, 100)

  let status = 'en_attente_documents'

  if (finalScore >= 80) {
    status = 'pre_verifiee'
  } else if (finalScore >= 50) {
    status = 'verification_manuelle'
  }

  const { error } = await supabase
    .from('associations')
    .update({
      verification_score: finalScore,
      verification_status: status,
      verification_notes: notes.join(' '),
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', associationId)

  if (error) throw error
}

export async function requestJoinAssociation(
  associationId: string,
  message: string
) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Utilisateur non connecté.')
  }

  const { data, error } = await supabase
    .from('association_join_requests')
    .insert({
      association_id: associationId,
      benevole_id: user.id,
      message,
      statut: 'en_attente',
    })
    .select('id')
    .single()

  if (error) throw error

  return data.id as string
}

export async function getMyJoinRequests(): Promise<MyJoinRequest[]> {
  const user = await getCurrentUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('association_join_requests')
    .select(
      `
      id,
      association_id,
      message,
      statut,
      created_at,
      updated_at,
      associations (
        nom,
        ville,
        zone_action,
        description
      )
    `
    )
    .eq('benevole_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((item: any) => ({
    id: item.id,
    association_id: item.association_id,
    association_nom: item.associations?.nom ?? null,
    association_ville: item.associations?.ville ?? null,
    association_zone_action: item.associations?.zone_action ?? null,
    association_description: item.associations?.description ?? null,
    message: item.message,
    statut: item.statut,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }))
}

export async function getAssociationJoinRequests(): Promise<
  AssociationJoinRequest[]
> {
  const user = await getCurrentUser()

  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('association_id')
    .eq('id', user.id)
    .single()

  if (!profile?.association_id) return []

  const { data, error } = await supabase
    .from('association_join_requests')
    .select(
      `
      id,
      association_id,
      benevole_id,
      message,
      statut,
      created_at,
      updated_at,
      associations (
        nom
      ),
      profiles (
        nom,
        email
      )
    `
    )
    .eq('association_id', profile.association_id)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((item: any) => ({
    id: item.id,
    association_id: item.association_id,
    association_nom: item.associations?.nom ?? null,
    benevole_id: item.benevole_id,
    benevole_nom: item.profiles?.nom ?? null,
    benevole_email: item.profiles?.email ?? null,
    message: item.message,
    statut: item.statut,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }))
}

export async function respondJoinRequest(
  requestId: string,
  decision: 'acceptee' | 'refusee'
) {
  const { data: request, error: requestError } = await supabase
    .from('association_join_requests')
    .select('id, association_id, benevole_id')
    .eq('id', requestId)
    .single()

  if (requestError) throw requestError

  const { error: updateRequestError } = await supabase
    .from('association_join_requests')
    .update({
      statut: decision,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (updateRequestError) throw updateRequestError

  if (decision === 'acceptee') {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        association_id: request.association_id,
        statut_compte: 'actif',
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.benevole_id)

    if (profileError) throw profileError
  }
}

export async function getAssociationVolunteers(): Promise<
  AssociationVolunteer[]
> {
  const user = await getCurrentUser()

  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('association_id')
    .eq('id', user.id)
    .single()

  if (!profile?.association_id) return []

  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      nom,
      email,
      role,
      association_id,
      statut_compte,
      created_at,
      updated_at
    `
    )
    .eq('role', 'benevole')
    .eq('association_id', profile.association_id)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data ?? []
}

export async function updateAssociationVolunteerStatus(
  volunteerId: string,
  action: VolunteerAction
) {
  if (action === 'retirer') {
    const { error } = await supabase
      .from('profiles')
      .update({
        association_id: null,
        statut_compte: 'en_attente',
        updated_at: new Date().toISOString(),
      })
      .eq('id', volunteerId)

    if (error) throw error

    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      statut_compte: action,
      updated_at: new Date().toISOString(),
    })
    .eq('id', volunteerId)

  if (error) throw error
}
