/**
 * Vite plugin exposing dashboard data at `/api/dashboard` from Supabase.
 *
 * The browser never sees the service-role key: it fetches this endpoint, and
 * the privileged Supabase read happens here on the server. Works in both
 * `vite dev` and `vite preview`, so the production build stays demonstrable
 * without a separate backend deployment.
 *
 * Credentials arrive as an explicit argument from vite.config.ts rather than
 * through `server.config.env`, because Vite only surfaces VITE_-prefixed keys
 * there and would otherwise inline them into `import.meta.env` for the browser.
 */

import type { Connect, Plugin, PreviewServer, ViteDevServer } from 'vite'
import { loadDashboardData } from './supabaseData.ts'

const ROUTE = '/api/dashboard'

/** Short-lived cache so a page with three panels doesn't issue three queries. */
const CACHE_TTL_MS = 30_000

interface CacheEntry {
  expiresAt: number
  payload: unknown
}

let cache: CacheEntry | null = null

function resolveCredentials(env: Record<string, string>) {
  const url = env.SUPABASE_URL
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return { error: 'Missing SUPABASE_URL or SUPABASE_SECRET_KEY in the server environment.' }
  }
  return { url, key }
}

type Env = Record<string, string>

function attachRoute(server: ViteDevServer | PreviewServer, env: Env) {
  const handler: Connect.NextHandleFunction = (request, response, next) => {
    const path = (request.url ?? '').split('?')[0]
    if (path !== ROUTE) {
      next()
      return
    }

    if (cache && cache.expiresAt > Date.now()) {
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify(cache.payload))
      return
    }

    const credentials = resolveCredentials(env)
    if ('error' in credentials) {
      response.statusCode = 500
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify({ error: credentials.error }))
      return
    }

    loadDashboardData(credentials.url, credentials.key)
      .then((payload) => {
        cache = { expiresAt: Date.now() + CACHE_TTL_MS, payload }
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(payload))
      })
      .catch((cause: Error) => {
        // Surface a readable message; never echo credentials.
        response.statusCode = 502
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ error: cause.message }))
      })
  }

  server.middlewares.use(handler)
}

/** Test seam: drops the cached payload so the next request re-queries Supabase. */
export function invalidateDashboardCache() {
  cache = null
}

export function supabaseDashboard(env: Env): Plugin {
  return {
    name: 'sentinel-supabase-dashboard',
    configureServer: (server) => attachRoute(server, env),
    configurePreviewServer: (server) => attachRoute(server, env),
  }
}
