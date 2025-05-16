// path: src/app/api/endpoints/protected/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

/**
 * Forwards GET /api/protected to the backend /api/protected.
 */
export async function GET(req: NextRequest) {
  return proxyRequest(req, { backendPath: '/api/protected' })
}
