// path: src/app/api/lib/proxy-request.ts
import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxies requests to the backend, forwarding cookies and returning any Set-Cookie headers.
 */
interface ProxyRequestOptions {
  backendPath: string
  method?: string
  body?: unknown
  headers?: Record<string, string>
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function proxyRequest(
  req: NextRequest,
  options: ProxyRequestOptions
): Promise<NextResponse> {
  try {
    const { backendPath, method = 'GET', body, headers = {} } = options
    const incomingCookie = req.headers.get('cookie') || ''

    const init: RequestInit = {
      method,
      headers: {
        ...headers,
        cookie: incomingCookie,
      },
      credentials: 'include',
    }

    if (body) {
      init.body = JSON.stringify(body)
      init.headers = {
        ...init.headers,
        'Content-Type': 'application/json',
      }
    }

    const backendResp = await fetch(`${BACKEND_URL}${backendPath}`, init)
    const data = await backendResp.json().catch(() => ({}))
    const nextResp = NextResponse.json(data, { status: backendResp.status })

    // Forward any Set-Cookie headers from the backend to the user.
    for (const [key, value] of backendResp.headers.entries()) {
      if (key.toLowerCase() === 'set-cookie') {
        nextResp.headers.append('set-cookie', value)
      }
    }

    return nextResp
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('[ERROR] proxyRequest =>', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
