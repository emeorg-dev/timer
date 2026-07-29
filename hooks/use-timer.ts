"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { TimerStatus } from "@/lib/core/timer-core"
import { TimerCore } from "@/lib/core/timer-core"

export type { TimerStatus }

/**
 * Orquesta el ciclo de vida del temporizador principal, conectando la lógica de negocio con React.
 *
 * Actúa como una capa adaptadora ligera (Thin Wrapper) sobre la máquina de estados independiente (`TimerCore`),
 * traduciendo eventos de alta frecuencia (`tick`, `statusChange`) a estados reactivos estables.
 * Mantiene la precisión temporal aislando `setInterval` en la capa central y proveyendo callbacks memoizados.
 *
 * @param durationSec Duración programada inicialmente para la sesión (en segundos).
 * @returns Un objeto inmutable con el tiempo restante, transcurrido, estado de ejecución y comandos de control.
 *
 * @example
 * const { status, remaining, start, pause, reset } = useTimer(300);
 */
export function useTimer(durationSec: number) {
  const [status, setStatus] = useState<TimerStatus>("idle")
  const [remaining, setRemaining] = useState(durationSec)
  const [elapsed, setElapsed] = useState(0)

  const timerRef = useRef<TimerCore | null>(null)

  useEffect(() => {
    const timer = new TimerCore(durationSec)
    timerRef.current = timer

    const unsubscribeStatus = timer.on("statusChange", newStatus => {
      setStatus(newStatus)
    })

    const unsubscribeTick = timer.on("tick", ({ remainingSec, elapsedSec }) => {
      setRemaining(remainingSec)
      setElapsed(elapsedSec)
    })

    return () => {
      unsubscribeStatus()
      unsubscribeTick()
      timer.destroy()
    }
  }, []) // Empty deps so it's a singleton per mount

  // Sync duration changes when idle
  useEffect(() => {
    if (timerRef.current && status === "idle") {
      timerRef.current.setDuration(durationSec)
      setRemaining(durationSec)
      setElapsed(0)
    }
  }, [durationSec, status])

  const start = useCallback(() => timerRef.current?.start(), [])
  const pause = useCallback(() => timerRef.current?.pause(), [])
  const resume = useCallback(() => timerRef.current?.resume(), [])
  const reset = useCallback(() => timerRef.current?.reset(), [])

  return {
    status,
    remaining,
    elapsed,
    duration: durationSec,
    start,
    pause,
    resume,
    reset,
  }
}
