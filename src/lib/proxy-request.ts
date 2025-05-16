// path: src/lib/proxy-request.ts
import { NextRequest, NextResponse } from 'next/server'

interface ProxyRequestOptions {
  backendPath: string
  method?: string
  body?: unknown
  headers?: Record<string, string>
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

/**
 * Proxies requests from Next.js routes to the backend, copying cookies.
 * If the backend returns 403 "session invalid," tries to create a session in DB,
 * then returns a 200 with sessionAutoCreated for the client to handle on-chain if desired.
 */
export async function proxyRequest(
  req: NextRequest,
  options: ProxyRequestOptions
): Promise<NextResponse> {
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
  const status = backendResp.status

  // Pass through normal response
  const nextResp = NextResponse.json(data, { status })
  forwardSetCookieHeaders(backendResp, nextResp)
  return nextResp
}

function forwardSetCookieHeaders(backendResp: Response, nextResp: NextResponse) {
  for (const [key, value] of backendResp.headers.entries()) {
    if (key.toLowerCase() === 'set-cookie') {
      nextResp.headers.append('set-cookie', value)
    }
  }
}
