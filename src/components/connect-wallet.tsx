// path: src/components/connect-wallet.tsx
'use client'

import { useLoginWithAbstract } from '@abstract-foundation/agw-react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'

/**
 * Renders a Connect/Disconnect wallet button using AGW.
 */
export default function ConnectWallet() {
  const { login, logout } = useLoginWithAbstract()
  const { address, isConnected } = useAccount()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <code className="font-mono text-sm">{address}</code>
        <Button variant="outline" size="sm" onClick={() => logout()}>
          Disconnect
        </Button>
      </div>
    )
  }

  return <Button onClick={() => login()}>Connect Wallet</Button>
}
