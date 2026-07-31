"use client"

import { createContext, type ReactNode, useContext, useEffect, useState } from "react"

import type { ISettingsRepository } from "@/lib/settings/interfaces"
import { SettingsRepository } from "@/lib/settings/settings-repository"
import type { Settings } from "@/lib/settings/types"
import { DEFAULT_SETTINGS } from "@/lib/settings/types"

interface SettingsContextValue {
  settings: Settings
  isReady: boolean
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}

interface SettingsProviderProps {
  children: ReactNode
  repository?: ISettingsRepository
}

const SettingsContext = createContext<SettingsContextValue | null>(null)
const browserSettingsRepository = new SettingsRepository()

export function SettingsProvider({
  children,
  repository = browserSettingsRepository,
}: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setSettings(repository.load())
    setIsReady(true)
  }, [repository])

  useEffect(() => {
    if (isReady) repository.save(settings)
  }, [isReady, repository, settings])

  const update: SettingsContextValue["update"] = (key, value) => {
    setSettings(previousSettings => ({ ...previousSettings, [key]: value }))
  }

  return (
    <SettingsContext.Provider value={{ settings, isReady, update }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)

  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider")
  }

  return context
}
