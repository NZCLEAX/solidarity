import { supabase } from '@/lib/supabase'

export type CreatePointInput = {
  adresse: string
  latitude: number
  longitude: number
  nombrePersonnesEstime: number
  typologie: string
  besoins: string[]
  niveauUrgence: 'basse' | 'moyenne' | 'haute' | 'critique'
  commentaire?: string
}

export type Point = {
  id: string
  adresse: string | null
  latitude: number | null
  longitude: number | null
  nombre_personnes_estime: number | null
  typologie: string | null
  besoins: string | null
  niveau_urgence: string | null
  commentaire: string | null
  statut: string | null
  niveau_fiabilite: string | null
  date_observation: string | null
  actif: boolean | null
  cree_par: string | null
  created_by: string
  created_at: string | null
  updated_at: string | null
}

export async function createPoint(input: CreatePointInput) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error(
      'Session expirée ou utilisateur non connecté. Reconnecte-toi avant de créer un point.'
    )
  }

  const now = new Date().toISOString()
  const adresse = input.adresse.trim()

  const { data: existingPoint, error: duplicateError } = await supabase
    .from('points')
    .select('id')
    .ilike('adresse', adresse)
    .eq('actif', true)
    .limit(1)

  if (duplicateError) {
    throw duplicateError
  }

  if (existingPoint && existingPoint.length > 0) {
    throw new Error(
      'Un point avec cette adresse existe déjà. Vérifie la liste avant d’en créer un nouveau.'
    )
  }

  const { data, error } = await supabase
    .from('points')
    .insert({
      adresse,
      latitude: input.latitude,
      longitude: input.longitude,
      nombre_personnes_estime: input.nombrePersonnesEstime,
      typologie: input.typologie || null,
      besoins: input.besoins.join(', '),
      niveau_urgence: input.niveauUrgence,
      commentaire: input.commentaire?.trim() || null,

      statut: 'signale',
      niveau_fiabilite: 'non_verifie',
      actif: true,

      cree_par: session.user.id,
      created_by: session.user.id,
      date_observation: now,
      date_derniere_maj: now,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getPoints(): Promise<Point[]> {
  const { data, error } = await supabase
    .from('points')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}