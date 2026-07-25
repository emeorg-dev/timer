"use client"

import { useCallback, useMemo } from "react"

import { GlobalAudioService } from "@/lib/audio/global-audio-service"
import type { SoundType } from "@/lib/audio/interfaces"

/**
 * Proporciona acceso reactivo al reproductor de efectos de sonido en la interfaz de usuario.
 *
 * Conecta los componentes de React con el servicio global de audio (`GlobalAudioService`),
 * exponiendo callbacks memoizados que evitan renders innecesarios al reproducir pitidos o melodías.
 *
 * @returns Un objeto con la función `play(type)` para reproducir tonos (ej. 'start', 'finish').
 *
 * @example
 * const { play } = useSound();
 * play("emergency");
 */
export function useSound() {
  const play = useCallback((type: SoundType) => {
    GlobalAudioService.getInstance().playTone(type)
  }, [])

  return useMemo(() => ({ play }), [play])
}
