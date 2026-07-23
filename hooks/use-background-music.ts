"use client"

import { useEffect, useRef } from "react"
import { useSettings } from "@/components/settings-provider"
import { useSound } from "./use-sound"

type TimerStatus = "idle" | "running" | "paused" | "finished"

interface UseBackgroundMusicProps {
  status: TimerStatus
  remaining: number
  durationSec: number
}

export function useBackgroundMusic({ status, remaining, durationSec }: UseBackgroundMusicProps) {
  const { settings } = useSettings()
  const { play } = useSound()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Ref para trackear si ya cruzamos un umbral para evitar que suene la alerta múltiples veces
  const currentStage = useRef<number>(0)
  
  // Ref para el volumen base y el estado de ducking (cuando suena otra alerta)
  const isDucking = useRef<boolean>(false)
  const BASE_VOLUME = 0.4
  const DUCK_VOLUME = 0.1

  useEffect(() => {
    if (typeof window !== "undefined" && !audioRef.current) {
      const audio = new Audio("/bg-music.ogg")
      audio.loop = true
      // @ts-ignore: preservesPitch no está completamente tipado en algunas versiones de TS
      audio.preservesPitch = false
      audio.volume = BASE_VOLUME
      audioRef.current = audio
    }

    const handleDucking = (e: Event) => {
      isDucking.current = (e as CustomEvent).detail
      if (audioRef.current) {
        audioRef.current.volume = isDucking.current ? DUCK_VOLUME : BASE_VOLUME
      }
    }

    window.addEventListener("audio-ducking", handleDucking)

    return () => {
      window.removeEventListener("audio-ducking", handleDucking)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!audioRef.current) return
    const audio = audioRef.current

    // Solo reproducir si está habilitado y corriendo
    if (status === "running" && settings.musicEnabled) {
      if (audio.paused) {
        audio.play().catch(e => console.error("Error reproduciendo música de fondo", e))
      }
      
      // Calcular porcentaje restante
      const percentage = durationSec > 0 ? (remaining / durationSec) * 100 : 0
      
      let targetRate = 1.0
      let stage = 1

      if (percentage <= 5 || (remaining <= 15 && durationSec > 30)) { // 5% o últimos 15s (Fase crítica)
        targetRate = 1.5
        stage = 4
      } else if (percentage <= 25) { // 25% (Fase 3)
        targetRate = 1.3
        stage = 3
      } else if (percentage <= 50) { // 50% (Fase 2)
        targetRate = 1.15
        stage = 2
      }

      // Si cambiamos a una etapa superior y no es el arranque (0 a 1), reproducir pitido/alerta
      if (stage > currentStage.current && currentStage.current !== 0) {
        play("emergency") // Usamos el sonido de emergencia como alerta de cambio de etapa
      }
      
      // Actualizar stage y velocidad
      currentStage.current = stage
      audio.playbackRate = targetRate
      
    } else {
      if (!audio.paused) {
        audio.pause()
      }
      // Al reiniciar o finalizar, reseteamos la etapa y el tiempo
      if (status === "idle" || status === "finished") {
         audio.currentTime = 0
         currentStage.current = 0
         audio.playbackRate = 1.0
      }
    }
  }, [status, remaining, durationSec, settings.musicEnabled, play])
}
