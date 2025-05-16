// path: src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

/**
 * Proxies POST /api/auth/login to the backend /api/login.
 */
export async function POST(req: NextRequest) {
  try {
    const { address, signature } = await req.json()
    if (!address || !signature) {
      return new Response(JSON.stringify({ error: 'Missing address or signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return proxyRequest(req, {
      backendPath: '/api/login',
      method: 'POST',
      body: { address, signature },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('[ERROR] /api/auth/login =>', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
