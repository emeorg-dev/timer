"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { useAnnouncer } from "@/hooks/use-announcer"
import { useBackgroundMusic } from "@/hooks/use-background-music"
import { useMicrowaveInput } from "@/hooks/use-microwave-input"
import { useSettings } from "@/hooks/use-settings"
import { useShortcuts } from "@/hooks/use-shortcuts"
import { useSound } from "@/hooks/use-sound"
import { useSpeech } from "@/hooks/use-speech"
import { useTheme } from "@/hooks/use-theme"
import { useTimer } from "@/hooks/use-timer"
import { buildAnnouncement } from "@/lib/announcements"
import { InputParser } from "@/lib/core/input-parser"

const DEFAULT_INPUT_SEQUENCE = "1500"

type TimerAction = "start" | "pause" | "resume" | null

function selectTimerAction(
  status: ReturnType<typeof useTimer>["status"],
  durationSec: number
): TimerAction {
  if (status === "idle" && durationSec > 0) return "start"
  if (status === "running") return "pause"
  if (status === "paused") return "resume"
  return null
}

export function useVoiceTimerController() {
  const { settings, isReady, update } = useSettings()
  const { speak, cancel, unlock } = useSpeech()
  const { play } = useSound()
  const [inputSequence, setInputSequence] = useState(DEFAULT_INPUT_SEQUENCE)

  useTheme(settings.theme)

  const durationSec = useMemo(() => InputParser.parse(inputSequence), [inputSequence])
  const timer = useTimer(durationSec)

  useAnnouncer({
    remaining: timer.remaining,
    elapsed: timer.elapsed,
    status: timer.status,
  })

  useBackgroundMusic({
    status: timer.status,
    remaining: timer.remaining,
    durationSec,
  })

  const announceCompletion = useCallback(() => {
    const announcement = buildAnnouncement(0, settings.language, settings.announcementMode)
    speak(announcement, settings.language)
  }, [settings.announcementMode, settings.language, speak])

  const finishTimer = useCallback(() => {
    if (settings.soundEnabled) play("finish")
    if (settings.voiceEnabled) announceCompletion()
  }, [announceCompletion, play, settings.soundEnabled, settings.voiceEnabled])

  useEffect(() => {
    if (timer.status === "finished") finishTimer()
  }, [finishTimer, timer.status])

  const start = useCallback(() => {
    if (settings.voiceEnabled) unlock()
    if (settings.soundEnabled) play("start")
    timer.start()
  }, [play, settings.soundEnabled, settings.voiceEnabled, timer, unlock])

  const pause = useCallback(() => {
    if (settings.soundEnabled) play("pause")
    cancel()
    timer.pause()
  }, [cancel, play, settings.soundEnabled, timer])

  const resume = useCallback(() => {
    timer.resume()
  }, [timer])

  const reset = useCallback(() => {
    cancel()
    timer.reset()
  }, [cancel, timer])

  const playOrPause = useCallback(() => {
    const action = selectTimerAction(timer.status, durationSec)
    const actions: Record<Exclude<TimerAction, null>, () => void> = {
      start,
      pause,
      resume,
    }

    if (action) actions[action]()
  }, [durationSec, pause, resume, start, timer.status])

  const clearInput = useCallback(() => {
    if (timer.status === "idle") setInputSequence("")
  }, [timer.status])

  useShortcuts({
    onPlayPause: playOrPause,
    onReset: reset,
    onToggleMute: () => update("voiceEnabled", !settings.voiceEnabled),
    onToggleSound: () => update("soundEnabled", !settings.soundEnabled),
    onClear: clearInput,
  })

  useMicrowaveInput({
    isIdle: timer.status === "idle",
    durationSec,
    setInputSequence,
    handleStart: start,
  })

  const progress = durationSec > 0 ? (durationSec - timer.remaining) / durationSec : 0

  return {
    isReady,
    inputSequence,
    setInputSequence,
    clearInput,
    durationSec,
    progress,
    timer,
    actions: {
      start,
      pause,
      resume,
      reset,
    },
  }
}
