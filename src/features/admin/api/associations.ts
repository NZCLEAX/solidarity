import { supabase } from '@/lib/supabase'

export type AssociationStatus = 'en_attente' | 'active' | 'suspendue' | 'archivee'

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
}

export type AssociationInput = {
  nom: string
  description: string
  email: string
  telephone: string
  ville: string
  zoneAction: string
  typeAidePrincipale: string
  statut: AssociationStatus
}

export async function getAssociations(): Promise<Association[]> {
  const { data, error } = await supabase
    .from('associations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createAssociation(input: AssociationInput) {
  const { data, error } = await supabase
    .from('associations')
    .insert({
      nom: input.nom.trim(),
      description: input.description.trim() || null,
      email: input.email.trim() || null,
      telephone: input.telephone.trim() || null,
      ville: input.ville.trim() || null,
      zone_action: input.zoneAction.trim() || null,
      type_aide_principale: input.typeAidePrincipale.trim() || null,
      statut: input.statut,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateAssociation(
  associationId: string,
  input: AssociationInput
) {
  const { data, error } = await supabase
    .from('associations')
    .update({
      nom: input.nom.trim(),
      description: input.description.trim() || null,
      email: input.email.trim() || null,
      telephone: input.telephone.trim() || null,
      ville: input.ville.trim() || null,
      zone_action: input.zoneAction.trim() || null,
      type_aide_principale: input.typeAidePrincipale.trim() || null,
      statut: input.statut,
      updated_at: new Date().toISOString(),
    })
    .eq('id', associationId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}