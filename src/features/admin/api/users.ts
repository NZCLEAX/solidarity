import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/features/auth/api/auth'
import type { UserRole } from '@/features/auth/utils/roles'
import { logSecurityEvent } from '@/features/security/api/security'

export type UserStatus = 'actif' | 'suspendu' | 'inactif'

export type AdminUser = {
  id: string
  nom: string | null
  email: string | null
  role: UserRole | null
  association_id: string | null
  statut_compte: UserStatus | null
  created_at: string | null
  updated_at: string | null
}

export async function getCurrentProfile() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Utilisateur non connecté.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    throw error
  }

  return data as AdminUser
}

export async function getUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      nom,
      email,
      role,
      association_id,
      statut_compte,
      created_at,
      updated_at
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function updateUserRole(userId: string, role: UserRole) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  await logSecurityEvent({
    action: 'admin.user.role_updated',
    resourceType: 'profile',
    resourceId: userId,
    severity: 'warning',
    details: { role },
  })

  return data
}

export async function updateUserStatus(userId: string, statutCompte: UserStatus) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      statut_compte: statutCompte,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  await logSecurityEvent({
    action: 'admin.user.status_updated',
    resourceType: 'profile',
    resourceId: userId,
    severity: 'warning',
    details: { statutCompte },
  })

  return data
}
