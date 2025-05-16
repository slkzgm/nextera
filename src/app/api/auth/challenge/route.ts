// path: src/app/api/auth/challenge/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

/**
 * Proxies GET /api/auth/challenge?address=... to the backend /api/challenge.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const address = url.searchParams.get('address')

  if (!address) {
    return new Response(JSON.stringify({ error: "Missing 'address' query param" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return proxyRequest(req, {
    backendPath: `/api/challenge?address=${encodeURIComponent(address)}`,
  })
}
