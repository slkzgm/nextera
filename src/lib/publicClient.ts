// path: src/lib/publicClient.ts
import { createPublicClient, http } from 'viem'
import { abstractTestnet } from 'viem/chains'

/**
 * Exports a public client for the Abstract Testnet using viem.
 */
export const publicClient = createPublicClient({
  chain: abstractTestnet,
  transport: http(),
})
