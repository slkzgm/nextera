// path: src/hooks/useAutoSession.tsx
'use client'

import { useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { toast } from 'sonner'
import { useCreateSession } from '@abstract-foundation/agw-react'
import { publicClient } from '@/lib/publicClient'

/**
 * Shape of data returned from our proxied API calls.
 */
type FetchData = {
  error?: string
  sessionConfig?: unknown
  sessionKeyAddress?: string
  [key: string]: unknown
}

interface AutoFetchResult {
  ok: boolean
  status: number
  data: FetchData
}

/**
 * A custom hook that wraps fetch() to:
 * 1. Perform the request.
 * 2. If it 403s with "session invalid", then:
 *    a. POST /api/session/create
 *    b. Do on-chain creation via AGW
 *    c. Retry the original request once
 */
export function useAutoSession() {
  const { isConnected, address } = useAccount()
  const { createSessionAsync } = useCreateSession()

  const hasRetriedRef = useRef(false)
  const [creatingSession, setCreatingSession] = useState(false)

  async function fetchWithAutoSession(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<AutoFetchResult> {
    // 1) First attempt
    const firstResp = await fetch(input, init)
    const firstData = (await firstResp.json().catch(() => ({}))) as FetchData

    // If not a "session invalid" 403, just return
    if (
      firstResp.status !== 403 ||
      typeof firstData.error !== 'string' ||
      !firstData.error.toLowerCase().includes('session invalid')
    ) {
      return { ok: firstResp.ok, status: firstResp.status, data: firstData }
    }

    // Prevent infinite retry loops
    if (hasRetriedRef.current) {
      toast.error('Session invalid and already retried once.')
      return { ok: false, status: 403, data: firstData }
    }
    hasRetriedRef.current = true

    // 2a) Create session record in backend
    toast('Session invalid → creating session record…')
    setCreatingSession(true)
    const createResp = await fetch('/api/session/create', {
      method: 'POST',
      credentials: 'include',
    })
    const createData = (await createResp.json().catch(() => ({}))) as FetchData

    if (!createResp.ok || !createData.sessionConfig) {
      setCreatingSession(false)
      toast.error(createData.error || 'Failed to create session record')
      return { ok: false, status: createResp.status, data: createData }
    }

    // 2b) On-chain creation
    if (!isConnected || !address) {
      setCreatingSession(false)
      toast.error('Wallet not connected; cannot create on-chain session.')
      return { ok: false, status: 400, data: { error: 'Not connected' } }
    }

    try {
      toast('Creating session on-chain…')
      const { transactionHash } = await createSessionAsync({
        session: createData.sessionConfig,
      })
      if (!transactionHash) throw new Error('No transaction hash returned')

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
      })
      if (receipt.status !== 'success') throw new Error('On-chain transaction failed')

      toast.success('Session created on-chain; retrying request…')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'On-chain creation error'
      toast.error(msg)
      setCreatingSession(false)
      return { ok: false, status: 400, data: { error: msg } }
    } finally {
      setCreatingSession(false)
    }

    // 3) Retry original request once
    const secondResp = await fetch(input, init)
    const secondData = (await secondResp.json().catch(() => ({}))) as FetchData
    return { ok: secondResp.ok, status: secondResp.status, data: secondData }
  }

  return { fetchWithAutoSession, creatingSession }
}
