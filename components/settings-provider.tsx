"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { LangCode } from "@/lib/i18n"

export type AnnouncementMode = "remaining" | "elapsed"
export type ThemePref = "light" | "dark" | "system"

export interface Settings {
  voiceEnabled: boolean
  language: LangCode
  announcementInterval: number // seconds; 0 = only at end
  announcementMode: AnnouncementMode
  soundEnabled: boolean
  theme: ThemePref
  musicEnabled: boolean
}

const DEFAULT_SETTINGS: Settings = {
  voiceEnabled: true,
  language: "es-ES",
  announcementInterval: 60,
  announcementMode: "remaining",
  soundEnabled: true,
  theme: "system",
  musicEnabled: true,
}

const STORAGE_KEY = "voice-timer-settings"

interface SettingsContextValue {
  settings: Settings
  ready: boolean
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [ready, setReady] = useState(false)

  // Load persisted settings on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>
        setSettings((prev) => ({ ...prev, ...parsed }))
      }
    } catch {
      // ignore malformed storage
    }
    setReady(true)
  }, [])

  // Persist whenever settings change (after initial load).
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // ignore quota errors
    }
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
