"use client"

import { useCallback, useRef } from "react"
import { tryCatchSync } from "../lib/try-catch"
import { createLogger } from "../lib/logger"

const logger = createLogger("useSound")

type SoundType = "start" | "pause" | "finish" | "emergency"

/**
 * Sonido de emergencia standalone (fuera de React) 
 * por si la Nube bloquea la conexión o no hay internet.
 */
export const playEmergencyBeep = () => {
  tryCatchSync(() => {
    const AC = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    const ctx = new AC()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = 523.25 // C5 (Tono de aviso)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6)
    osc.stop(ctx.currentTime + 0.6)
    
    // Ducking
    window.dispatchEvent(new CustomEvent("audio-ducking", { detail: true }))
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("audio-ducking", { detail: false }))
    }, 600)
    
    logger.info("Pitido de emergencia reproducido con éxito")
  }, "Error al reproducir pitido de emergencia")
}

/**
 * Generates simple cue tones with the Web Audio API so no audio assets
 * need to be bundled. Each cue is a short sequence of sine beeps.
 */
export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (typeof window === "undefined") return null
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctxRef.current = new AC()
    }
    return ctxRef.current
  }, [])

  const tone = useCallback(
    (ctx: AudioContext, freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = freq
      osc.connect(gain)
      gain.connect(ctx.destination)
      const t0 = ctx.currentTime + start
      gain.gain.setValueAtTime(0.0001, t0)
      gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
      osc.start(t0)
      osc.stop(t0 + duration)
      
      // Ducking de la música de fondo durante el sonido
      window.dispatchEvent(new CustomEvent("audio-ducking", { detail: true }))
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("audio-ducking", { detail: false }))
      }, duration * 1000)
    },
    [],
  )

  const play = useCallback(
    (type: SoundType) => {
      const ctx = getCtx()
      if (!ctx) return
      if (ctx.state === "suspended") void ctx.resume()

      switch (type) {
        case "start":
          tone(ctx, 660, 0, 0.15)
          tone(ctx, 880, 0.16, 0.18)
          break
        case "pause":
          tone(ctx, 440, 0, 0.18)
          break
        case "finish":
          tone(ctx, 880, 0, 0.2)
          tone(ctx, 660, 0.22, 0.2)
          tone(ctx, 990, 0.46, 0.35)
          break
        case "emergency":
          tone(ctx, 523.25, 0, 0.6)
          break
      }
    },
    [getCtx, tone],
  )

  return { play }
}
