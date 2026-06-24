"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type TimerStatus = "idle" | "running" | "paused" | "finished"

/**
 * Drift-free countdown timer built on timestamps + requestAnimationFrame.
 * Exposes the configured duration, remaining seconds and status.
 */
export function useTimer(durationSec: number) {

  const [status, setStatusState] = useState<TimerStatus>("idle")
  const statusRef = useRef<TimerStatus>("idle")
  const setStatus = useCallback((s: TimerStatus) => {
    statusRef.current = s
    setStatusState(s)
  }, [])

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
    // Si por alguna razón de concurrencia (Strict Mode) hay un loop huérfano, lo matamos.
    if (statusRef.current !== "running") return

    const msLeft = deadlineRef.current - Date.now()
    const secLeft = Math.max(0, Math.ceil(msLeft / 1000))

    if (secLeft !== lastWholeRef.current) {
      lastWholeRef.current = secLeft
      setRemaining(secLeft)
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
    if (statusRef.current !== "running") return
    stopLoop()
    const secLeft = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000))
    setRemaining(secLeft)
    setStatus("paused")
  }, [stopLoop, setStatus])

  const resume = useCallback(() => {
    if (statusRef.current !== "paused") return
    deadlineRef.current = Date.now() + remaining * 1000
    lastWholeRef.current = remaining
    stopLoop()
    rafRef.current = requestAnimationFrame(tick)
    setStatus("running")
  }, [remaining, tick, stopLoop, setStatus])

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
