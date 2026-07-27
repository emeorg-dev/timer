"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"

import { useSettings } from "@/components/settings"

const GradientBackground = dynamic(
  () => import("@/components/gradient-background").then(mod => mod.GradientBackground),
  { ssr: false }
)
const SettingsSidebar = dynamic(
  () => import("@/components/settings").then(mod => mod.SettingsSidebar),
  { ssr: false }
)
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

import { TimerControls } from "./timer-controls"
import { TimerDisplay } from "./timer-display"

const PRESET_BUTTONS = [
  { label: "1m", seq: "0100" },
  { label: "5m", seq: "0500" },
  { label: "15m", seq: "1500" },
  { label: "25m", seq: "2500" },
] as const

function QuickPresets({
  onSelect,
  onClear,
}: {
  onSelect: (seq: string) => void
  onClear: () => void
}) {
  return (
    <div className="flex w-full max-w-md shrink-0 flex-wrap justify-center gap-2">
      {PRESET_BUTTONS.map(preset => (
        <Button
          key={preset.label}
          variant="outline"
          className="w-16 font-mono"
          onClick={() => onSelect(preset.seq)}
        >
          {preset.label}
        </Button>
      ))}
      <Button variant="ghost" className="w-16 text-muted-foreground" onClick={onClear}>
        CLR
      </Button>
    </div>
  )
}

/**
 * Orquestador Principal de la interfaz reactiva y del ciclo de vida del temporizador vocal.
 *
 * Sigue una arquitectura teatral y modular coordinando a los distintos actores del sistema:
 * - El Relojero (`useTimer`): Mide el tiempo con precisión absoluta mediante un motor independiente.
 * - El Guionista (`useAnnouncer`): Decide cuándo pronunciar locuciones durante la carrera.
 * - El DJ (`useBackgroundMusic`): Regula la música ambiental acelerando el ritmo al acercarse al final.
 * - El Director de Escena (`useEffect`): Reacciona al epílogo de la cuenta ejecutando sonidos y avisos finales.
 * - El Microondas (`useMicrowaveInput`): Procesa secuencias numéricas rápidas e intuitivas desde el teclado.
 */
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

  const handleTimerFinish = useCallback(() => {
    if (settings.soundEnabled) play("finish")
    if (settings.voiceEnabled) {
      speak(buildAnnouncement(0, settings.language, settings.announcementMode), settings.language)
    }
  }, [
    settings.soundEnabled,
    settings.voiceEnabled,
    settings.language,
    settings.announcementMode,
    play,
    speak,
  ])

  // 3. El Director de Escena (reacciona al final de la obra)
  useEffect(() => {
    if (timer.status === "finished") handleTimerFinish()
  }, [timer.status, handleTimerFinish])

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
    const canStart = timer.status === "idle" && durationSec > 0
    const isRunning = timer.status === "running"
    const isPaused = timer.status === "paused"

    if (canStart) return handleStart()
    if (isRunning) return handlePause()
    if (isPaused) return handleResume()
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

  // Teclado numérico microondas
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
          <QuickPresets onSelect={setInputSequence} onClear={() => setInputSequence("")} />
        )}
      </div>
    </main>
  )
}
