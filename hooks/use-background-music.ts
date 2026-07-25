"use client"

import { useEffect, useRef } from "react"

import { useSettings } from "@/components/settings-provider"
import type { TimerStatus } from "@/hooks/use-timer"
import { AudioPlayer } from "@/lib/audio/audio-player"
import { BackgroundMusicController } from "@/lib/audio/background-music-controller"
import { SoundEffectPlayer } from "@/lib/audio/sound-effect-player"

/**
 * Parámetros reactivos del temporizador para el control dinámico de la música ambiental.
 */
interface UseBackgroundMusicProps {
  status: TimerStatus
  remaining: number
  durationSec: number
}

/**
 * Sincroniza la reproducción de la música de fondo y modula el tempo y volumen del audio ambiental.
 *
 * Orquesta un controlador independiente (`BackgroundMusicController`) que reacciona a los cambios
 * de estado del temporizador. Aumenta dinámicamente la velocidad de reproducción a medida que
 * se acerca el vencimiento para transmitir una noción auditiva de urgencia y progresión (Pacing),
 * integrándose de forma transparente al bus de atenuación (Audio Ducking) durante las locuciones.
 *
 * @param props Contiene el estado actual del temporizador, el tiempo restante y la duración total.
 *
 * @example
 * // En el componente principal VoiceTimer:
 * useBackgroundMusic({ status: "running", remaining: 120, durationSec: 300 });
 */
export function useBackgroundMusic({ status, remaining, durationSec }: UseBackgroundMusicProps) {
  const { settings } = useSettings()
  const controllerRef = useRef<BackgroundMusicController | null>(null)

  useEffect(() => {
    const player = new AudioPlayer()
    const sfx = new SoundEffectPlayer()
    controllerRef.current = new BackgroundMusicController(player, sfx)
    return () => {
      controllerRef.current?.destroy()
    }
  }, [])

  // Efecto 1: Control de pista y volumen (solo reacciona a cambios de configuración)
  useEffect(() => {
    const controller = controllerRef.current
    if (!controller) return
    controller.setTrack(settings.musicTrack)
    controller.setVolume(settings.musicVolume / 100)
  }, [settings.musicTrack, settings.musicVolume])

  // Efecto 2: Control de reproducción (start/pause/stop según estatus)
  useEffect(() => {
    const controller = controllerRef.current
    if (!controller) return

    const isRunning = status === "running" && settings.musicEnabled
    const isStopped = status === "idle" || status === "finished"
    const isPaused = status === "paused" || (status === "running" && !settings.musicEnabled)

    if (isRunning) {
      controller.start()
      return
    }

    if (isStopped) {
      controller.stop()
      return
    }

    if (isPaused) {
      controller.pause()
    }
  }, [status, settings.musicEnabled])

  // Efecto 3: Actualización de ritmo (limitar a cada 5s, o últimos 15s para evitar llamadas continuas)
  useEffect(() => {
    const controller = controllerRef.current
    if (!controller) return

    const isRunning = status === "running" && settings.musicEnabled
    if (!isRunning) return

    const isStartOfTimer = remaining === durationSec
    const isCriticalFinalSeconds = remaining <= 15
    const isRegularInterval = remaining % 5 === 0
    const shouldUpdatePace = isStartOfTimer || isCriticalFinalSeconds || isRegularInterval

    if (shouldUpdatePace) {
      controller.updatePace(remaining, durationSec)
    }
  }, [status, remaining, durationSec, settings.musicEnabled])
}
