import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/features/auth/api/auth'

export type UserRole =
  | 'citoyen'
  | 'benevole'
  | 'association'
  | 'moderateur'
  | 'administrateur'

export type AccountStatus = 'actif' | 'inactif' | 'suspendu'

export interface UserProfile {
  id: string
  nom: string | null
  email: string
  role: UserRole
  association_id: string | null
  statut_compte: AccountStatus
  created_at: string
  updated_at: string
}

export async function getCurrentProfile() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, nom, email, role, association_id, statut_compte, created_at, updated_at')
    .eq('id', user.id)
    .single<UserProfile>()

  if (error) {
    throw error
  }

  return data
}
