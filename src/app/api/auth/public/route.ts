// path: src/app/api/auth/public/route.ts
/**
 * Proxies a GET request to the backend's "/" public endpoint.
 */
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

export async function GET(req: NextRequest) {
  return proxyRequest(req, {
    backendPath: '/',
  })
}
