import { supabase } from '@/lib/supabase'

export type Intervention = {
  id: string
  point_id: string | null
  association_id: string | null
  association_nom: string | null
  cree_par: string | null
  date_intervention: string | null
  heure_debut: string | null
  heure_fin: string | null
  type_aide: string | null
  nombre_repas: number | null
  nombre_benevoles: number | null
  commentaire: string | null
  statut: 'prevue' | 'en_cours' | 'terminee' | 'annulee' | null
  created_at: string | null
  updated_at: string | null
  created_by: string
  assigned_to: string | null
  is_sensitive: boolean
  points?: {
    adresse: string | null
  } | null
  associations?: {
    nom: string | null
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
    throw error
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

  if (!associationId) {
    throw new Error(
      "Ton compte n'est rattaché à aucune association. Impossible de déclarer une intervention."
    )
  }

  const payload = {
    point_id: input.pointId,
    association_id: associationId,
    cree_par: session.user.id,
    created_by: session.user.id,
    date_intervention: input.dateIntervention,
    heure_debut: input.heureDebut,
    heure_fin: input.heureFin,
    type_aide: input.typeAide,
    nombre_repas: Number(input.nombreRepas) || 0,
    nombre_benevoles: Number(input.nombreBenevoles) || 0,
    commentaire: input.commentaire?.trim() || null,

    // Valeurs acceptées par ta contrainte SQL :
    // prevue | en_cours | terminee | annulee
    statut: 'prevue',
  }

  const { data, error } = await supabase
    .from('interventions')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Erreur création intervention :', error)
    throw new Error(error.message)
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
      ),
      associations (
        nom
      )
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((item: any) => ({
    ...item,
    association_nom: item.associations?.nom ?? null,
  }))
}
