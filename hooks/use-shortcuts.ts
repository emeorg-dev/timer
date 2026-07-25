"use client"

import { useEffect } from "react"

import { hasSystemModifierKey, isFormElementFocused } from "@/lib/dom-utils"

interface ShortcutHandlers {
  onPlayPause?: () => void
  onReset?: () => void
  onToggleMute?: () => void
  onToggleSound?: () => void
  onClear?: () => void
  onToggleSidebar?: () => void
}

/**
 * Escucha eventos de teclado globales y ejecuta acciones mapeadas.
 * Utiliza el patrón de Mapa de Acciones (Action Map / Diccionario) en lugar de sentencias switch,
 * cumpliendo con el Principio Abierto/Cerrado (OCP) y mejorando la claridad e historia del código.
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
    // Mapa declarativo que vincula cada tecla con la acción correspondiente del temporizador
    const actionMap: Record<string, (() => void) | undefined> = {
      p: onPlayPause,
      " ": onPlayPause,
      r: onReset,
      m: onToggleMute,
      s: onToggleSound,
      c: onToggleSidebar,
      escape: onClear,
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Si el usuario está escribiendo dentro de un campo de formulario, ignoramos los atajos
      if (isFormElementFocused()) return

      // 2. Si hay modificadores de sistema (Ctrl, Alt, Cmd) activos, permitimos su comportamiento nativo
      if (hasSystemModifierKey(e)) return

      // 3. Buscamos en nuestra historia de acciones si la tecla tiene un comando asignado
      const key = e.key.toLowerCase()
      const mappedAction = actionMap[key]

      // 4. Si encontramos la acción, evitamos el scroll/acción nativa y ejecutamos el comando
      if (mappedAction) {
        e.preventDefault()
        mappedAction()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onPlayPause, onReset, onToggleMute, onToggleSound, onClear, onToggleSidebar])
}
