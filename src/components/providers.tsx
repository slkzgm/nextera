// path: src/components/providers.tsx
'use client'

import { ThemeProvider } from '@/components/providers/theme-provider'
import RainbowKitProviderWrapper from '@/components/providers/rainbowkit-provider'

interface ProvidersProps {
    children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
    return (
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
            <RainbowKitProviderWrapper>{children}</RainbowKitProviderWrapper>
        </ThemeProvider>
    )
}
