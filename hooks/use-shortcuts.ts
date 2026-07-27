"use client"

import { useEffect } from "react"

import { hasSystemModifierKey, isFormElementFocused } from "@/lib/dom-utils"

/**
 * Conjunto de manejadores de eventos asignados a los atajos de teclado del temporizador.
 */
interface ShortcutHandlers {
  /** Callback para alternar entre iniciar y pausar la cuenta regresiva. */
  onPlayPause?: () => void
  /** Callback para restablecer el temporizador a su duración original. */
  onReset?: () => void
  /** Callback para silenciar temporalmente los anuncios verbales y alertas sonoras. */
  onToggleMute?: () => void
  /** Callback para activar o desactivar la reproducción de efectos sonoros al completar hitos. */
  onToggleSound?: () => void
  /** Callback para limpiar la entrada numérica o cerrar diálogos activos al presionar Escape. */
  onClear?: () => void
  /** Callback para abrir o colapsar el panel lateral de configuración del sistema. */
  onToggleSidebar?: () => void
}

/**
 * Orquesta los atajos de teclado globales mediante un patrón declarativo de Mapa de Acciones (Action Map).
 *
 * Vincula teclas accesibles e intuitivas con las funciones principales del temporizador sin requerir el uso de ratón.
 * Cumple con el Principio Abierto/Cerrado (OCP), permitiendo registrar nuevos atajos fácilmente en un diccionario
 * centralizado sin modificar estructuras de control anidadas ni interferir cuando el foco está en inputs de texto.
 *
 * @param handlers Objeto que contiene las funciones de retorno (callbacks) para cada acción disponible.
 *
 * @example
 * // En el componente raíz de controles:
 * useShortcuts({ onPlayPause: handlePlayPause, onReset: handleReset });
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
      "{": onToggleSidebar,
      "[": onToggleSidebar,
      escape: onClear,
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // 0. Atajo con modificador de sistema (Ctrl/Cmd + {): alternar panel lateral en cualquier sistema operativo y teclado.
      // Se evalúa antes de isFormElementFocused y hasSystemModifierKey para garantizar el funcionamiento con teclas como '{' o '[' en PC/Mac/Español.
      const isCtrlOrCmd = e.ctrlKey || e.metaKey
      const isSidebarToggleKey = e.key === "{" || e.key === "[" || e.code === "BracketLeft"

      if (isCtrlOrCmd && isSidebarToggleKey && onToggleSidebar) {
        e.preventDefault()
        onToggleSidebar()
        return
      }

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
