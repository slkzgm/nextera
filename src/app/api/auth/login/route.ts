// path: src/app/api/auth/login/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Proxies the POST /api/login call to the backend,
 * forwarding any cookies and returning Set-Cookie to the client.
 */
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/proxy-request'

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
  } catch (error: any) {
    console.error('[ERROR] /api/auth/login =>', error.message)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
