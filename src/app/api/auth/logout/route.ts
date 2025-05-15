// path: src/app/api/auth/logout/route.ts
/**
 * Proxies the POST /api/logout call to the backend.
 */
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

export async function POST(req: NextRequest) {
  return proxyRequest(req, {
    backendPath: '/api/logout',
    method: 'POST',
  })
}
