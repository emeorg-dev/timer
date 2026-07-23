"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { LangCode } from "@/lib/i18n"
import { Settings, DEFAULT_SETTINGS, AnnouncementMode, ThemePref } from "@/lib/settings/types"
import { SettingsRepository } from "@/lib/settings/settings-repository"

export type { AnnouncementMode, ThemePref, Settings }

interface SettingsContextValue {
  settings: Settings
  ready: boolean
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)
const repo = new SettingsRepository()

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [ready, setReady] = useState(false)

  // Load persisted settings on mount.
  useEffect(() => {
    setSettings(repo.load())
    setReady(true)
  }, [])

  // Persist whenever settings change (after initial load).
  useEffect(() => {
    if (!ready) return
    repo.save(settings)
  }, [settings, ready])

  const update: SettingsContextValue["update"] = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <SettingsContext.Provider value={{ settings, ready, update }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider")
  return ctx
}
