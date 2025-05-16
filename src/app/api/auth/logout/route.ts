// path: src/app/api/auth/logout/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

/**
 * Proxies POST /api/auth/logout to the backend /api/logout.
 */
export async function POST(req: NextRequest) {
  return proxyRequest(req, {
    backendPath: '/api/logout',
    method: 'POST',
  })
}
