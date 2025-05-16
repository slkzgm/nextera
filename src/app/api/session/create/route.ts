// path: src/app/api/session/create/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

/**
 * Forwards POST /api/session/create to the backend /api/session/create.
 */
export async function POST(req: NextRequest) {
  return proxyRequest(req, {
    backendPath: '/api/session/create',
    method: 'POST',
  })
}
