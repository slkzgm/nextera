// path: src/app/api/endpoints/public/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

/**
 * Forwards GET /api/public to the backend root (/).
 */
export async function GET(req: NextRequest) {
  return proxyRequest(req, { backendPath: '/' })
}
