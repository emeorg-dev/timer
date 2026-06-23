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
export function useAnnouncer({ remaining, elapsed, status }: UseAnnouncerProps) {
  const { settings } = useSettings()
  const { speak } = useSpeech()
  
  // Guardamos el último "bloque" de tiempo anunciado para detectar cruces de umbral
  const lastAnnouncedRef = useRef<number | null>(null)

  useEffect(() => {
    // Si el temporizador se reinicia, olvidamos el último anuncio
    if (status === "idle") {
      lastAnnouncedRef.current = null
      return
    }

    if (status !== "running") return
    if (!settings.voiceEnabled || settings.announcementInterval <= 0) return

    const { announcementInterval, announcementMode, language } = settings

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
        const text = buildAnnouncement(boundaryToAnnounce, language, announcementMode)
        logger.debug("Llamando a speak()", { text, language })
        speak(text, language)
      }
      
      lastAnnouncedRef.current = currentBlock
    }
  }, [remaining, elapsed, status, settings, speak])
}
