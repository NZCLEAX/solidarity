import { supabase } from '@/lib/supabase'
import {
  createInterventionInputSchema,
  formatZodError,
} from '@/features/security/model/schemas'
import { logSecurityEvent } from '@/features/security/api/security'
import { getCurrentUser } from '@/features/auth/api/auth'

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
  association_nom: string | null
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

  if (error) return null

  return data?.association_id ?? null
}

export async function createIntervention(input: CreateInterventionInput) {
  const parsedInput = createInterventionInputSchema.safeParse(input)

  if (!parsedInput.success) {
    throw new Error(formatZodError(parsedInput.error))
  }

  const user = await getCurrentUser()

  if (!user) {
    throw new Error(
      'Session expirée ou utilisateur non connecté. Reconnecte-toi avant de déclarer une intervention.'
    )
  }

  const associationId = await getCurrentProfileAssociationId(user.id)
  const {
    pointId,
    dateIntervention,
    heureDebut,
    heureFin,
    typeAide,
    nombreRepas,
    nombreBenevoles,
    commentaire,
  } = parsedInput.data

  const { data, error } = await supabase
    .from('interventions')
    .insert({
      point_id: pointId,
      association_id: associationId,
      cree_par: user.id,
      created_by: user.id,
      date_intervention: dateIntervention,
      heure_debut: heureDebut,
      heure_fin: heureFin,
      type_aide: typeAide,
      nombre_repas: typeAide.toLowerCase().includes('repas')
        ? nombreRepas
        : 0,
      nombre_benevoles: nombreBenevoles,
      commentaire: commentaire?.trim() || null,
      statut: 'planifiee',
    })
    .select()
    .single()

  if (error) throw error

  await logSecurityEvent({
    action: 'intervention.created',
    resourceType: 'intervention',
    resourceId: data.id,
    severity: 'info',
    details: {
      pointId,
      dateIntervention,
      nombreBenevoles,
    },
  })

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

  if (error) throw error

  return (data ?? []).map((item: any) => ({
    ...item,
    association_nom: item.associations?.nom ?? null,
  }))
}
