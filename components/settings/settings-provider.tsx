"use client"

import { createContext, type ReactNode, useContext, useEffect, useState } from "react"

import { SettingsRepository } from "@/lib/settings/settings-repository"
import type { AnnouncementMode, Settings, ThemePref } from "@/lib/settings/types"
import { DEFAULT_SETTINGS } from "@/lib/settings/types"

export type { AnnouncementMode, Settings, ThemePref }

/**
 * Contrato de contexto para el acceso y modificación reactiva de las configuraciones del usuario.
 */
interface SettingsContextValue {
  settings: Settings
  isReady: boolean
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)
const repo = new SettingsRepository()

/**
 * Proveedor de Contexto y Memoria de Configuración de la aplicación.
 *
 * Envuelve el árbol de componentes del cliente para suministrar acceso centralizado a las preferencias del usuario,
 * orquestando la carga inicial y la persistencia automática en el almacenamiento local mediante `SettingsRepository`.
 *
 * @param props Nodos hijos que requerirán acceso al contexto de ajustes.
 */
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

  // Sincronizar dinámicamente el atributo lang del HTML para accesibilidad y lectores de pantalla.
  useEffect(() => {
    if (typeof document !== "undefined" && settings.language) {
      document.documentElement.lang = settings.language
    }
  }, [settings.language])

  const update: SettingsContextValue["update"] = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <SettingsContext.Provider value={{ settings, isReady, update }}>
      {children}
    </SettingsContext.Provider>
  )
}

/**
 * Hook consumidor para acceder o actualizar de forma reactiva las preferencias y ajustes del temporizador.
 *
 * @throws {Error} Si es invocado fuera de un árbol envuelto por `SettingsProvider`.
 * @returns Objeto con las configuraciones actuales, bandera de hidratación (`isReady`) y función de actualización.
 */
export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider")
  return ctx
}
