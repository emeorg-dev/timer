"use client"

import { useEffect, useRef } from "react"
import { useSettings } from "@/components/settings-provider"
import { BackgroundMusicController } from "@/lib/audio/background-music-controller"
import { AudioPlayer } from "@/lib/audio/audio-player"
import { SoundEffectPlayer } from "@/lib/audio/sound-effect-player"
import { TimerStatus } from "@/hooks/use-timer"

interface UseBackgroundMusicProps {
  status: TimerStatus
  remaining: number
  durationSec: number
}

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

  useEffect(() => {
    const controller = controllerRef.current
    if (!controller) return

    if (status === "running" && settings.musicEnabled) {
      controller.start()
      controller.updatePace(remaining, durationSec)
    } else if (status === "paused" || !settings.musicEnabled) {
      controller.pause()
    } else if (status === "idle" || status === "finished") {
      controller.stop()
    }
  }, [status, remaining, durationSec, settings.musicEnabled])
}
