import { Capacitor } from '@capacitor/core'
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in'

import { supabase } from '@/lib/supabase'
import type { PublicRegisterRole } from '../utils/roles'

const GOOGLE_WEB_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID

let googleInitialized = false

async function initializeGoogleNative() {
  if (googleInitialized) {
    return
  }

  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error(
      'VITE_GOOGLE_WEB_CLIENT_ID est manquant dans le fichier .env.'
    )
  }

  await GoogleSignIn.initialize({
    clientId: GOOGLE_WEB_CLIENT_ID,
  })

  googleInitialized = true
}

async function signInWithNativeGoogle() {
  await initializeGoogleNative()

  const result = await GoogleSignIn.signIn()

  if (!result.idToken) {
    throw new Error(
      "Google n'a pas retourné d'ID token."
    )
  }

  const { data, error } =
    await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: result.idToken,
    })

  if (error) {
    throw error
  }

  return data
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: PublicRegisterRole
) {
  const cleanEmail = email.trim().toLowerCase()
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

  return data
}

export async function signIn(
  email: string,
  password: string
) {
  const cleanEmail =
    email.trim().toLowerCase()

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
  /*
   * GOOGLE NATIF
   */
  if (
    provider === 'google' &&
    Capacitor.isNativePlatform()
  ) {
    return signInWithNativeGoogle()
  }

  /*
   * VERSION WEB
   */
  const { data, error } =
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo:
          `${window.location.origin}/points/new`,
      },
    })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  if (Capacitor.isNativePlatform()) {
    try {
      await initializeGoogleNative()
      await GoogleSignIn.signOut()
    } catch (error) {
      console.warn(
        'Déconnexion Google ignorée :',
        error
      )
    }
  }

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