import { useEffect } from "react"

import { isFormElementFocused } from "@/lib/dom-utils"

/**
 * Parámetros para la gestión de la entrada numérica estilo microondas.
 */
interface UseMicrowaveInputProps {
  /** Indica si el temporizador está en reposo ('idle') para permitir la captura de teclado. */
  isIdle: boolean
  /** Duración total calculada (en segundos), evaluada al presionar Enter para autorizar el arranque. */
  durationSec: number
  /** Función actualizadora de estado para modificar la cadena visual de dígitos ingresados (HHMMSS). */
  setInputSequence: React.Dispatch<React.SetStateAction<string>>
  /** Callback ejecutado para iniciar inmediatamente la cuenta regresiva al presionar la tecla Enter. */
  handleStart: () => void
}

/**
 * Añade un nuevo dígito a la secuencia numérica estilo microondas, limitándola a un máximo de 6 dígitos (HHMMSS).
 *
 * @param prevSequence Secuencia de texto anterior que se muestra actualmente en el visor del temporizador.
 * @param digit Carácter numérico ingresado por teclado ('0' a '9').
 * @returns Nueva secuencia truncada por la derecha si supera los 6 caracteres máximos permitidos.
 */
function appendDigitToSequence(prevSequence: string, digit: string): string {
  const nextSequence = prevSequence === "0" ? digit : prevSequence + digit
  return nextSequence.length > 6 ? nextSequence.slice(-6) : nextSequence
}

/**
 * Elimina el último dígito ingresado de la secuencia actual al presionar la tecla Retroceso (Backspace).
 *
 * @param prevSequence Secuencia de texto actual en pantalla.
 * @returns Secuencia acortada en un carácter.
 */
function removeLastDigitFromSequence(prevSequence: string): string {
  return prevSequence.slice(0, -1)
}

/**
 * Orquesta la captura de entrada numérica rápida al estilo de un microondas de cocina tradicional.
 *
 * Escucha globalmente el teclado cuando el temporizador está inactivo (`idle`). Permite al usuario teclear
 * secuencias naturales como "130" para programar al instante 1 minuto y 30 segundos, agilizando drásticamente
 * el flujo de trabajo sin requerir clics del ratón ni navegación por menús selectores.
 *
 * @param props Objeto que contiene el estado de inactividad, la duración actual y manejadores de acción.
 *
 * @example
 * // En el componente de entrada o controles principal:
 * useMicrowaveInput({ isIdle: true, durationSec: 90, setInputSequence, handleStart });
 */
export function useMicrowaveInput({
  isIdle,
  durationSec,
  setInputSequence,
  handleStart,
}: UseMicrowaveInputProps) {
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
