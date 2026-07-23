"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { TimerStatus } from "@/lib/core/timer-core"
import { TimerCore } from "@/lib/core/timer-core"

export type { TimerStatus }

/**
 * Thin wrapper over TimerCore to sync state with React.
 */
export function useTimer(durationSec: number) {
  const [status, setStatus] = useState<TimerStatus>("idle")
  const [remaining, setRemaining] = useState(durationSec)

  const timerRef = useRef<TimerCore | null>(null)

  useEffect(() => {
    const timer = new TimerCore(durationSec)
    timerRef.current = timer

    timer.onStatusChange = newStatus => {
      setStatus(newStatus)
    }

    timer.onTick = rem => {
      setRemaining(rem)
    }

    return () => {
      timer.destroy()
    }
  }, []) // Empty deps so it's a singleton per mount

  // Sync duration changes when idle
  useEffect(() => {
    if (timerRef.current && status === "idle") {
      timerRef.current.setDuration(durationSec)
      setRemaining(durationSec)
    }
  }, [durationSec, status])

  const start = useCallback(() => timerRef.current?.start(), [])
  const pause = useCallback(() => timerRef.current?.pause(), [])
  const resume = useCallback(() => timerRef.current?.resume(), [])
  const reset = useCallback(() => timerRef.current?.reset(), [])

  return {
    status,
    remaining,
    elapsed: durationSec - remaining,
    duration: durationSec,
    start,
    pause,
    resume,
    reset,
  }
}
