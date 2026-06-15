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

export async function getCurrentProfile(): Promise<CurrentProfile> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error('Utilisateur non connecté.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      nom,
      role,
      association_id,
      statut_compte,
      created_at,
      updated_at
    `)
    .eq('id', session.user.id)
    .single()

  if (error) {
    throw error
  }

  return data as CurrentProfile
}