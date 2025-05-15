// path: src/components/providers.tsx
'use client'

import { ThemeProvider } from '@/components/providers/theme-provider'
import AbstractProvider from '@/components/providers/abstract-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <AbstractProvider>{children}</AbstractProvider>
    </ThemeProvider>
  )
}
