import type { UserRole } from '@/features/auth/utils/roles'
import { clearCsrfTokenCache, withCsrfHeaders } from '@/lib/csrf'

type BackendAuthUser = {
  id: string
  email: string | null
  user_metadata?: Record<string, unknown>
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text()

  if (!text) {
    return {} as T
  }

  return JSON.parse(text) as T
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: UserRole
) {
  const headers = await withCsrfHeaders({
    'Content-Type': 'application/json',
  })

  const response = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({
      email,
      password,
      name,
      role,
    }),
  })

  const payload = await readJsonResponse<{
    user?: BackendAuthUser
    error?: string
  }>(response)

  if (!response.ok) {
    throw new Error(payload.error || "Erreur lors de l'inscription.")
  }

  if (!payload.user) {
    throw new Error('Utilisateur introuvable après inscription.')
  }

  return payload
}

export async function signIn(email: string, password: string) {
  const headers = await withCsrfHeaders({
    'Content-Type': 'application/json',
  })

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({
      email,
      password,
    }),
  })

  const payload = await readJsonResponse<{ user?: BackendAuthUser; error?: string }>(
    response
  )

  if (!response.ok) {
    throw new Error(payload.error || 'Impossible de te connecter.')
  }

  return payload
}

export async function signInWithProvider(provider: 'google' | 'apple') {
  throw new Error(
    `La connexion ${provider} n'est pas encore branchée sur le flux HttpOnly.`
  )
}

export async function signOut() {
  const headers = await withCsrfHeaders({
    'Content-Type': 'application/json',
  })

  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    const payload = await readJsonResponse<{ error?: string }>(response)
    throw new Error(payload.error || 'Impossible de te déconnecter.')
  }

  clearCsrfTokenCache()
}

export async function getCurrentUser() {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (response.status === 401) {
    return null
  }

  const payload = await readJsonResponse<{ user?: BackendAuthUser; error?: string }>(
    response
  )

  if (!response.ok) {
    throw new Error(payload.error || 'Impossible de récupérer la session.')
  }

  return payload.user ?? null
}
