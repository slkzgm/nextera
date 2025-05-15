// path: src/app/api/mint/route.ts
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

/**
 * Proxies the POST /api/mint request to the backend's /api/actions/mint endpoint.
 */
export async function POST(req: NextRequest) {
  try {
    const jsonBody = await req.json()
    return proxyRequest(req, {
      backendPath: '/api/actions/mint',
      method: 'POST',
      body: jsonBody,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('[ERROR] /api/mint =>', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
