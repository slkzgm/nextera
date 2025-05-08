// path: src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import ConnectWallet from '@/components/connect-wallet'
import { useRoulettePot } from '@/hooks/useRoulettePot'
import { DebugPanel } from '@/components/debug-panel'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const { isConnected } = useAccount()
  const {
    currentRoundId,
    round,
    withdrawable,
    loadingRound,
    canDeposit,
    canClose,
    isAwaitingRng,
    canClaim,
    deposit,
    closeRound,
    claim,
    formatEther,
  } = useRoulettePot()

  // Local timestamp for countdown and debug
  const [now, setNow] = useState(Math.floor(Date.now() / 1000))
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="space-y-6 p-6">
      <ConnectWallet />

      {!isConnected && <p>Please connect your wallet.</p>}

      {isConnected && (
        <>
          <h1 className="text-2xl font-bold">RoulettePot Round #{currentRoundId}</h1>

          {loadingRound || !round ? (
            <p>Loading round data…</p>
          ) : (
            <>
              {/* Consolidated debug info and VRF helper */}
              <DebugPanel currentRoundId={currentRoundId} round={round} nowUnix={now} />

              {isAwaitingRng && <p className="text-sm">Waiting for randomness…</p>}

              <div className="space-y-4">
                {/* Bet section */}
                <div>
                  <label className="mb-1 block">
                    Your bet (ETH):
                    <input
                      type="number"
                      step="0.01"
                      defaultValue="0.1"
                      className="ml-2 w-24 border px-2 py-1"
                      onBlur={(e) => deposit(e.currentTarget.value)}
                      disabled={!canDeposit}
                    />
                  </label>
                  <Button onClick={() => deposit('0.1')} disabled={!canDeposit}>
                    {canDeposit ? 'Place Bet' : 'Betting Closed'}
                  </Button>
                </div>

                {/* Close & Claim */}
                <div className="flex gap-2">
                  <Button onClick={() => closeRound()} disabled={!canClose}>
                    {canClose ? 'Close Round' : 'Cannot Close'}
                  </Button>
                  <Button onClick={() => claim()} disabled={!canClaim}>
                    {canClaim ? `Claim ${formatEther(withdrawable)} ETH` : 'Nothing to Claim'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
