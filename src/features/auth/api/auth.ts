import { supabase } from '@/lib/supabase'

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        nom: name.trim(),
      },
    },
  })

  if (error) throw error

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
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
