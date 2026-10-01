import { supabase } from '@/lib/supabase'
import type { PublicRegisterRole } from '../utils/roles'

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: PublicRegisterRole
) {
  const cleanEmail = email
    .trim()
    .toLowerCase()

  const cleanName = name.trim()

  const { data, error } =
    await supabase.auth.signUp({
      email: cleanEmail,
      password,

      options: {
        data: {
          nom: cleanName,
          name: cleanName,
          role,
        },
      },
    })

  if (error) {
    throw error
  }

  if (!data.user) {
    throw new Error(
      "Impossible de créer l'utilisateur."
    )
  }

  /*
   * IMPORTANT :
   *
   * On ne crée PLUS le profil ici.
   *
   * Le trigger Supabase :
   *
   * auth.users
   * -> on_auth_user_created
   * -> handle_new_user()
   *
   * crée automatiquement la ligne
   * correspondante dans public.profiles.
   *
   * Cela évite l'erreur RLS :
   *
   * "new row violates row-level security policy
   * for table profiles"
   */

  return data
}

export async function signIn(
  email: string,
  password: string
) {
  const cleanEmail = email
    .trim()
    .toLowerCase()

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

  if (error) {
    throw error
  }

  return data
}

export async function signInWithProvider(
  provider: 'google' | 'apple'
) {
  const { error } =
    await supabase.auth.signInWithOAuth({
      provider,

      options: {
        redirectTo: `${window.location.origin}/carte`,
      },
    })

  if (error) {
    throw error
  }
}

export async function signOut() {
  const { error } =
    await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  const { data, error } =
    await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return data.user
}