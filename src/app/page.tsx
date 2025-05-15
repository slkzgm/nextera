// path: src/app/page.tsx
'use client'

import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { useLoginWithAbstract, useAbstractClient } from '@abstract-foundation/agw-react'
import { toast } from 'sonner'
import ThemeSwitcher from '@/components/theme-switcher'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [backendResponse, setBackendResponse] = useState<string>('')
  const { address, isConnected } = useAccount()
  const { login, logout } = useLoginWithAbstract()
  const { data: agwClient } = useAbstractClient()

  async function handleConnect() {
    try {
      setLoading(true)
      await login()
      toast.success('AGW connected successfully!')
    } catch (error) {
      console.error('[ERROR] handleConnect =>', error)
      toast.error('Failed to connect AGW')
    } finally {
      setLoading(false)
    }
  }

  async function handleLoginToBackend() {
    if (!agwClient || !address) {
      toast.error('AGW not connected or no address found.')
      return
    }
    setLoading(true)
    setBackendResponse('')

    try {
      // Fetch challenge from Next.js => proxies to backend
      const challengeResp = await fetch(`/api/auth/challenge?address=${address}`, {
        credentials: 'include',
      })
      if (!challengeResp.ok) {
        throw new Error('Failed to get challenge')
      }
      const { siweMessage } = await challengeResp.json()

      // Sign the message
      const signature = await agwClient.signMessage({ message: siweMessage })

      // Send signature to /api/auth/login => proxies to backend
      const loginResp = await fetch(`/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature }),
      })

      const loginData = await loginResp.json()
      if (!loginResp.ok) {
        throw new Error(loginData.error || 'Login failed')
      }

      setBackendResponse('Successfully logged in to the backend!')
      toast.success('Backend login successful!')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login to backend failed'
      console.error('[ERROR] handleLoginToBackend =>', message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleTestPublic() {
    setLoading(true)
    setBackendResponse('')
    try {
      const resp = await fetch('/api/auth/public', { credentials: 'include' })
      const data = await resp.json()
      setBackendResponse(JSON.stringify(data))
    } catch (error) {
      console.error('[ERROR] handleTestPublic =>', error)
      toast.error('Public route test failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleTestProtected() {
    setLoading(true)
    setBackendResponse('')
    try {
      const resp = await fetch('/api/auth/protected', { credentials: 'include' })
      const data = await resp.json()
      setBackendResponse(JSON.stringify(data))
    } catch (error) {
      console.error('[ERROR] handleTestProtected =>', error)
      toast.error('Protected route test failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogoutFromBackend() {
    setLoading(true)
    setBackendResponse('')
    try {
      const resp = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await resp.json()
      setBackendResponse(JSON.stringify(data))
      toast.success('Backend logout successful!')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Logout from backend failed'
      console.error('[ERROR] handleLogoutFromBackend =>', message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnectAGW() {
    try {
      await logout()
      toast('AGW wallet disconnected')
    } catch (error) {
      console.error('[ERROR] handleDisconnectAGW =>', error)
    }
  }

  return (
    <div className="p-4">
      <ThemeSwitcher />
      <h1 className="mb-4 text-xl">Login Demo with AGW + Backend</h1>
      <p className="mb-2">AGW connection status: {isConnected ? 'Connected' : 'Not connected'}</p>
      <p className="mb-4">Wallet address: {address || 'N/A'}</p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleConnect}
          disabled={loading || isConnected}
          className="rounded-md border px-3 py-1"
        >
          Connect AGW
        </button>
        <button
          onClick={handleDisconnectAGW}
          disabled={loading || !isConnected}
          className="rounded-md border px-3 py-1"
        >
          Disconnect AGW
        </button>
        <button
          onClick={handleLoginToBackend}
          disabled={loading || !isConnected}
          className="rounded-md border px-3 py-1"
        >
          Login to Backend
        </button>
        <button
          onClick={handleTestPublic}
          disabled={loading}
          className="rounded-md border px-3 py-1"
        >
          Test Public Route
        </button>
        <button
          onClick={handleTestProtected}
          disabled={loading}
          className="rounded-md border px-3 py-1"
        >
          Test Protected Route
        </button>
        <button
          onClick={handleLogoutFromBackend}
          disabled={loading}
          className="rounded-md border px-3 py-1"
        >
          Logout from Backend
        </button>
      </div>

      {backendResponse && (
        <div className="mt-4 rounded border p-2">
          <strong>Backend response:</strong>
          <pre>{backendResponse}</pre>
        </div>
      )}
    </div>
  )
}
