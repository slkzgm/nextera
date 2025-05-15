// path: src/app/api/session/status/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

/**
 * Proxies GET /api/session/status to the backend for session status checks.
 */
export async function GET(req: NextRequest) {
  return proxyRequest(req, {
    backendPath: '/api/session/status',
  })
}
