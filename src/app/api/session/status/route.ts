// path: src/app/api/session/status/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

/**
 * Forwards GET /api/session/status to the backend /api/session/status.
 */
export async function GET(req: NextRequest) {
  return proxyRequest(req, { backendPath: '/api/session/status' })
}
