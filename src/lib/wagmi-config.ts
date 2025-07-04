import { createConfig } from 'wagmi'
import { abstract } from 'wagmi/chains'
import { createClient, http } from 'viem'
import { eip712WalletActions } from 'viem/zksync'
import { connectors } from './rainbowkit-config'

export const config = createConfig({
  connectors,
  chains: [abstract],
  client({ chain }) {
    return createClient({
      chain,
      transport: http(),
    }).extend(eip712WalletActions())
  },
  ssr: true,
}) 