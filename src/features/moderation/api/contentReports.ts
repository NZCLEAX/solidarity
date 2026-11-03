import { supabase } from '@/lib/supabase'

// =========================================================
// Signalement de contenu et blocage d'utilisateurs
// (exigé par l'App Store, règle 1.2 : contenu généré par les
// utilisateurs). Tables créées par la migration
// supabase/migrations/20261103120000_signalements_et_blocages.sql
// =========================================================

export const REPORT_REASONS = [
  'Contenu inapproprié ou offensant',
  'Informations fausses ou trompeuses',
  'Données personnelles exposées',
  'Spam ou doublon',
  'Autre',
] as const

export type ReportReason = (typeof REPORT_REASONS)[number]

export type ContentReportStatus = 'ouvert' | 'traite' | 'rejete'

export type ContentReport = {
  id: string
  point_id: string
  signale_par: string
  motif: string
  details: string | null
  statut: ContentReportStatus
  created_at: string
  point: {
    id: string
    adresse: string | null
    commentaire: string | null
    statut: string | null
    actif: boolean | null
  } | null
}

// Codes renvoyés quand la table n'existe pas encore
// (script SQL pas encore exécuté dans Supabase).
const MISSING_TABLE_CODES = new Set(['42P01', 'PGRST205'])

export class MissingModerationTablesError extends Error {
  constructor() {
    super(
      'Les tables de signalement ne sont pas encore créées dans Supabase. Exécute le script SQL « signalements_et_blocages ».'
    )
    this.name = 'MissingModerationTablesError'
  }
}

function isMissingTable(error: { code?: string } | null) {
  return Boolean(error?.code && MISSING_TABLE_CODES.has(error.code))
}

export async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.user.id ?? null
}

async function requireUserId() {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error('Session expirée. Reconnecte-toi pour continuer.')
  }

  return userId
}

export async function reportPoint(input: {
  pointId: string
  motif: ReportReason
  details?: string
}) {
  const userId = await requireUserId()

  const { error } = await supabase.from('signalements_contenu').insert({
    point_id: input.pointId,
    signale_par: userId,
    motif: input.motif,
    details: input.details?.trim() || null,
  })

  if (isMissingTable(error)) throw new MissingModerationTablesError()
  if (error) throw error
}

export async function blockUser(blockedUserId: string) {
  const userId = await requireUserId()

  if (blockedUserId === userId) {
    throw new Error('Tu ne peux pas te bloquer toi-même.')
  }

  const { error } = await supabase.from('utilisateurs_bloques').insert({
    bloqueur_id: userId,
    bloque_id: blockedUserId,
  })

  // 23505 = déjà bloqué : on considère que c'est un succès.
  if (error?.code === '23505') return
  if (isMissingTable(error)) throw new MissingModerationTablesError()
  if (error) throw error
}

// Identifiants des utilisateurs bloqués par l'utilisateur connecté.
// Ne fait jamais échouer l'affichage : en cas de problème (table absente,
// réseau…), on renvoie une liste vide.
export async function getBlockedUserIds(): Promise<Set<string>> {
  const userId = await getCurrentUserId()

  if (!userId) return new Set()

  const { data, error } = await supabase
    .from('utilisateurs_bloques')
    .select('bloque_id')
    .eq('bloqueur_id', userId)

  if (error) {
    if (!isMissingTable(error)) {
      console.warn('Impossible de charger les utilisateurs bloqués :', error)
    }
    return new Set()
  }

  return new Set((data ?? []).map((row) => row.bloque_id as string))
}

// Signalements en attente, pour la page Modération.
export async function getOpenContentReports(): Promise<ContentReport[]> {
  const { data: reports, error } = await supabase
    .from('signalements_contenu')
    .select('id, point_id, signale_par, motif, details, statut, created_at')
    .eq('statut', 'ouvert')
    .order('created_at', { ascending: false })

  if (isMissingTable(error)) throw new MissingModerationTablesError()
  if (error) throw error

  const rows = reports ?? []

  if (rows.length === 0) return []

  const pointIds = [...new Set(rows.map((row) => row.point_id))]

  const { data: points, error: pointsError } = await supabase
    .from('points')
    .select('id, adresse, commentaire, statut, actif')
    .in('id', pointIds)

  if (pointsError) throw pointsError

  const pointsById = new Map(
    (points ?? []).map((point) => [String(point.id), point])
  )

  return rows.map((row) => ({
    ...row,
    point_id: String(row.point_id),
    point: pointsById.get(String(row.point_id)) ?? null,
  })) as ContentReport[]
}

export async function resolveContentReport(
  reportId: string,
  statut: Exclude<ContentReportStatus, 'ouvert'>
) {
  const userId = await requireUserId()

  const { error } = await supabase
    .from('signalements_contenu')
    .update({
      statut,
      traite_par: userId,
      traite_le: new Date().toISOString(),
    })
    .eq('id', reportId)

  if (error) throw error
}
