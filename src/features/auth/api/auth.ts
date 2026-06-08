import { supabase } from '@/lib/supabase'
import type { UserRole } from '../utils/roles'

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: Exclude<UserRole, 'administrateur'>
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nom: name,
        role,
      },
    },
  })

  if (error) throw error

  if (!data.user) {
    throw new Error('Utilisateur introuvable après inscription.')
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    email,
    nom: name,
    role,
    statut_compte: 'actif',
  })

  if (profileError) throw profileError

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) throw error
  return data.user
}