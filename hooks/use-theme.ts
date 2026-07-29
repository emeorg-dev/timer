"use client"

import { useEffect, useState } from "react"

import type { ThemePref } from "@/lib/settings/types"

/**
 * Evalúa si el tema oscuro debe aplicarse según la preferencia seleccionada y la configuración del sistema operativo.
 *
 * @param theme Preferencia de apariencia elegida por el usuario ('light', 'dark' o 'system').
 * @param isSystemDark Indica si las preferencias nativas de la consola o sistema operativo exigen modo oscuro.
 * @returns `true` si el modo oscuro debe activarse visualmente en la interfaz.
 */
function shouldApplyDarkTheme(theme: ThemePref, isSystemDark: boolean): boolean {
  return theme === "dark" || (theme === "system" && isSystemDark)
}

/**
 * Sincroniza visualmente las clases CSS ('dark', 'light') en el elemento raíz (`<html>`) del documento.
 *
 * @param root Elemento DOM raíz del documento HTML.
 * @param isDark Estado calculado que indica si el modo oscuro está activo.
 */
function updateDocumentThemeClasses(root: HTMLElement, isDark: boolean): void {
  root.classList.toggle("dark", isDark)
  root.classList.toggle("light", !isDark)
}

/**
 * Orquesta la apariencia visual de la aplicación, sincronizando el tema con el DOM y el sistema operativo.
 *
 * Reacciona dinámicamente a los cambios en las preferencias de color del usuario (`prefers-color-scheme`)
 * cuando el modo 'system' está seleccionado, alternando las clases CSS sin destellos ni recargas.
 *
 * @param theme Opción de apariencia seleccionada en el panel de configuración.
 * @returns Estado booleano (`isDark`) para adaptar colores programáticamente en lienzos WebGL o sombreadores.
 *
 * @example
 * const isDarkMode = useTheme("system");
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
