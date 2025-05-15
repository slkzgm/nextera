// path: src/app/api/auth/challenge/route.ts
/**
 * Proxies the GET /api/challenge?address=... request to the backend.
 */
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

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
