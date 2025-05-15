// path: src/app/api/session/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

/**
 * Proxies GET /api/session to the backend for session retrieval/creation.
 */
export async function GET(req: NextRequest) {
  return proxyRequest(req, {
    backendPath: '/api/session',
  })
}
