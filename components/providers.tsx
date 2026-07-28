"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

import { SettingsProvider } from "@/components/settings"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <SettingsProvider>{children}</SettingsProvider>
    </NextThemesProvider>
  )
}
