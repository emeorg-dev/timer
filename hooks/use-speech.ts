"use client"

import { useCallback } from "react"

import { GlobalAudioService } from "@/lib/audio/global-audio-service"
import type { LangCode } from "@/lib/i18n"

/**
 * Proporciona control reactivo sobre el motor nativo y de respaldo de síntesis de voz (TTS).
 *
 * Facilita a los componentes visuales la emisión de anuncios hablados, cancelación de locuciones en curso
 * y el desbloqueo del contexto de audio en navegadores web (especialmente en dispositivos móviles).
 *
 * @returns Objeto con métodos memoizados: `speak(text, lang)`, `cancel()` y `unlock()`.
 *
 * @example
 * const { speak, unlock } = useSpeech();
 * unlock(); // Al primer clic del usuario
 * speak("Iniciando temporizador", "es-ES");
 */
export function useSpeech() {
  const service = GlobalAudioService.getInstance()

  const unlock = useCallback(() => {
    service.unlockSpeech()
  }, [])

  const speak = useCallback((text: string, lang: LangCode) => {
    service.speak(text, lang)
  }, [])

  const cancel = useCallback(() => {
    service.cancelSpeech()
  }, [])

  return { speak, cancel, unlock }
}
