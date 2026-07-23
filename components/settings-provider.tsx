"use client"

import { createContext, type ReactNode, useContext, useEffect, useState } from "react"

import { SettingsRepository } from "@/lib/settings/settings-repository"
import type { AnnouncementMode, Settings, ThemePref } from "@/lib/settings/types"
import { DEFAULT_SETTINGS } from "@/lib/settings/types"

export type { AnnouncementMode, Settings, ThemePref }

interface SettingsContextValue {
  settings: Settings
  isReady: boolean
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)
const repo = new SettingsRepository()

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isReady, setIsReady] = useState(false)

  // Load persisted settings on mount.
  useEffect(() => {
    setSettings(repo.load())
    setIsReady(true)
  }, [])

  // Persist whenever settings change (after initial load).
  useEffect(() => {
    if (!isReady) return
    repo.save(settings)
  }, [settings, isReady])

  const update: SettingsContextValue["update"] = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <SettingsContext.Provider value={{ settings, isReady, update }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider")
  return ctx
}
