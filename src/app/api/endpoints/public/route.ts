// path: src/app/api/endpoints/public/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

/**
 * Proxies GET /api/public to the backend's public endpoint.
 */
export async function GET(req: NextRequest) {
  return proxyRequest(req, {
    backendPath: '/',
  })
}
