// path: src/components/debug-panel.tsx
'use client'

import { useContractRead } from 'wagmi'
import { useAbstractClient } from '@abstract-foundation/agw-react'
import { formatEther } from 'viem'
import { useState } from 'react'
import rouletteJson from '@/abis/RoulettePot.json'
import mockJson from '@/abis/MockVRFSystem.json'

const ROULETTE_ADDRESS = process.env.NEXT_PUBLIC_ROULETTE_ADDRESS!
const ROULETTE_ABI = rouletteJson.abi as readonly any[]
const MOCK_VRF_ADDRESS = process.env.NEXT_PUBLIC_MOCK_VRF_ADDRESS!
const MOCK_VRF_ABI = mockJson.abi as readonly any[]

interface DebugPanelProps {
  currentRoundId: number
  round: {
    state: number
    startTime: number
    total: bigint
    players: Array<{ address: string; amount: bigint }>
  } | null
  nowUnix: number
}

/**
 * Shows on-chain debug info and, when
 * the round is awaiting randomness,
 * a button to simulate the VRF callback
 * via the MockVRFSystem.
 */
export function DebugPanel({ currentRoundId, round, nowUnix }: DebugPanelProps) {
  const { data: vrfSystem } = useContractRead({
    address: ROULETTE_ADDRESS,
    abi: ROULETTE_ABI,
    functionName: 'vrfSystem',
    watch: true,
  })

  const { data: agwClient } = useAbstractClient()
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!round) return null

  const roundState = round.state
  const startTime = round.startTime
  const endTime = startTime + 5 * 60

  async function simulateVRF() {
    if (!agwClient) {
      setError('Wallet not connected')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const hash = await agwClient.writeContract({
        address: MOCK_VRF_ADDRESS,
        abi: MOCK_VRF_ABI,
        functionName: 'deliverRandomNumber',
        args: [BigInt(currentRoundId)],
      })
      setTxHash(hash)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2 rounded border p-4 text-sm">
      <p>
        <strong>Debug Panel</strong>
      </p>
      <p>VRF System: {String(vrfSystem)}</p>
      <p>
        Round #{currentRoundId} State: {roundState}
      </p>
      <p>Started: {new Date(startTime * 1000).toLocaleTimeString()}</p>
      <p>Ends: {new Date(endTime * 1000).toLocaleTimeString()}</p>
      <p>Now: {new Date(nowUnix * 1000).toLocaleTimeString()}</p>
      <p>Total Pot: {formatEther(round.total)} ETH</p>
      <p>Players ({round.players.length}):</p>
      {round.players.length > 0 && (
        <ul className="list-disc pl-5">
          {round.players.map((p) => (
            <li key={p.address}>
              {p.address}: {formatEther(p.amount)} ETH
            </li>
          ))}
        </ul>
      )}

      {roundState === 1 && (
        <div className="mt-4 space-y-2">
          <button
            className="rounded bg-yellow-500 px-4 py-2 text-black disabled:opacity-50"
            onClick={simulateVRF}
            disabled={loading}
          >
            {loading ? 'Simulating…' : `Simulate VRF for Round ${currentRoundId}`}
          </button>
          {txHash && <p className="text-green-600">Tx sent: {txHash}</p>}
          {error && <p className="text-red-600">Error: {error}</p>}
        </div>
      )}
    </div>
  )
}
