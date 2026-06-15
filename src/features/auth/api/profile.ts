import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/features/auth/utils/roles'

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

function isValidRole(value: unknown): value is UserRole {
  return (
    value === 'citoyen' ||
    value === 'benevole' ||
    value === 'association' ||
    value === 'moderateur' ||
    value === 'admin'
  )
}

export async function getCurrentProfile(): Promise<CurrentProfile> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    throw sessionError
  }

  if (!session?.user) {
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
    .eq('id', session.user.id)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(1)

  if (error) {
    throw error
  }

  const profile = data?.[0]

  if (!profile) {
    const metadataRole = session.user.user_metadata?.role
    const role: UserRole = isValidRole(metadataRole) ? metadataRole : 'citoyen'

    return {
      id: session.user.id,
      email: session.user.email ?? null,
      nom:
        session.user.user_metadata?.nom ??
        session.user.user_metadata?.name ??
        null,
      role,
      association_id: null,
      statut_compte: role === 'association' ? 'en_attente' : 'actif',
      created_at: null,
      updated_at: null,
    }
  }

  return profile as CurrentProfile
}