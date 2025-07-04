import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { abstractWallet } from '@abstract-foundation/agw-react/connectors'

export const connectors = connectorsForWallets(
  [
    {
      groupName: 'Abstract',
      wallets: [abstractWallet],
    },
  ],
  {
    appName: 'Nextera Abstract',
    projectId: '',
    appDescription: 'Modern NextJS template with Abstract Global Wallet',
    appIcon: '',
    appUrl: '',
  }
) 