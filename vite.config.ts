import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const baseSecurityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
}

const strictCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://tile.openstreetmap.org",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://recherche-entreprises.api.gouv.fr https://data.geopf.fr",
  "worker-src 'self' blob:",
].join('; ')

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      headers: baseSecurityHeaders,
    },
    preview: {
      headers: {
        ...baseSecurityHeaders,
        'Content-Security-Policy': strictCsp,
      },
    },
  }
})
