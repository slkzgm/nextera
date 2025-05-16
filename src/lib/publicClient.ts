// path: src/lib/publicClient.ts
import { createPublicClient, http } from 'viem'
import { abstractTestnet } from 'viem/chains'

/**
 * Public client for the Abstract Testnet using viem.
 */
export const publicClient = createPublicClient({
  chain: abstractTestnet,
  transport: http(),
})
