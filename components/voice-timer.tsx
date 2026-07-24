"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { GradientBackground } from "@/components/GradientBackground"
import { useSettings } from "@/components/settings-provider"
import { SettingsSidebar } from "@/components/settings-sidebar"
import { TimerControls } from "@/components/timer-controls"
import { TimerDisplay } from "@/components/timer-display"
import { Button } from "@/components/ui/button"
import { useAnnouncer } from "@/hooks/use-announcer"
import { useBackgroundMusic } from "@/hooks/use-background-music"
import { useMicrowaveInput } from "@/hooks/use-microwave-input"
import { useShortcuts } from "@/hooks/use-shortcuts"
import { useSound } from "@/hooks/use-sound"
import { useSpeech } from "@/hooks/use-speech"
import { useTheme } from "@/hooks/use-theme"
import { useTimer } from "@/hooks/use-timer"
import { buildAnnouncement } from "@/lib/announcements"
import { InputParser } from "@/lib/core/input-parser"
export function VoiceTimer() {
  const { settings, isReady, update } = useSettings()
  useTheme(settings.theme)

  const { speak, cancel, unlock } = useSpeech()
  const { play } = useSound()

  // Time configuration (secuencia estilo microondas, por defecto 15:00)
  const [inputSequence, setInputSequence] = useState("1500")

  const durationSec = useMemo(() => {
    return InputParser.parse(inputSequence)
  }, [inputSequence])

  // 1. El Relojero (mide el tiempo)
  const timer = useTimer(durationSec)

  // 2. El Guionista (decide cuándo hablar durante la carrera)
  useAnnouncer({
    remaining: timer.remaining,
    elapsed: timer.elapsed,
    status: timer.status,
  })

  // 2.5 El DJ (música de fondo que acelera con el tiempo)
  useBackgroundMusic({
    status: timer.status,
    remaining: timer.remaining,
    durationSec,
  })

  // 3. El Director de Escena (reacciona al final de la obra)
  useEffect(() => {
    if (timer.status === "finished") {
      if (settings.soundEnabled) play("finish")
      if (settings.voiceEnabled) {
        speak(buildAnnouncement(0, settings.language, settings.announcementMode), settings.language)
      }
    }
  }, [timer.status, settings, play, speak])

  const handleStart = useCallback(() => {
    if (settings.voiceEnabled) unlock()
    if (settings.soundEnabled) play("start")
    timer.start()
  }, [settings.soundEnabled, settings.voiceEnabled, unlock, play, timer])

  const handlePause = useCallback(() => {
    if (settings.soundEnabled) play("pause")
    cancel()
    timer.pause()
  }, [settings.soundEnabled, play, cancel, timer])

  const handleResume = useCallback(() => {
    timer.resume()
  }, [timer])

  const handleReset = useCallback(() => {
    cancel()
    timer.reset()
  }, [cancel, timer])

  const handlePlayPause = useCallback(() => {
    if (timer.status === "idle" && durationSec > 0) {
      handleStart()
    } else if (timer.status === "running") {
      handlePause()
    } else if (timer.status === "paused") {
      handleResume()
    }
  }, [timer.status, durationSec, handleStart, handlePause, handleResume])

  useShortcuts({
    onPlayPause: handlePlayPause,
    onReset: handleReset,
    onToggleMute: () => update("voiceEnabled", !settings.voiceEnabled),
    onToggleSound: () => update("soundEnabled", !settings.soundEnabled),
    onClear: () => {
      if (timer.status === "idle") setInputSequence("")
    },
  })

  const lang = settings.language
  const isIdle = timer.status === "idle"
  const progress = durationSec > 0 ? (durationSec - timer.remaining) / durationSec : 0

  // Teclado numérico microondas (magia para PC)
  useMicrowaveInput({
    isIdle,
    durationSec,
    setInputSequence,
    handleStart,
  })

  if (!isReady) {
    return <div className="h-[100dvh] w-full bg-background" aria-hidden="true" />
  }

  return (
    <main className="relative flex h-[100dvh] w-full select-none overflow-hidden bg-background">
      <SettingsSidebar />

      {/* Main Content Area */}
      <div className="relative z-0 flex min-h-0 flex-1 flex-col items-center justify-center gap-[clamp(1rem,4vh,2.5rem)] px-4 py-4 transition-all duration-300">
        <GradientBackground status={timer.status} progress={progress} />

        <TimerDisplay
          remaining={timer.remaining}
          duration={timer.duration || durationSec}
          status={timer.status}
          inputValue={inputSequence}
          onInputChange={setInputSequence}
          onEnter={() => {
            if (durationSec > 0) handleStart()
          }}
        />

        <TimerControls
          status={timer.status}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onReset={handleReset}
        />

        {isIdle && (
          <div className="flex w-full max-w-md shrink-0 flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              className="w-16 font-mono"
              onClick={() => setInputSequence("0100")}
            >
              1m
            </Button>
            <Button
              variant="outline"
              className="w-16 font-mono"
              onClick={() => setInputSequence("0500")}
            >
              5m
            </Button>
            <Button
              variant="outline"
              className="w-16 font-mono"
              onClick={() => setInputSequence("1500")}
            >
              15m
            </Button>
            <Button
              variant="outline"
              className="w-16 font-mono"
              onClick={() => setInputSequence("2500")}
            >
              25m
            </Button>
            <Button
              variant="ghost"
              className="w-16 text-muted-foreground"
              onClick={() => setInputSequence("")}
            >
              CLR
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
