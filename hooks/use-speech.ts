"use client"

import { useCallback, useEffect, useMemo } from "react"

import type { LangCode } from "@/lib/i18n"
import { SpeechOrchestrator } from "@/lib/speech/speech-orchestrator"

/** Wraps the SpeechOrchestrator to provide a React-friendly hook. */
let globalOrchestrator: SpeechOrchestrator | null = null

export function useSpeech() {
  const orchestrator = useMemo(() => {
    if (!globalOrchestrator) {
      globalOrchestrator = new SpeechOrchestrator()
    }
    return globalOrchestrator
  }, [])

  const unlock = useCallback(() => {
    orchestrator.unlock()
  }, [orchestrator])

  const speak = useCallback(
    (text: string, lang: LangCode) => {
      orchestrator.speak(text, lang)
    },
    [orchestrator]
  )

  const cancel = useCallback(() => {
    orchestrator.cancel()
  }, [orchestrator])

  return { speak, cancel, unlock }
}
