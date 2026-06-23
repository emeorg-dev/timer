"use client"

import { useEffect } from "react"

interface ShortcutHandlers {
  onPlayPause?: () => void
  onReset?: () => void
  onToggleMute?: () => void
  onToggleSound?: () => void
  onClear?: () => void
  onToggleSidebar?: () => void
}

/**
 * Escucha eventos de teclado globales y ejecuta acciones mapeadas,
 * ignorando automáticamente las pulsaciones cuando el usuario está 
 * enfocado en un campo de texto (inputs, textareas).
 */
export function useShortcuts({
  onPlayPause,
  onReset,
  onToggleMute,
  onToggleSound,
  onClear,
  onToggleSidebar,
}: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement?.tagName
      // Si el usuario tiene seleccionado un input (ej. el Ghost Input en móvil)
      if (activeEl === "INPUT" || activeEl === "TEXTAREA" || activeEl === "SELECT") {
        return
      }

      // Evitar que atajos se disparen con modificadores activos (Ctrl, Alt, Meta)
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return
      }

      const key = e.key.toLowerCase()

      switch (key) {
        case "p":
        case " ":
          e.preventDefault()
          onPlayPause?.()
          break
        case "r":
          e.preventDefault()
          onReset?.()
          break
        case "m":
          e.preventDefault()
          onToggleMute?.()
          break
        case "s":
          e.preventDefault()
          onToggleSound?.()
          break
        case "c":
          e.preventDefault()
          onToggleSidebar?.()
          break
        case "escape":
          e.preventDefault()
          onClear?.()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onPlayPause, onReset, onToggleMute, onToggleSound, onClear, onToggleSidebar])
}
