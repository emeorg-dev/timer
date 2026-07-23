"use client"

import { useEffect, useRef } from "react"
import { useSettings } from "@/components/settings-provider"
import { useSpeech } from "@/hooks/use-speech"
import { buildAnnouncement } from "@/lib/announcements"
import { createLogger } from "@/lib/logger"

const logger = createLogger("useAnnouncer")

interface UseAnnouncerProps {
  remaining: number
  elapsed: number
  status: "idle" | "running" | "paused" | "finished"
}

/**
 * El Guionista (Storytelling):
 * Observa el paso del tiempo y decide en qué momento exacto se debe hablar,
 * basándose en la configuración del usuario.
 * Utiliza matemáticas de bloques (ceil/floor) para garantizar que si el navegador
 * se congela y el tiempo da un salto, no nos perdamos el último anuncio.
 */
function isSmartMilestone(seconds: number): boolean {
  if (seconds <= 0) return false
  if (seconds <= 10) return true // cada segundo
  if (seconds <= 60) return seconds % 10 === 0 // cada 10 segundos
  if (seconds <= 1200) return seconds % 60 === 0 // cada 1 minuto
  return seconds % 1200 === 0 // cada 20 minutos
}

export function useAnnouncer({ remaining, elapsed, status }: UseAnnouncerProps) {
  const { settings } = useSettings()
  const { speak } = useSpeech()
  
  // Guardamos el último estado de tiempo anunciado.
  // Para el modo normal guarda el "bloque", para el modo inteligente guarda el segundo exacto.
  const lastAnnouncedRef = useRef<number | null>(null)

  useEffect(() => {
    if (status === "idle") {
      lastAnnouncedRef.current = null
      return
    }

    if (status !== "running") return
    if (!settings.voiceEnabled || settings.announcementInterval === 0) return

    const { announcementInterval, announcementMode, language } = settings

    if (announcementInterval === -1) {
      if (announcementMode !== "remaining") return

      const currentFloor = Math.floor(remaining)
      if (lastAnnouncedRef.current === null) {
        lastAnnouncedRef.current = currentFloor
        logger.info("Línea base inicial establecida (Smart)", { reference: currentFloor })
        return
      }

      if (currentFloor >= lastAnnouncedRef.current) {
        return
      }

      let crossedMilestone = -1
      for (let t = lastAnnouncedRef.current - 1; t >= currentFloor; t--) {
        if (isSmartMilestone(t)) {
          crossedMilestone = t
        }
      }

      if (crossedMilestone > 0) {
        logger.info("Umbral cruzado (Smart)", { remaining, boundaryToAnnounce: crossedMilestone })
        const text = buildAnnouncement(crossedMilestone, language, announcementMode, true)
        logger.debug("Llamando a speak()", { text, language })
        speak(text, language)
      }
      
      lastAnnouncedRef.current = currentFloor
      return
    }

    // Lógica original para intervalos fijos
    const currentBlock = announcementMode === "remaining"
      ? Math.ceil(remaining / announcementInterval)
      : Math.floor(elapsed / announcementInterval)

    if (lastAnnouncedRef.current === null) {
      lastAnnouncedRef.current = currentBlock
      const reference = announcementMode === "remaining" ? remaining : elapsed
      logger.info("Línea base inicial establecida", { currentBlock, reference, announcementInterval })
      return
    }

    const crossedThreshold = announcementMode === "remaining"
      ? currentBlock < lastAnnouncedRef.current
      : currentBlock > lastAnnouncedRef.current

    if (crossedThreshold) {
      const boundaryToAnnounce = currentBlock * announcementInterval

      logger.info("Umbral cruzado", {
        remaining,
        elapsed,
        boundaryToAnnounce,
        announcementMode,
        previousBlock: lastAnnouncedRef.current,
        newBlock: currentBlock
      })

      if (boundaryToAnnounce > 0) {
        const text = buildAnnouncement(boundaryToAnnounce, language, announcementMode, false)
        logger.debug("Llamando a speak()", { text, language })
        speak(text, language)
      }
      
      lastAnnouncedRef.current = currentBlock
    }
  }, [remaining, elapsed, status, settings, speak])
}
