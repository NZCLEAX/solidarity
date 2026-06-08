import { supabase } from '@/lib/supabase'

export type Intervention = {
  id: string
  point_id: string | null
  association_id: string | null
  cree_par: string | null
  date_intervention: string | null
  heure_debut: string | null
  heure_fin: string | null
  type_aide: string | null
  nombre_repas: number | null
  nombre_benevoles: number | null
  commentaire: string | null
  statut: string | null
  created_at: string | null
  updated_at: string | null
  created_by: string
  assigned_to: string | null
  is_sensitive: boolean
  points?: {
    adresse: string | null
  } | null
}

export type CreateInterventionInput = {
  pointId: string
  dateIntervention: string
  heureDebut: string
  heureFin: string
  typeAide: string
  nombreRepas: number
  nombreBenevoles: number
  commentaire?: string
}

async function getCurrentProfileAssociationId(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('association_id')
    .eq('id', userId)
    .single()

  if (error) {
    return null
  }

  return data?.association_id ?? null
}

export async function createIntervention(input: CreateInterventionInput) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error(
      'Session expirée ou utilisateur non connecté. Reconnecte-toi avant de déclarer une intervention.'
    )
  }

  const associationId = await getCurrentProfileAssociationId(session.user.id)

  const { data, error } = await supabase
    .from('interventions')
    .insert({
      point_id: input.pointId,
      association_id: associationId,
      cree_par: session.user.id,
      created_by: session.user.id,
      date_intervention: input.dateIntervention,
      heure_debut: input.heureDebut,
      heure_fin: input.heureFin,
      type_aide: input.typeAide,
      nombre_repas: input.nombreRepas,
      nombre_benevoles: input.nombreBenevoles,
      commentaire: input.commentaire?.trim() || null,
      statut: null,    
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getInterventions(): Promise<Intervention[]> {
  const { data, error } = await supabase
    .from('interventions')
    .select(
      `
      *,
      points (
        adresse
      )
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}