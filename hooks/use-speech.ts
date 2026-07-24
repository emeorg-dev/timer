"use client"

import { useCallback } from "react"

import { GlobalAudioService } from "@/lib/audio/global-audio-service"
import type { LangCode } from "@/lib/i18n"

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
