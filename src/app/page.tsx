// path: src/app/page.tsx
'use client'

import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import {
  useLoginWithAbstract,
  useAbstractClient,
  useCreateSession,
} from '@abstract-foundation/agw-react'
import { toast } from 'sonner'
import ThemeSwitcher from '@/components/theme-switcher'
import { publicClient } from '@/lib/publicClient'

interface SessionData {
  status: string
  sessionConfig: unknown
}

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const [backendResponse, setBackendResponse] = useState('')
  const { address, isConnected } = useAccount()
  const { login, logout } = useLoginWithAbstract()
  const { data: agwClient } = useAbstractClient()
  const { createSessionAsync } = useCreateSession()
  const [session, setSession] = useState<SessionData | null>(null)
  const [sessionStatus, setSessionStatus] = useState('')

  async function handleConnect() {
    try {
      setLoading(true)
      await login()
      toast.success('AGW connected successfully!')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to connect AGW'
      console.error('[ERROR] handleConnect =>', message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnectAGW() {
    try {
      await logout()
      toast('AGW wallet disconnected')
    } catch {}
  }

  async function handleLoginToBackend() {
    if (!agwClient || !address) {
      return toast.error('AGW not connected or no address.')
    }
    setLoading(true)
    setBackendResponse('')
    try {
      const challengeResp = await fetch(`/api/auth/challenge?address=${address}`, {
        credentials: 'include',
      })
      const { siweMessage } = await challengeResp.json()
      const signature = await agwClient.signMessage({ message: siweMessage })

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
      const resp = await fetch('/api/endpoints/public', { credentials: 'include' })
      const data = await resp.json()
      if (!resp.ok) {
        throw new Error(data.error || 'Public route test failed')
      }
      setBackendResponse(JSON.stringify(data, null, 2))
      toast.success('Public route successful!')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Public route test failed'
      console.error('[ERROR] handleTestPublic =>', message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleTestProtected() {
    setLoading(true)
    setBackendResponse('')
    try {
      const resp = await fetch('/api/endpoints/protected', { credentials: 'include' })
      const data = await resp.json()
      if (!resp.ok) {
        throw new Error(data.error || 'Protected route test failed')
      }
      setBackendResponse(JSON.stringify(data, null, 2))
      toast.success('Protected route successful!')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Protected route test failed'
      console.error('[ERROR] handleTestProtected =>', message)
      toast.error(message)
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
      if (!resp.ok) {
        throw new Error(data.error || 'Logout failed')
      }
      setBackendResponse(JSON.stringify(data, null, 2))
      toast.success('Backend logout successful!')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Logout from backend failed'
      console.error('[ERROR] handleLogoutFromBackend =>', message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Creates (or retrieves) and immediately confirms a session on-chain, then confirms in the backend.
   */
  async function createAndConfirmSession() {
    setLoading(true)
    setSession(null)
    setSessionStatus('')
    try {
      // 1. Get or create the session from the backend
      const res = await fetch('/api/session', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        const err = data.error ?? 'Error fetching session'
        throw new Error(err)
      }
      if (!data.sessionConfig) {
        throw new Error('No session config returned')
      }

      // 2. Confirm the session on-chain
      const { transactionHash } = await createSessionAsync({ session: data.sessionConfig })
      if (!transactionHash) {
        throw new Error('No transaction hash returned')
      }
      const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash })
      if (receipt.status !== 'success') {
        throw new Error('Transaction failed')
      }

      // 3. Confirm the session on the backend
      const confirmResp = await fetch('/api/session/confirm', {
        method: 'POST',
        credentials: 'include',
      })
      if (!confirmResp.ok) {
        const confirmData = await confirmResp.json()
        throw new Error(confirmData.error || 'Confirm failed')
      }

      // 4. Save the session as active in local state
      setSession({ ...data, status: 'active' })
      setSessionStatus('active')
      toast.success('Session successfully created & confirmed!')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Create & confirm session failed'
      console.error('[ERROR] createAndConfirmSession =>', message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function checkSessionStatus() {
    setLoading(true)
    try {
      const res = await fetch('/api/session/status', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Status fetch failed')
      }
      setSessionStatus(data.status)
      toast.success(`Status: ${data.status}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Status check failed'
      console.error('[ERROR] checkSessionStatus =>', message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function mintWithSession() {
    setLoading(true)
    try {
      const resp = await fetch('/api/mint', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: address, amount: '1' }),
      })
      const data = await resp.json()
      if (!resp.ok) {
        throw new Error(data.error || 'Mint failed')
      }
      toast.success(`Minted! TX: ${data.txHash}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Mint failed'
      console.error('[ERROR] mintWithSession =>', message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 p-4">
      {/* --- LOGIN SECTION --- */}
      <div>
        <h1 className="mb-4 text-xl">Login Demo with AGW + Backend</h1>
        <p>AGW: {isConnected ? 'Connected' : 'Not connected'}</p>
        <p>Address: {address || 'N/A'}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button onClick={handleConnect} disabled={loading || isConnected} className="btn">
            Connect AGW
          </button>
          <button onClick={handleDisconnectAGW} disabled={loading || !isConnected} className="btn">
            Disconnect AGW
          </button>
          <button onClick={handleLoginToBackend} disabled={loading || !isConnected} className="btn">
            Login Backend
          </button>
          <button onClick={handleTestPublic} disabled={loading} className="btn">
            Test Public Route
          </button>
          <button onClick={handleTestProtected} disabled={loading} className="btn">
            Test Protected Route
          </button>
          <button onClick={handleLogoutFromBackend} disabled={loading} className="btn">
            Logout Backend
          </button>
        </div>
        {backendResponse && <pre className="mt-2 rounded border p-2">{backendResponse}</pre>}
      </div>

      {/* --- SESSION SECTION --- */}
      <div>
        <h2 className="mb-4 text-lg">Session Demo</h2>
        <p>Wallet: {address || 'N/A'}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={createAndConfirmSession}
            disabled={loading || !isConnected}
            className="btn"
          >
            Create Session
          </button>
          <button onClick={checkSessionStatus} disabled={loading} className="btn">
            Check Status
          </button>
          <button
            onClick={mintWithSession}
            disabled={loading || sessionStatus !== 'active'}
            className="btn"
          >
            Mint NFT
          </button>
        </div>
        {session && (
          <pre className="mt-4 rounded border p-2">{JSON.stringify(session, null, 2)}</pre>
        )}
        {sessionStatus && (
          <p className="mt-2">
            <strong>Current status:</strong> {sessionStatus}
          </p>
        )}
      </div>
      <ThemeSwitcher />
    </div>
  )
}
