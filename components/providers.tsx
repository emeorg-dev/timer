"use client"

import * as React from "react"

import { LanguageProvider } from "@/components/language/language-provider"
import { SettingsProvider } from "@/components/settings"
import { ThemeProvider } from "@/components/theme/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      disableTransitionOnChange
      storageKey="emeorg-theme"
    >
      <LanguageProvider>
        <SettingsProvider>{children}</SettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
