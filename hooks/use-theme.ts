"use client"

import { useEffect, useState } from "react"

import type { ThemePref } from "@/components/settings-provider"

/**
 * Evalúa si el tema oscuro debe estar activo según la preferencia elegida por el usuario y la configuración de su sistema.
 */
function shouldApplyDarkTheme(theme: ThemePref, isSystemDark: boolean): boolean {
  return theme === "dark" || (theme === "system" && isSystemDark)
}

/**
 * Actualiza las clases CSS en el elemento raíz de la página para activar visualmente el tema claro u oscuro.
 */
function updateDocumentThemeClasses(root: HTMLElement, isDark: boolean): void {
  root.classList.toggle("dark", isDark)
  root.classList.toggle("light", !isDark)
}

/**
 * Hook que sincroniza la preferencia de tema con el DOM y reacciona a los cambios en tiempo real del sistema operativo.
 */
export function useTheme(theme: ThemePref) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const systemMedia = window.matchMedia("(prefers-color-scheme: dark)")

    const syncThemeWithDOM = () => {
      const isSystemDark = systemMedia.matches
      const isDarkActive = shouldApplyDarkTheme(theme, isSystemDark)

      updateDocumentThemeClasses(root, isDarkActive)
      setIsDark(isDarkActive)
    }

    syncThemeWithDOM()

    const isSystemDependent = theme === "system"
    if (isSystemDependent) {
      systemMedia.addEventListener("change", syncThemeWithDOM)
      return () => systemMedia.removeEventListener("change", syncThemeWithDOM)
    }
  }, [theme])

  return isDark
}
