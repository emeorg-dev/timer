"use client"

import { useCallback, useMemo } from "react"

import type { SoundType } from "@/lib/audio/interfaces"
import { SoundEffectPlayer } from "@/lib/audio/sound-effect-player"

export function useSound() {
  const player = useMemo(() => new SoundEffectPlayer(), [])

  const play = useCallback(
    (type: SoundType) => {
      player.playTone(type)
    },
    [player]
  )

  return { play }
}
