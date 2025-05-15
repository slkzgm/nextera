// path: src/app/api/auth/protected/route.ts
/**
 * Proxies GET /api/protected to the backend, which checks for the JWT cookie.
 */
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

export async function GET(req: NextRequest) {
  return proxyRequest(req, {
    backendPath: '/api/protected',
  })
}
