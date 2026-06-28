import { createClient } from '@supabase/supabase-js'
import { getCsrfToken } from './csrf'

const supabaseUrl =
  String(import.meta.env.VITE_SUPABASE_URL || 'https://wxmdreumkgufwxdrlevo.supabase.co').trim()
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()
const supabaseProxyBase = import.meta.env.VITE_SUPABASE_PROXY_URL || '/supabase'

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL. Set VITE_SUPABASE_URL in your .env file.')
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing Supabase anon key. Set VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

const proxyFetch: typeof fetch = async (input, init) => {
  const requestUrl =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url

  let proxiedUrl = requestUrl
  const method =
    init?.method ||
    (input instanceof Request ? input.method : undefined) ||
    'GET'
  const isMutatingRequest = !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())
  const requestInit: RequestInit = {
    ...init,
    credentials: 'include',
  }

  try {
    const parsedRequestUrl = new URL(requestUrl)
    const parsedSupabaseUrl = new URL(supabaseUrl)

    if (parsedRequestUrl.origin === parsedSupabaseUrl.origin) {
      proxiedUrl = `${supabaseProxyBase}${parsedRequestUrl.pathname}${parsedRequestUrl.search}`
    }
  } catch {
    proxiedUrl = requestUrl
  }

  if (isMutatingRequest) {
    const csrfToken = await getCsrfToken()
    const headers = new Headers(requestInit.headers || {})
    headers.set('X-CSRF-Token', csrfToken)
    requestInit.headers = headers
  }

  return fetch(proxiedUrl, requestInit)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    fetch: proxyFetch,
  },
})
