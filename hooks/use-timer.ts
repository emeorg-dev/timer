"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type TimerStatus = "idle" | "running" | "paused" | "finished"

/**
 * Drift-free countdown timer built on timestamps + requestAnimationFrame.
 * Exposes the configured duration, remaining seconds and status.
 */
export function useTimer(durationSec: number) {

  const [status, setStatus] = useState<TimerStatus>("idle")
  const [remaining, setRemaining] = useState(durationSec)

  const deadlineRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)
  const lastWholeRef = useRef<number>(durationSec)
  const durationRef = useRef<number>(durationSec)

  // When the configured duration changes while idle, sync the display.
  useEffect(() => {
    if (status === "idle") {
      durationRef.current = durationSec
      lastWholeRef.current = durationSec
      setRemaining(durationSec)
    }
  }, [durationSec, status])

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    const msLeft = deadlineRef.current - Date.now()
    const secLeft = Math.max(0, Math.ceil(msLeft / 1000))
    setRemaining(secLeft)

    if (secLeft !== lastWholeRef.current) {
      lastWholeRef.current = secLeft
    }

    if (msLeft <= 0) {
      setStatus("finished")
      setRemaining(0)
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [stopLoop])

  const start = useCallback(() => {
    if (durationRef.current <= 0) return
    deadlineRef.current = Date.now() + durationRef.current * 1000
    lastWholeRef.current = durationRef.current
    setStatus("running")
    stopLoop()
    rafRef.current = requestAnimationFrame(tick)
  }, [stopLoop, tick])

  const pause = useCallback(() => {
    setStatus((s) => {
      if (s !== "running") return s
      stopLoop()
      // Freeze remaining based on deadline.
      const secLeft = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000))
      setRemaining(secLeft)
      return "paused"
    })
  }, [stopLoop])

  const resume = useCallback(() => {
    setStatus((s) => {
      if (s !== "paused") return s
      deadlineRef.current = Date.now() + remaining * 1000
      lastWholeRef.current = remaining
      rafRef.current = requestAnimationFrame(tick)
      return "running"
    })
  }, [remaining, tick])

  const reset = useCallback(() => {
    stopLoop()
    durationRef.current = durationSec
    lastWholeRef.current = durationSec
    setRemaining(durationSec)
    setStatus("idle")
  }, [durationSec, stopLoop])

  useEffect(() => stopLoop, [stopLoop])

  return {
    status,
    remaining,
    elapsed: durationRef.current - remaining,
    duration: durationRef.current,
    start,
    pause,
    resume,
    reset,
  }
}
