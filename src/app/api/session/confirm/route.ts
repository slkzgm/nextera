// path: src/app/api/session/confirm/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

/**
 * Proxies POST /api/session/confirm to the backend for session confirmation.
 */
export async function POST(req: NextRequest) {
  return proxyRequest(req, {
    backendPath: '/api/session/confirm',
    method: 'POST',
  })
}
