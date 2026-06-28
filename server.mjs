import http from 'node:http'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'

import { createClient } from '@supabase/supabase-js'
import { createServer as createViteServer, loadEnv } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = process.cwd()
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const env = loadEnv(mode, root, '')

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRoleKey =
  env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

const adminSupabase = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null

const accessCookieName = 'sb-access-token'
const refreshCookieName = 'sb-refresh-token'
const csrfCookieName = 'csrf-token'

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split('=')

    if (!rawKey) return acc

    acc[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.join('=') || '')
    return acc
  }, {})
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`]

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.floor(options.maxAge)}`)
  }

  if (options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`)
  }

  parts.push(`Path=${options.path || '/'}`)
  parts.push(`SameSite=${options.sameSite || 'Lax'}`)

  if (options.httpOnly !== false) {
    parts.push('HttpOnly')
  }

  if (options.secure) {
    parts.push('Secure')
  }

  return parts.join('; ')
}

function appendSetCookie(res, cookieValue) {
  const current = res.getHeader('Set-Cookie')

  if (!current) {
    res.setHeader('Set-Cookie', [cookieValue])
    return
  }

  const next = Array.isArray(current) ? current.slice() : [String(current)]
  next.push(cookieValue)
  res.setHeader('Set-Cookie', next)
}

function setAuthCookies(res, session) {
  const secure = mode === 'production'
  const expiresAt = session.expires_at
    ? new Date(session.expires_at * 1000)
    : new Date(Date.now() + (session.expires_in ?? 3600) * 1000)

  const refreshExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)

  appendSetCookie(
    res,
    serializeCookie(accessCookieName, session.access_token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure,
      path: '/',
      expires: expiresAt,
    })
  )
  appendSetCookie(
    res,
    serializeCookie(refreshCookieName, session.refresh_token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure,
      path: '/',
      expires: refreshExpires,
    })
  )
}

function setCsrfCookie(res, token) {
  const secure = mode === 'production'

  appendSetCookie(
    res,
    serializeCookie(csrfCookieName, token, {
      httpOnly: false,
      sameSite: 'Lax',
      secure,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
  )
}

function clearAuthCookies(res) {
  const secure = mode === 'production'

  appendSetCookie(
    res,
    serializeCookie(accessCookieName, '', {
      httpOnly: true,
      sameSite: 'Lax',
      secure,
      path: '/',
      maxAge: 0,
    })
  )
  appendSetCookie(
    res,
    serializeCookie(refreshCookieName, '', {
      httpOnly: true,
      sameSite: 'Lax',
      secure,
      path: '/',
      maxAge: 0,
    })
  )
}

function getOrCreateCsrfToken(req, res) {
  const existingToken = getCookie(req, csrfCookieName)

  if (existingToken) {
    return existingToken
  }

  const token = crypto.randomBytes(32).toString('hex')
  setCsrfCookie(res, token)
  return token
}

function isMutatingMethod(method = '') {
  return !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())
}

function readCsrfHeader(req) {
  const header = req.headers['x-csrf-token'] || req.headers['x-xsrf-token']
  return Array.isArray(header) ? header[0] : header || null
}

function assertCsrf(req) {
  const method = req.method || 'GET'

  if (!isMutatingMethod(method)) {
    return
  }

  const cookieToken = getCookie(req, csrfCookieName)
  const headerToken = readCsrfHeader(req)

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    const error = new Error('CSRF token manquant ou invalide.')
    error.statusCode = 403
    throw error
  }
}

function getCookie(req, name) {
  const cookies = parseCookies(req.headers.cookie || '')
  return cookies[name] || null
}

async function readJsonBody(req) {
  const chunks = []

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  const raw = Buffer.concat(chunks).toString('utf8')

  if (!raw) return {}

  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload)

  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(body)
}

function applyBaseSecurityHeaders(res) {
  if (res.headersSent) return

  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
}

function getSupabaseHeaders(req, accessToken) {
  const headers = new Headers()
  headers.set('apikey', supabaseAnonKey)
  headers.set('Authorization', `Bearer ${accessToken || supabaseAnonKey}`)

  const contentType = req.headers['content-type']
  if (contentType) headers.set('content-type', contentType)

  const prefer = req.headers.prefer
  if (prefer) headers.set('prefer', prefer)

  const range = req.headers.range
  if (range) headers.set('range', range)

  const accept = req.headers.accept
  if (accept) headers.set('accept', accept)

  return headers
}

async function refreshSession(refreshToken) {
  const response = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
    {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    }
  )

  if (!response.ok) {
    return null
  }

  return response.json()
}

async function fetchAuthUser(accessToken) {
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

async function loginAndIssueCookies(res, body) {
  const response = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    }
  )

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error_description || payload.msg || 'Connexion refusée.')
  }

  if (payload.access_token && payload.refresh_token) {
    setAuthCookies(res, payload)
  }

  return payload.user ?? null
}

async function registerUser(res, body) {
  const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: body.email,
      password: body.password,
      options: {
        data: {
          nom: body.name,
          name: body.name,
          role: body.role,
        },
      },
    }),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error_description || payload.msg || 'Inscription refusée.')
  }

  const user = payload.user ?? null

  if (payload.session?.access_token && payload.session?.refresh_token) {
    setAuthCookies(res, payload.session)
  } else {
    try {
      await loginAndIssueCookies(res, {
        email: body.email,
        password: body.password,
      })
    } catch {
      // If email confirmation is enabled, the user will need to confirm
      // before the session can be issued.
    }
  }

  if (adminSupabase && user) {
    const profileData = {
      id: user.id,
      email: body.email,
      nom: body.name,
      role: body.role,
      statut_compte: body.role === 'association' ? 'en_attente' : 'actif',
    }

    const { error } = await adminSupabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })

    if (error) {
      throw error
    }
  }

  return user
}

async function proxySupabase(req, res, pathname) {
  const targetPath = pathname.replace(/^\/supabase/, '')
  const targetUrl = `${supabaseUrl}${targetPath}${new URL(req.url, 'http://localhost').search}`
  const method = req.method || 'GET'
  const accessToken = getCookie(req, accessCookieName)
  const refreshToken = getCookie(req, refreshCookieName)

  const body = method === 'GET' || method === 'HEAD' ? undefined : await readJsonBody(req)

  const headers = getSupabaseHeaders(req, accessToken)

  const init = {
    method,
    headers,
  }

  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  const performRequest = async (tokenToUse) => {
    const requestHeaders = getSupabaseHeaders(req, tokenToUse)

    const requestInit = {
      ...init,
      headers: requestHeaders,
    }

    return fetch(targetUrl, requestInit)
  }

  let response = await performRequest(accessToken)
  let refreshedSession = null

  if (response.status === 401 && refreshToken) {
    refreshedSession = await refreshSession(refreshToken)
    if (refreshedSession?.access_token) {
      setAuthCookies(res, refreshedSession)
      response = await performRequest(refreshedSession.access_token)
    }
  }

  const headersToCopy = new Headers()
  response.headers.forEach((value, key) => {
    if (
      ![
        'content-length',
        'content-encoding',
        'transfer-encoding',
        'connection',
        'set-cookie',
      ].includes(key.toLowerCase())
    ) {
      headersToCopy.set(key, value)
    }
  })

  res.writeHead(response.status, Object.fromEntries(headersToCopy.entries()))
  const arrayBuffer = await response.arrayBuffer()
  res.end(Buffer.from(arrayBuffer))
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api/auth/csrf' && req.method === 'GET') {
    const csrfToken = getOrCreateCsrfToken(req, res)
    sendJson(res, 200, { csrfToken })
    return true
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      assertCsrf(req)
      const body = await readJsonBody(req)
      const user = await loginAndIssueCookies(res, body)
      getOrCreateCsrfToken(req, res)
      sendJson(res, 200, { user })
    } catch (error) {
      sendJson(res, 401, {
        error: error instanceof Error ? error.message : 'Connexion impossible.',
      })
    }
    return true
  }

  if (pathname === '/api/auth/register' && req.method === 'POST') {
    try {
      assertCsrf(req)
      const body = await readJsonBody(req)
      const user = await registerUser(res, body)
      getOrCreateCsrfToken(req, res)

      sendJson(res, 200, {
        user,
      })
    } catch (error) {
      sendJson(res, 400, {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de créer le compte.",
      })
    }
    return true
  }

  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    assertCsrf(req)
    clearAuthCookies(res)
    sendJson(res, 200, { ok: true })
    return true
  }

  if (pathname === '/api/auth/me' && req.method === 'GET') {
    try {
      const accessToken = getCookie(req, accessCookieName)
      const refreshToken = getCookie(req, refreshCookieName)
      getOrCreateCsrfToken(req, res)

      if (!accessToken) {
        sendJson(res, 401, { error: 'Utilisateur non connecté.' })
        return true
      }

      let user = await fetchAuthUser(accessToken)

      if (!user && refreshToken) {
        const refreshedSession = await refreshSession(refreshToken)

        if (refreshedSession?.access_token) {
          setAuthCookies(res, refreshedSession)
          user = await fetchAuthUser(refreshedSession.access_token)
        }
      }

      if (!user) {
        clearAuthCookies(res)
        sendJson(res, 401, { error: 'Utilisateur non connecté.' })
        return true
      }

      sendJson(res, 200, { user })
    } catch (error) {
      sendJson(res, 500, {
        error: error instanceof Error ? error.message : 'Session indisponible.',
      })
    }
    return true
  }

  if (pathname.startsWith('/supabase/')) {
    assertCsrf(req)
    await proxySupabase(req, res, pathname)
    return true
  }

  return false
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  }

  return map[ext] || 'application/octet-stream'
}

async function serveStaticOrIndex(req, res, vite) {
  const url = new URL(req.url, 'http://localhost')

  if (mode === 'development') {
    const html = await readFile(path.resolve(root, 'index.html'), 'utf8')
    const transformed = await vite.transformIndexHtml(url.pathname, html)
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    res.end(transformed)
    return
  }

  const filePath = path.resolve(root, 'dist', url.pathname === '/' ? 'index.html' : `.${url.pathname}`)

  try {
    const content = await readFile(filePath)
    res.writeHead(200, {
      'Content-Type': getContentType(filePath),
      'Cache-Control': 'no-store',
    })
    res.end(content)
  } catch {
    const indexHtml = await readFile(path.resolve(root, 'dist/index.html'), 'utf8')
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    res.end(indexHtml)
  }
}

async function main() {
  const vite =
    mode === 'development'
      ? await createViteServer({
          root,
          appType: 'custom',
          server: {
            middlewareMode: true,
          },
        })
      : null

  const server = http.createServer(async (req, res) => {
    try {
      applyBaseSecurityHeaders(res)

      const pathname = new URL(req.url, 'http://localhost').pathname

      if (await handleApi(req, res, pathname)) {
        return
      }

      if (mode === 'development' && vite) {
        vite.middlewares(req, res, async () => {
          await serveStaticOrIndex(req, res, vite)
        })
        return
      }

      await serveStaticOrIndex(req, res, vite)
    } catch (error) {
      res.writeHead(500, {
        'Content-Type': 'application/json; charset=utf-8',
      })
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unexpected error',
        })
      )
    }
  })

  const port = Number(env.PORT || 5173)

  server.listen(port, () => {
    console.log(`Solidarity server running on http://localhost:${port}`)
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
