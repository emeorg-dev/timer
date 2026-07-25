import { useEffect } from "react"

import { isFormElementFocused } from "@/lib/dom-utils"

/**
 * Añade un nuevo dígito a la secuencia numérica estilo microondas, limitándola a un máximo de 6 dígitos.
 */
function appendDigitToSequence(prevSequence: string, digit: string): string {
  const nextSequence = prevSequence === "0" ? digit : prevSequence + digit
  return nextSequence.length > 6 ? nextSequence.slice(-6) : nextSequence
}

/**
 * Elimina el último dígito ingresado de la secuencia actual.
 */
function removeLastDigitFromSequence(prevSequence: string): string {
  return prevSequence.slice(0, -1)
}

/**
 * Hook que gestiona la entrada de dígitos estilo microondas cuando el temporizador está inactivo.
 */
export function useMicrowaveInput({
  isIdle,
  durationSec,
  setInputSequence,
  handleStart,
}: {
  isIdle: boolean
  durationSec: number
  setInputSequence: React.Dispatch<React.SetStateAction<string>>
  handleStart: () => void
}) {
  useEffect(() => {
    // Si el temporizador no está en su estado inicial (idle), no escuchamos entradas numéricas
    if (!isIdle) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Si el usuario tiene el foco en un campo de texto o selector, dejamos que el DOM actúe
      if (isFormElementFocused()) return

      const isDigitKey = e.key >= "0" && e.key <= "9"
      const isBackspaceKey = e.key === "Backspace"
      const isEnterKey = e.key === "Enter"

      // 2. Si presionó un número, lo añadimos a la secuencia visual del microondas
      if (isDigitKey) {
        setInputSequence(prev => appendDigitToSequence(prev, e.key))
        return
      }

      // 3. Si presionó retroceso, eliminamos el último dígito ingresado
      if (isBackspaceKey) {
        setInputSequence(prev => removeLastDigitFromSequence(prev))
        return
      }

      // 4. Si presionó Enter, comprobamos si ya hay un tiempo programado para iniciar la cuenta
      if (isEnterKey) {
        e.preventDefault()
        const canStartTimer = durationSec > 0
        if (canStartTimer) {
          handleStart()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isIdle, durationSec, handleStart, setInputSequence])
}
