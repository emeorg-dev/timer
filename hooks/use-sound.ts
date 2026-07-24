"use client"

import { useCallback } from "react"

import { GlobalAudioService } from "@/lib/audio/global-audio-service"
import type { SoundType } from "@/lib/audio/interfaces"

export function useSound() {
  const play = useCallback((type: SoundType) => {
    GlobalAudioService.getInstance().playTone(type)
  }, [])

  return { play }
}
