import type { User } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

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

const profileSelect =
  'id, nom, email, role, association_id, statut_compte, created_at, updated_at'

function getNameFromUser(user: User) {
  const metadata = user.user_metadata ?? {}
  const rawName = metadata.nom ?? metadata.name ?? metadata.full_name

  return typeof rawName === 'string' && rawName.trim().length > 0
    ? rawName.trim()
    : null
}

function buildProfileInsert(user: User) {
  return {
    id: user.id,
    nom: getNameFromUser(user),
    email: user.email ?? '',
    role: 'citoyen' satisfies UserRole,
    association_id: null,
    statut_compte: 'actif' satisfies AccountStatus,
  }
}

function isMissingAuthSession(error: unknown) {
  return (
    error instanceof Error &&
    (error.message === 'Auth session missing!' ||
      error.name === 'AuthSessionMissingError')
  )
}

export async function createProfileForUser(user: User) {
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'ensure_current_profile'
  )

  if (!rpcError && rpcData) {
    return rpcData as UserProfile
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert(buildProfileInsert(user))
    .select(profileSelect)
    .single<UserProfile>()

  if (error) {
    if (error.code === '42501' || error.message.includes('row-level security')) {
      throw new Error(
        "Le profil n'a pas pu etre cree car les politiques Supabase RLS ne sont pas encore appliquees sur la table profiles."
      )
    }

    throw error
  }

  return data
}

export async function getProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select(profileSelect)
    .eq('id', userId)
    .maybeSingle<UserProfile>()

  if (error) {
    throw error
  }

  return data
}

export async function ensureProfileForUser(user: User) {
  const profile = await getProfileByUserId(user.id)

  if (profile) {
    return profile
  }

  return createProfileForUser(user)
}

export async function getCurrentProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    if (isMissingAuthSession(userError)) {
      return null
    }

    throw userError
  }

  if (!user) {
    return null
  }

  return ensureProfileForUser(user)
}
