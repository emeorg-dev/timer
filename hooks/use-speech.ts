"use client"

import { useMemo, useCallback, useEffect } from "react"
import type { LangCode } from "@/lib/i18n"
import { SpeechOrchestrator } from "@/lib/speech/speech-orchestrator"

/** Wraps the SpeechOrchestrator to provide a React-friendly hook. */
export function useSpeech() {
  const orchestrator = useMemo(() => new SpeechOrchestrator(), [])

  const unlock = useCallback(() => {
    orchestrator.unlock()
  }, [orchestrator])

  const speak = useCallback((text: string, lang: LangCode) => {
    orchestrator.speak(text, lang)
  }, [orchestrator])

  const cancel = useCallback(() => {
    orchestrator.cancel()
  }, [orchestrator])

  useEffect(() => {
    return () => {
      orchestrator.cancel()
    }
  }, [orchestrator])

  return { speak, cancel, unlock }
}
