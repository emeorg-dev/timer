"use client"

import { useEffect, useMemo, useRef } from "react"
import { useSettings } from "@/components/settings-provider"
import { useSpeech } from "@/hooks/use-speech"
import { AnnouncerEngine } from "@/lib/announcer/announcer-engine"
import { FixedIntervalStrategy } from "@/lib/announcer/fixed-interval-strategy"
import { SmartMilestoneStrategy } from "@/lib/announcer/smart-milestone-strategy"
import { TimerStatus } from "@/hooks/use-timer"
import { IAnnouncementStrategy } from "@/lib/announcer/interfaces"

interface UseAnnouncerProps {
  remaining: number
  elapsed: number
  status: TimerStatus
}

export function useAnnouncer({ remaining, elapsed, status }: UseAnnouncerProps) {
  const { settings } = useSettings()
  const speech = useSpeech()
  
  const engine = useMemo(() => new AnnouncerEngine(speech, settings.language), [settings.language])
  const strategyRef = useRef<IAnnouncementStrategy | null>(null)

  useEffect(() => {
    if (status === "idle") {
      strategyRef.current = null
      engine.setStrategy(null)
      return
    }

    if (status !== "running") return
    if (!settings.voiceEnabled || settings.announcementInterval === 0) return

    if (!strategyRef.current) {
      const { announcementInterval, announcementMode, language } = settings
      if (announcementInterval === -1) {
        strategyRef.current = new SmartMilestoneStrategy(announcementMode, language)
      } else {
        strategyRef.current = new FixedIntervalStrategy(announcementInterval, announcementMode, language)
      }
      engine.setStrategy(strategyRef.current)
    }

  }, [status, settings.voiceEnabled, settings.announcementInterval, settings.announcementMode, settings.language, engine])
  
  useEffect(() => {
     if (status !== "running") return
     if (!settings.voiceEnabled || settings.announcementInterval === 0) return
     
     engine.evaluate(remaining, elapsed)
  }, [remaining, elapsed, status, engine, settings.voiceEnabled, settings.announcementInterval])
}
