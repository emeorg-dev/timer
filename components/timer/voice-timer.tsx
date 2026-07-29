"use client"

import dynamic from "next/dynamic"

const GradientBackground = dynamic(
  () => import("@/components/gradient-background").then(mod => mod.GradientBackground),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 -z-10 bg-background transition-opacity duration-1000" />
    ),
  }
)
const SettingsSidebar = dynamic(
  () => import("@/components/settings").then(mod => mod.SettingsSidebar),
  {
    ssr: false,
    loading: () => (
      <div className="absolute left-0 top-0 z-40 flex h-14 w-[60px] items-center justify-center">
        <div className="size-9 rounded-full bg-secondary/30 animate-pulse" />
      </div>
    ),
  }
)
import { useVoiceTimerController } from "@/hooks/use-voice-timer-controller"

import { QuickPresets } from "./quick-presets"
import { TimerControls } from "./timer-controls"
import { TimerDisplay } from "./timer-display"

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
  const controller = useVoiceTimerController()
  const { timer, actions } = controller

  if (!controller.isReady) {
    return <div className="h-[100dvh] w-full bg-background" aria-hidden="true" />
  }

  return (
    <main className="relative flex h-[100dvh] w-full select-none overflow-hidden bg-background">
      <SettingsSidebar />

      {/* Main Content Area */}
      <div className="relative z-0 flex min-h-0 flex-1 flex-col items-center justify-center gap-[clamp(1rem,4vh,2.5rem)] px-4 py-4 transition-all duration-300">
        <GradientBackground status={timer.status} progress={controller.progress} />

        <TimerDisplay
          remaining={timer.remaining}
          duration={timer.duration || controller.durationSec}
          status={timer.status}
          inputValue={controller.inputSequence}
          onInputChange={controller.setInputSequence}
          onEnter={() => {
            if (controller.durationSec > 0) actions.start()
          }}
        />

        <TimerControls
          status={timer.status}
          onStart={actions.start}
          onPause={actions.pause}
          onResume={actions.resume}
          onReset={actions.reset}
        />

        {timer.status === "idle" && (
          <QuickPresets onSelect={controller.setInputSequence} onClear={controller.clearInput} />
        )}
      </div>
    </main>
  )
}
