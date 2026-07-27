"use client"

import { useEffect, useMemo, useRef } from "react"

import type { AnnouncementMode } from "@/components/settings"
import { useSettings } from "@/components/settings"
import { useSpeech } from "@/hooks/use-speech"
import type { TimerStatus } from "@/hooks/use-timer"
import { AnnouncerEngine } from "@/lib/announcer/announcer-engine"
import { FixedIntervalStrategy } from "@/lib/announcer/fixed-interval-strategy"
import type { IAnnouncementStrategy } from "@/lib/announcer/interfaces"
import { SmartMilestoneStrategy } from "@/lib/announcer/smart-milestone-strategy"
import type { LangCode } from "@/lib/i18n"

/**
 * Parámetros de entrada para el seguimiento auditivo del temporizador en tiempo real.
 */
interface UseAnnouncerProps {
  remaining: number
  elapsed: number
  status: TimerStatus
}

/**
 * Crea la estrategia algorítmica de locución verbal según las preferencias seleccionadas por el usuario.
 *
 * Evalúa si el usuario solicita un intervalo fijo tradicional (`FixedIntervalStrategy`) o el sistema dinámico
 * de Hitos Inteligentes (`SmartMilestoneStrategy`), el cual incrementa la frecuencia de avisos en los
 * últimos segundos críticos para aumentar la noción temporal sin saturar al usuario.
 *
 * @param interval Frecuencia seleccionada (en segundos). Si es `-1`, activa el modo Inteligente.
 * @param mode Modo de referencia de conteo ('remaining' para tiempo restante o 'elapsed' para transcurrido).
 * @param language Dialecto e idioma oficial de la locución (ej. 'es-ES', 'en-US').
 * @returns Instancia de la estrategia de anuncio lista para ser evaluada por el motor central.
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
 * Orquesta la narración vocal y los avisos auditivos del temporizador en tiempo real.
 *
 * Conecta el estado reactivo de la interfaz (React) con el motor central de anuncios (`AnnouncerEngine`),
 * garantizando que en cada segundo transcurrido se evalúe si se ha cruzado un umbral de tiempo relevante
 * para emitir una locución sin bloquear el hilo principal ni provocar renders innecesarios.
 *
 * @param props Objeto que contiene el tiempo restante, transcurrido y el estado activo del temporizador.
 *
 * @example
 * // En el componente principal VoiceTimer:
 * useAnnouncer({ remaining: 300, elapsed: 0, status: "running" });
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

    const strategy = createAnnouncementStrategy(
      settings.announcementInterval,
      settings.announcementMode,
      settings.language
    )
    strategyRef.current = strategy
    engine.setStrategy(strategy)
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
