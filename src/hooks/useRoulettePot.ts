// path: src/hooks/useRoulettePot.ts
'use client'

import { useAccount } from 'wagmi'
import { useAbstractClient } from '@abstract-foundation/agw-react'
import { useContractRead } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import rouletteJson from '@/abis/RoulettePot.json'

const ROULETTE_ADDRESS = process.env.NEXT_PUBLIC_ROULETTE_ADDRESS!
const ROULETTE_ABI = rouletteJson.abi as readonly any[]
const ROUND_DURATION = 5 * 60 // seconds

/**
 * Encapsulates all on-chain reads and writes for the RoulettePot contract.
 */
export function useRoulettePot() {
  const { address, isConnected } = useAccount()
  const { data: agwClient } = useAbstractClient()

  // 1. Read the active round ID
  const { data: roundIdData } = useContractRead({
    address: ROULETTE_ADDRESS,
    abi: ROULETTE_ABI,
    functionName: 'currentRoundId',
    watch: true,
  })
  const currentRoundId = Number(roundIdData ?? 1)

  // 2. Read the round struct
  const { data: rawRound, isLoading: loadingRound } = useContractRead({
    address: ROULETTE_ADDRESS,
    abi: ROULETTE_ABI,
    functionName: 'rounds',
    args: [currentRoundId],
    watch: true,
  })

  // 3. Read withdrawable balance for the connected user
  const { data: rawWithdraw, isLoading: loadingWithdraw } = useContractRead({
    address: ROULETTE_ADDRESS,
    abi: ROULETTE_ABI,
    functionName: 'withdrawable',
    args: [address],
    watch: true,
    enabled: isConnected,
  })

  // Parse on-chain data
  const round = rawRound
    ? {
        state: Number(rawRound[0]),
        startTime: Number(rawRound[1]),
        players: Array.isArray(rawRound[2])
          ? (rawRound[2] as Array<[string, bigint]>).map(([addr, amt]) => ({
              address: addr,
              amount: amt,
            }))
          : [],
        total: (rawRound[3] as bigint) || 0n,
      }
    : null

  const withdrawable = (rawWithdraw as bigint) || 0n

  // Compute UI flags
  const now = Math.floor(Date.now() / 1000)
  const canDeposit = round !== null && round.state === 0 && now < round.startTime + ROUND_DURATION
  const canClose = round !== null && round.state === 0 && now >= round.startTime + ROUND_DURATION
  const isAwaitingRng = round !== null && round.state === 1
  const canClaim = withdrawable > 0n

  // Write actions via AGW
  async function deposit(amountEth: string) {
    if (!agwClient) return
    const value = parseEther(amountEth)
    await agwClient.writeContract({
      address: ROULETTE_ADDRESS,
      abi: ROULETTE_ABI,
      functionName: 'deposit',
      args: [],
      value,
    })
  }

  async function closeRound() {
    if (!agwClient) return
    await agwClient.writeContract({
      address: ROULETTE_ADDRESS,
      abi: ROULETTE_ABI,
      functionName: 'closeRound',
      args: [],
    })
  }

  async function claim() {
    if (!agwClient) return
    await agwClient.writeContract({
      address: ROULETTE_ADDRESS,
      abi: ROULETTE_ABI,
      functionName: 'claim',
      args: [],
    })
  }

  return {
    currentRoundId,
    round,
    withdrawable,
    loadingRound,
    loadingWithdraw,
    canDeposit,
    canClose,
    isAwaitingRng,
    canClaim,
    deposit,
    closeRound,
    claim,
    formatEther,
  }
}
