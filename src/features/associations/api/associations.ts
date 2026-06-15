import { supabase } from '@/lib/supabase'

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

export type CreateAssociationRequestInput = {
  nom: string
  email: string
  password: string
  telephone: string
  ville: string
  zoneAction: string
  typeAidePrincipale: string
  description: string
}

export type VolunteerAction = 'actif' | 'suspendu' | 'en_attente' | 'retirer'

export async function getValidatedAssociations(): Promise<Association[]> {
  const { data, error } = await supabase.rpc('get_validated_associations')

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createAssociationRequest(
  input: CreateAssociationRequestInput
) {
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        nom: input.nom.trim(),
        name: input.nom.trim(),
        role: 'association',
      },
    },
  })

  if (signUpError) {
    throw signUpError
  }

  if (!authData.user) {
    throw new Error('Utilisateur introuvable après inscription.')
  }

  const { data, error } = await supabase.rpc('create_association_request', {
    p_description: input.description.trim(),
    p_email: input.email.trim(),
    p_nom: input.nom.trim(),
    p_telephone: input.telephone.trim(),
    p_type_aide_principale: input.typeAidePrincipale.trim(),
    p_ville: input.ville.trim(),
    p_zone_action: input.zoneAction.trim(),
  })

  if (error) {
    throw error
  }

  return data as string
}

export async function requestJoinAssociation(
  associationId: string,
  message: string
) {
  const { data, error } = await supabase.rpc('request_join_association', {
    p_association_id: associationId,
    p_message: message,
  })

  if (error) {
    throw error
  }

  return data as string
}

export async function getMyJoinRequests(): Promise<MyJoinRequest[]> {
  const { data, error } = await supabase.rpc('get_my_join_requests')

  if (error) {
    throw error
  }

  return data ?? []
}

export async function getAssociationJoinRequests(): Promise<
  AssociationJoinRequest[]
> {
  const { data, error } = await supabase.rpc('get_association_join_requests')

  if (error) {
    throw error
  }

  return data ?? []
}

export async function respondJoinRequest(
  requestId: string,
  decision: 'acceptee' | 'refusee'
) {
  const { error } = await supabase.rpc('respond_join_request', {
    p_request_id: requestId,
    p_decision: decision,
  })

  if (error) {
    throw error
  }
}

export async function getAssociationVolunteers(): Promise<
  AssociationVolunteer[]
> {
  const { data, error } = await supabase.rpc('get_association_volunteers')

  if (error) {
    throw error
  }

  return data ?? []
}

export async function updateAssociationVolunteerStatus(
  volunteerId: string,
  action: VolunteerAction
) {
  const { error } = await supabase.rpc(
    'update_association_volunteer_status',
    {
      p_benevole_id: volunteerId,
      p_action: action,
    }
  )

  if (error) {
    throw error
  }
}