import { supabase } from '@/lib/supabase'
import {
  createPointInputSchema,
  updatePointInputSchema,
  formatZodError,
} from '@/features/security/model/schemas'
import { logSecurityEvent } from '@/features/security/api/security'

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

export type UpdatePointInput = CreatePointInput & {
  statut:
    | 'signale'
    | 'a_confirmer'
    | 'confirme'
    | 'actif'
    | 'inactif'
    | 'archive'
    | 'rejete'
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
  date_derniere_maj: string | null
}

export type MergeDuplicatePointsInput = {
  mainPointId: string
  duplicatePointId: string
}

export async function createPoint(input: CreatePointInput) {
  const parsedInput = createPointInputSchema.safeParse(input)

  if (!parsedInput.success) {
    throw new Error(formatZodError(parsedInput.error))
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error(
      'Session expirée ou utilisateur non connecté. Reconnecte-toi avant de créer un point.'
    )
  }

  const now = new Date().toISOString()
  const { adresse, latitude, longitude, nombrePersonnesEstime, typologie, besoins, niveauUrgence, commentaire } =
    parsedInput.data

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
      latitude,
      longitude,
      nombre_personnes_estime: nombrePersonnesEstime,
      typologie: typologie || null,
      besoins: besoins.join(', '),
      niveau_urgence: niveauUrgence,
      commentaire: commentaire?.trim() || null,
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

  await logSecurityEvent({
    action: 'point.created',
    resourceType: 'point',
    resourceId: data.id,
    severity: 'info',
    details: {
      niveauUrgence,
      nombrePersonnesEstime,
    },
  })

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

export async function getPointById(pointId: string): Promise<Point> {
  const { data, error } = await supabase
    .from('points')
    .select('*')
    .eq('id', pointId)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updatePoint(pointId: string, input: UpdatePointInput) {
  const parsedInput = updatePointInputSchema.safeParse(input)

  if (!parsedInput.success) {
    throw new Error(formatZodError(parsedInput.error))
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error(
      'Session expirée ou utilisateur non connecté. Reconnecte-toi avant de modifier un point.'
    )
  }

  const {
    adresse,
    latitude,
    longitude,
    nombrePersonnesEstime,
    typologie,
    besoins,
    niveauUrgence,
    commentaire,
    statut,
  } = parsedInput.data

  const { data: duplicatePoints, error: duplicateError } = await supabase
    .from('points')
    .select('id')
    .ilike('adresse', adresse)
    .eq('actif', true)
    .neq('id', pointId)
    .limit(1)

  if (duplicateError) {
    throw duplicateError
  }

  if (duplicatePoints && duplicatePoints.length > 0) {
    throw new Error('Un autre point actif utilise déjà cette adresse.')
  }

  const { data, error } = await supabase
    .from('points')
    .update({
      adresse,
      latitude,
      longitude,
      nombre_personnes_estime: nombrePersonnesEstime,
      typologie: typologie || null,
      besoins: besoins.join(', '),
      niveau_urgence: niveauUrgence,
      commentaire: commentaire?.trim() || null,
      statut,
      actif: statut !== 'archive' && statut !== 'inactif',
      date_derniere_maj: new Date().toISOString(),
    })
    .eq('id', pointId)
    .select()
    .single()

  if (error) {
    throw error
  }

  await logSecurityEvent({
    action: 'point.updated',
    resourceType: 'point',
    resourceId: data.id,
    severity: 'warning',
    details: {
      statut,
      niveauUrgence,
    },
  })

  return data
}

export async function confirmPoint(pointId: string) {
  const { data, error } = await supabase
    .from('points')
    .update({
      statut: 'confirme',
      niveau_fiabilite: 'verifie_terrain',
      actif: true,
      date_derniere_maj: new Date().toISOString(),
    })
    .eq('id', pointId)
    .select()
    .single()

  if (error) {
    throw error
  }

  await logSecurityEvent({
    action: 'point.confirmed',
    resourceType: 'point',
    resourceId: data.id,
    severity: 'warning',
  })

  return data
}

export async function rejectPoint(pointId: string) {
  const { data, error } = await supabase
    .from('points')
    .update({
      statut: 'rejete',
      actif: false,
      date_derniere_maj: new Date().toISOString(),
    })
    .eq('id', pointId)
    .select()
    .single()

  if (error) {
    throw error
  }

  await logSecurityEvent({
    action: 'point.rejected',
    resourceType: 'point',
    resourceId: data.id,
    severity: 'warning',
  })

  return data
}

export async function deactivateStalePoints() {
  const limitDate = new Date()
  limitDate.setDate(limitDate.getDate() - 30)

  const limitDateIso = limitDate.toISOString()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('points')
    .update({
      statut: 'inactif',
      actif: false,
      date_derniere_maj: now,
    })
    .eq('actif', true)
    .lt('date_derniere_maj', limitDateIso)
    .select()

  if (error) {
    throw error
  }

  return data ?? []
}

function splitBesoins(value: string | null) {
  if (!value) return []

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function mergeBesoins(
  mainBesoins: string | null,
  duplicateBesoins: string | null
) {
  const merged = Array.from(
    new Set([...splitBesoins(mainBesoins), ...splitBesoins(duplicateBesoins)])
  )

  return merged.length > 0 ? merged.join(', ') : null
}

function getHighestUrgence(urgenceA: string | null, urgenceB: string | null) {
  const priority: Record<string, number> = {
    basse: 1,
    moyenne: 2,
    haute: 3,
    critique: 4,
  }

  if (!urgenceA) return urgenceB
  if (!urgenceB) return urgenceA

  return priority[urgenceB] > priority[urgenceA] ? urgenceB : urgenceA
}

function mergeCommentaires(
  mainCommentaire: string | null,
  duplicateCommentaire: string | null
) {
  const commentaires = [
    mainCommentaire?.trim(),
    duplicateCommentaire?.trim(),
  ].filter(Boolean)

  if (commentaires.length === 0) return null

  return commentaires.join('\n\n--- Commentaire du point fusionné ---\n')
}

export async function markDuplicatePoint(pointId: string) {
  const { data, error } = await supabase
    .from('points')
    .update({
      statut: 'archive',
      actif: false,
      date_derniere_maj: new Date().toISOString(),
    })
    .eq('id', pointId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function mergeDuplicatePoints({
  mainPointId,
  duplicatePointId,
}: MergeDuplicatePointsInput) {
  if (mainPointId === duplicatePointId) {
    throw new Error('Impossible de fusionner un point avec lui-même.')
  }

  const [mainPoint, duplicatePoint] = await Promise.all([
    getPointById(mainPointId),
    getPointById(duplicatePointId),
  ])

  const now = new Date().toISOString()

  const { data: updatedMainPoint, error: updateMainError } = await supabase
    .from('points')
    .update({
      adresse: mainPoint.adresse || duplicatePoint.adresse,
      latitude: mainPoint.latitude ?? duplicatePoint.latitude,
      longitude: mainPoint.longitude ?? duplicatePoint.longitude,
      nombre_personnes_estime:
        mainPoint.nombre_personnes_estime ??
        duplicatePoint.nombre_personnes_estime,
      typologie: mainPoint.typologie || duplicatePoint.typologie,
      besoins: mergeBesoins(mainPoint.besoins, duplicatePoint.besoins),
      niveau_urgence: getHighestUrgence(
        mainPoint.niveau_urgence,
        duplicatePoint.niveau_urgence
      ),
      commentaire: mergeCommentaires(
        mainPoint.commentaire,
        duplicatePoint.commentaire
      ),
      date_derniere_maj: now,
    })
    .eq('id', mainPointId)
    .select()
    .single()

  if (updateMainError) {
    throw updateMainError
  }

  const { data: archivedDuplicatePoint, error: archiveDuplicateError } =
    await supabase
      .from('points')
      .update({
        statut: 'archive',
        actif: false,
        commentaire: `${
          duplicatePoint.commentaire?.trim()
            ? `${duplicatePoint.commentaire.trim()}\n\n`
            : ''
        }Point fusionné avec le point ${mainPointId}.`,
        date_derniere_maj: now,
      })
      .eq('id', duplicatePointId)
      .select()
      .single()

  if (archiveDuplicateError) {
    throw archiveDuplicateError
  }

  await logSecurityEvent({
    action: 'point.duplicates_merged',
    resourceType: 'point',
    resourceId: mainPointId,
    severity: 'warning',
    details: {
      duplicatePointId,
    },
  })

  return {
    mainPoint: updatedMainPoint,
    duplicatePoint: archivedDuplicatePoint,
  }
}
