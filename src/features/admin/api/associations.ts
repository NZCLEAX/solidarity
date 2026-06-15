import { supabase } from '@/lib/supabase'

export type AdminAssociation = {
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
}

export type UpdateAdminAssociationInput = {
  id: string
  nom: string
  email: string
  telephone: string
  ville: string
  zoneAction: string
  typeAidePrincipale: string
  description: string
  statut: string
}

export async function getAdminAssociations(): Promise<AdminAssociation[]> {
  const { data, error } = await supabase.rpc('get_admin_associations')

  if (error) {
    throw error
  }

  return data ?? []
}

export async function updateAdminAssociation(
  input: UpdateAdminAssociationInput
) {
  const { error } = await supabase.rpc('update_admin_association', {
    p_association_id: input.id,
    p_nom: input.nom,
    p_email: input.email,
    p_telephone: input.telephone,
    p_ville: input.ville,
    p_zone_action: input.zoneAction,
    p_type_aide_principale: input.typeAidePrincipale,
    p_description: input.description,
    p_statut: input.statut,
  })

  if (error) {
    throw error
  }
}

export async function respondAssociationRequest(
  associationId: string,
  decision: 'validee' | 'refusee' | 'suspendue' | 'en_attente'
) {
  const { error } = await supabase.rpc('respond_association_request', {
    p_association_id: associationId,
    p_decision: decision,
  })

  if (error) {
    throw error
  }
}