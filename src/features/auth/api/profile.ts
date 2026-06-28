import { supabase } from '@/lib/supabase'
import { getCurrentUser } from './auth'
import { normalizeRole, type UserRole } from '@/features/auth/utils/roles'

function asString(value: unknown) {
  return typeof value === 'string' ? value : null
}

export type CurrentProfile = {
  id: string
  email: string | null
  nom: string | null
  role: UserRole | null
  association_id: string | null
  statut_compte: string | null
  created_at: string | null
  updated_at: string | null
}

export async function getCurrentProfile(): Promise<CurrentProfile> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Utilisateur non connecté.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      email,
      nom,
      role,
      association_id,
      statut_compte,
      created_at,
      updated_at
    `
    )
    .eq('id', user.id)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(1)

  if (error) {
    throw error
  }

  const profile = data?.[0]

  if (!profile) {
    const metadataRole = asString(user.user_metadata?.role)
    const role: UserRole =
      normalizeRole(metadataRole) ?? 'citoyen'

    return {
      id: user.id,
      email: user.email ?? null,
      nom: asString(user.user_metadata?.nom) ?? asString(user.user_metadata?.name),
      role,
      association_id: null,
      statut_compte: role === 'association' ? 'en_attente' : 'actif',
      created_at: null,
      updated_at: null,
    }
  }

  return {
    ...(profile as CurrentProfile),
    role: normalizeRole(profile.role) ?? 'citoyen',
  }
}
