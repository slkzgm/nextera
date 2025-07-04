// path: src/app/page.tsx
import ThemeSwitcher from '@/components/theme-switcher'
import WalletConnect from '@/components/wallet-connect'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-4xl font-bold text-center">
          Welcome to Nextera Abstract
        </h1>
        <div className="flex items-center space-x-4">
          <WalletConnect />
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  )
}
