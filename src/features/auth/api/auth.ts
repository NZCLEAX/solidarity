import { supabase } from '@/lib/supabase'
import type { PublicRegisterRole } from '../utils/roles'
import { logSecurityEvent } from '@/features/security/api/security'

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: PublicRegisterRole
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

  await logSecurityEvent({
    action: 'auth.signup',
    resourceType: 'profile',
    resourceId: data.user.id,
    severity: 'info',
    details: { role, email },
  })

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  await logSecurityEvent({
    action: 'auth.signin',
    resourceType: 'session',
    resourceId: data.user?.id ?? null,
    severity: 'info',
    details: { email },
  })

  return data
}
export async function signInWithProvider(provider: 'google' | 'apple') {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/carte`,
    },
  })

  if (error) throw error

  await logSecurityEvent({
    action: 'auth.oauth.redirect',
    resourceType: 'session',
    severity: 'info',
    details: { provider },
  })
}

export async function signOut() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  await logSecurityEvent({
    action: 'auth.signout',
    resourceType: 'session',
    resourceId: user?.id ?? null,
    severity: 'info',
  })

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) throw error
  return data.user
}
