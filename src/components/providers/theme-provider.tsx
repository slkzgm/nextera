// path: src/components/theme-provider.tsx
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

/**
 * Provides Next.js themes with selectable light, dark, or dim modes.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dim"
      enableSystem
      forcedTheme={props.forcedTheme}
      themes={['light', 'dark', 'dim']}
    >
      {children}
    </NextThemesProvider>
  )
}
