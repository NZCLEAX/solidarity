import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const baseHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
}

const productionCsp =
  "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; object-src 'none'; upgrade-insecure-requests"

function securityHeadersPlugin(): PluginOption {
  return {
    name: 'security-headers',
    configureServer(server) {
      server.middlewares.use((_, res, next) => {
        for (const [key, value] of Object.entries(baseHeaders)) {
          res.setHeader(key, value)
        }
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((_, res, next) => {
        for (const [key, value] of Object.entries(baseHeaders)) {
          res.setHeader(key, value)
        }
        res.setHeader('Content-Security-Policy', productionCsp)
        next()
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [react(), securityHeadersPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
