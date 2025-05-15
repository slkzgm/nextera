// path: src/app/api/endpoints/protected/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

/**
 * Proxies GET /api/protected to the backend, which checks for the JWT cookie.
 */
export async function GET(req: NextRequest) {
  return proxyRequest(req, {
    backendPath: '/api/protected',
  })
}
