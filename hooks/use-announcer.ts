"use client"

import { useEffect, useMemo, useRef } from "react"

import type { AnnouncementMode } from "@/components/settings-provider"
import { useSettings } from "@/components/settings-provider"
import { useSpeech } from "@/hooks/use-speech"
import type { TimerStatus } from "@/hooks/use-timer"
import { AnnouncerEngine } from "@/lib/announcer/announcer-engine"
import { FixedIntervalStrategy } from "@/lib/announcer/fixed-interval-strategy"
import type { IAnnouncementStrategy } from "@/lib/announcer/interfaces"
import { SmartMilestoneStrategy } from "@/lib/announcer/smart-milestone-strategy"
import type { LangCode } from "@/lib/i18n"

interface UseAnnouncerProps {
  remaining: number
  elapsed: number
  status: TimerStatus
}

/**
 * Crea la estrategia de anuncios adecuada (Hitos Inteligentes o Intervalo Fijo) según la configuración del usuario.
 */
function createAnnouncementStrategy(
  interval: number,
  mode: AnnouncementMode,
  language: LangCode
): IAnnouncementStrategy {
  const isSmartMilestoneMode = interval === -1
  if (isSmartMilestoneMode) {
    return new SmartMilestoneStrategy(mode, language)
  }
  return new FixedIntervalStrategy(interval, mode, language)
}

/**
 * Hook que gestiona el motor de locución verbal, asignando estrategias de anuncio y evaluando el progreso en cada segundo.
 */
export function useAnnouncer({ remaining, elapsed, status }: UseAnnouncerProps) {
  const { settings } = useSettings()
  const speech = useSpeech()

  const engine = useMemo(
    () => new AnnouncerEngine(speech, settings.language),
    [speech, settings.language]
  )
  const strategyRef = useRef<IAnnouncementStrategy | null>(null)

  // Efecto 1: Seleccionar y vincular la estrategia de anuncio al iniciar el temporizador o al cambiar la configuración
  useEffect(() => {
    const isTimerIdle = status === "idle"
    if (isTimerIdle) {
      strategyRef.current = null
      engine.setStrategy(null)
      return
    }

    const isTimerRunning = status === "running"
    const isVoiceDisabled = !settings.voiceEnabled || settings.announcementInterval === 0
    if (!isTimerRunning || isVoiceDisabled) return

    if (!strategyRef.current) {
      strategyRef.current = createAnnouncementStrategy(
        settings.announcementInterval,
        settings.announcementMode,
        settings.language
      )
      engine.setStrategy(strategyRef.current)
    }
  }, [
    status,
    settings.voiceEnabled,
    settings.announcementInterval,
    settings.announcementMode,
    settings.language,
    engine,
  ])

  // Efecto 2: Evaluar segundo a segundo si la estrategia activa dicta pronunciar un anuncio por altavoz
  useEffect(() => {
    const isTimerRunning = status === "running"
    const isVoiceDisabled = !settings.voiceEnabled || settings.announcementInterval === 0
    if (!isTimerRunning || isVoiceDisabled) return

    engine.evaluate(remaining, elapsed)
  }, [remaining, elapsed, status, engine, settings.voiceEnabled, settings.announcementInterval])
}
