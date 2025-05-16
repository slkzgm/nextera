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
import { useAutoSession } from '@/hooks/useAutoSession'
import { publicClient } from '@/lib/publicClient'

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const [backendResponse, setBackendResponse] = useState('')

  // Web3 states
  const { address, isConnected } = useAccount()
  const { login, logout } = useLoginWithAbstract()
  const { data: agwClient } = useAbstractClient()
  const { createSessionAsync } = useCreateSession()

  // Custom hook for automatically creating a session on 403 invalid, re-trying once
  const { fetchWithAutoSession, creatingSession } = useAutoSession()

  async function handleConnectAGW() {
    setLoading(true)
    try {
      await login()
      toast.success('AGW connected!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connect failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnectAGW() {
    setLoading(true)
    try {
      await logout()
      toast('AGW wallet disconnected')
    } catch {}
    setLoading(false)
  }

  /**
   * SIWE login flow
   * 1) Challenge => sign => 2) post signature => sets JWT cookie if ok
   */
  async function handleLoginToBackend() {
    if (!isConnected || !address || !agwClient) {
      return toast.error('AGW not connected or missing address.')
    }
    setLoading(true)
    setBackendResponse('')
    try {
      // Challenge
      const challengeResp = await fetchWithAutoSession(`/api/auth/challenge?address=${address}`, {
        credentials: 'include',
      })
      if (!challengeResp.ok) {
        throw new Error(challengeResp.data.error || 'Failed to fetch SIWE challenge')
      }

      // Sign
      const { siweMessage } = challengeResp.data
      if (typeof siweMessage !== 'string') {
        throw new Error('Invalid SIWE message from server')
      }

      const signature = await agwClient.signMessage({ message: siweMessage })
      if (!signature) {
        throw new Error('No signature returned')
      }

      // Login
      const loginResp = await fetchWithAutoSession('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature }),
      })
      if (!loginResp.ok) {
        throw new Error(loginResp.data.error || 'Login failed')
      }

      toast.success('Backend login successful!')
      setBackendResponse('Successfully logged in to backend!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login to backend failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Test public route
   */
  async function handleTestPublic() {
    setLoading(true)
    setBackendResponse('')
    try {
      const resp = await fetchWithAutoSession('/api/endpoints/public', { credentials: 'include' })
      if (!resp.ok) {
        throw new Error(resp.data.error || 'Public route error')
      }
      setBackendResponse(JSON.stringify(resp.data, null, 2))
      toast.success('Public route success!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Public route test failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Test protected route
   */
  async function handleTestProtected() {
    setLoading(true)
    setBackendResponse('')
    try {
      const resp = await fetchWithAutoSession('/api/endpoints/protected', {
        credentials: 'include',
      })
      if (!resp.ok) {
        throw new Error(resp.data.error || 'Protected route error')
      }
      setBackendResponse(JSON.stringify(resp.data, null, 2))
      toast.success('Protected route success!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Protected route test failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Logout from backend (clears JWT)
   */
  async function handleLogoutBackend() {
    setLoading(true)
    setBackendResponse('')
    try {
      const resp = await fetchWithAutoSession('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      if (!resp.ok) {
        throw new Error(resp.data.error || 'Logout failed')
      }
      setBackendResponse(JSON.stringify(resp.data, null, 2))
      toast.success('Backend logout successful!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Logout backend failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Manually create session
   */
  async function createSessionManually() {
    setLoading(true)
    try {
      const resp = await fetchWithAutoSession('/api/session/create', {
        method: 'POST',
        credentials: 'include',
      })
      const data = resp.data
      if (!resp.ok || !resp.data.sessionConfig) {
        throw new Error(resp.data.error || 'Failed to create session record')
      }
      if (!isConnected || !address) {
        throw new Error('Wallet not connected or missing address')
      }
      const { transactionHash } = await createSessionAsync({
        session: data.sessionConfig,
      })
      if (!transactionHash) {
        throw new Error('No transaction hash returned')
      }
      const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash })
      if (receipt.status !== 'success') {
        throw new Error('On-chain transaction failed')
      }
      toast.success('Session created in DB and on-chain!')
      setBackendResponse(JSON.stringify({ sessionKeyAddress: data.sessionKeyAddress }, null, 2))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Session creation failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Checks on-chain session status from the backend
   */
  async function checkSessionStatus() {
    setLoading(true)
    setBackendResponse('')
    try {
      const resp = await fetchWithAutoSession('/api/session/status', { credentials: 'include' })
      if (!resp.ok) {
        throw new Error(resp.data.error || 'Status check failed')
      }
      toast.success(`Session is ${resp.data.active ? 'Active' : 'Inactive'}`)
      setBackendResponse(JSON.stringify(resp.data, null, 2))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Status check failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Mint an NFT. fetchWithAutoSession => if 403 "session invalid", create and re-try once
   */
  async function mintNFT() {
    setLoading(true)
    setBackendResponse('')
    try {
      const resp = await fetchWithAutoSession('/api/mint', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: address, amount: '1' }),
      })
      if (!resp.ok) {
        throw new Error(resp.data.error || 'Mint failed')
      }
      toast.success(`Minted! TX: ${resp.data.txHash}`)
      setBackendResponse(JSON.stringify(resp.data, null, 2))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Mint request failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 p-4">
      <h1 className="mb-4 text-xl">Login Demo with AGW + Backend</h1>
      <p>AGW: {isConnected ? 'Connected' : 'Not connected'}</p>
      <p>Address: {address || 'N/A'}</p>

      <div className="flex flex-wrap gap-2">
        <button onClick={handleConnectAGW} disabled={loading || isConnected} className="btn">
          Connect AGW
        </button>
        <button onClick={handleDisconnectAGW} disabled={loading || !isConnected} className="btn">
          Disconnect AGW
        </button>
        <button onClick={handleLoginToBackend} disabled={loading || !isConnected} className="btn">
          Login Backend
        </button>
        <button onClick={handleTestPublic} disabled={loading} className="btn">
          Test Public
        </button>
        <button onClick={handleTestProtected} disabled={loading} className="btn">
          Test Protected
        </button>
        <button onClick={handleLogoutBackend} disabled={loading} className="btn">
          Logout Backend
        </button>
      </div>
      {backendResponse && <pre className="mt-2 rounded border p-2">{backendResponse}</pre>}

      <hr className="my-6" />

      <h2 className="mb-4 text-lg">Session Demo</h2>
      <div className="flex flex-wrap gap-2">
        <button onClick={createSessionManually} disabled={loading || !isConnected} className="btn">
          Create Session
        </button>
        <button onClick={checkSessionStatus} disabled={loading} className="btn">
          Check Session Status
        </button>
        <button onClick={mintNFT} disabled={loading} className="btn">
          Mint NFT
        </button>
      </div>
      {creatingSession && (
        <p className="text-sm text-gray-500">Auto-creating session, please wait...</p>
      )}

      <ThemeSwitcher />
    </div>
  )
}
