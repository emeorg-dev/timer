"use client"

import { useMemo, useCallback } from "react"
import { SoundEffectPlayer } from "@/lib/audio/sound-effect-player"
import { SoundType } from "@/lib/audio/interfaces"

export function useSound() {
  const player = useMemo(() => new SoundEffectPlayer(), [])

  const play = useCallback((type: SoundType) => {
    player.playTone(type)
  }, [player])

  return { play }
}
