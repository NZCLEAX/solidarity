let csrfTokenPromise: Promise<string> | null = null
let csrfTokenCache: string | null = null

async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text()

  if (!text) {
    return {} as T
  }

  return JSON.parse(text) as T
}

export async function getCsrfToken() {
  if (csrfTokenCache) {
    return csrfTokenCache
  }

  if (!csrfTokenPromise) {
    csrfTokenPromise = (async () => {
      const response = await fetch('/api/auth/csrf', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const payload = await readJsonResponse<{ csrfToken?: string; error?: string }>(
        response
      )

      if (!response.ok) {
        throw new Error(payload.error || 'Impossible de récupérer le jeton CSRF.')
      }

      if (!payload.csrfToken) {
        throw new Error('Jeton CSRF introuvable.')
      }

      csrfTokenCache = payload.csrfToken
      return payload.csrfToken
    })().finally(() => {
      csrfTokenPromise = null
    })
  }

  return csrfTokenPromise
}

export async function withCsrfHeaders(headers: HeadersInit = {}) {
  const csrfToken = await getCsrfToken()

  return {
    ...headers,
    'X-CSRF-Token': csrfToken,
  }
}

export function clearCsrfTokenCache() {
  csrfTokenCache = null
  csrfTokenPromise = null
}
