import { createLogger } from "../logger"
import { tryCatchSync } from "../try-catch"

import { duckingBus } from "./audio-ducking-bus"
import type { ISoundGenerator, SoundType } from "./interfaces"

const logger = createLogger("SoundEffectPlayer")

/**
 * Envoltura de orden superior que aplica atenuación temporal de volumen (Audio Ducking)
 * en la música de fondo mientras se ejecuta una melodía o efecto auditivo corto.
 *
 * @param durationSec Duración estimada del efecto de sonido para restaurar la ganancia al finalizar.
 * @param action Bloque síncrono que dispara la síntesis de los tonos en el AudioContext.
 */
function withAudioDucking(durationSec: number, action: () => void): void {
  duckingBus.requestDuck()
  action()
  setTimeout(() => {
    duckingBus.releaseDuck()
  }, durationSec * 1000)
}

/**
 * Reproductor y sintetizador procedimental de efectos de sonido in situ mediante la API Web Audio nativa.
 *
 * Genera melodías auditivas (como inicio, pausa y campanas de finalización) programando osciladores (`OscillatorNode`)
 * y envolventes de ganancia exponenciales en tiempo real sin requerir archivos de audio externos.
 * Incorpora recuperación automática del `AudioContext` cuando el navegador lo suspende por inactividad.
 */
export class SoundEffectPlayer implements ISoundGenerator {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      this.ctx = new AC()
    }
    return this.ctx
  }

  private synthesizeTone(freq: number, startDelay: number, duration: number): void {
    const ctx = this.getContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = freq
    osc.connect(gain)
    gain.connect(ctx.destination)

    const t0 = ctx.currentTime + startDelay
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
    osc.start(t0)
    osc.stop(t0 + duration)
  }

  private playStartMelody = (): void => {
    withAudioDucking(0.34, () => {
      this.synthesizeTone(660, 0, 0.15)
      this.synthesizeTone(880, 0.16, 0.18)
    })
  }

  private playPauseBeep = (): void => {
    withAudioDucking(0.18, () => {
      this.synthesizeTone(440, 0, 0.18)
    })
  }

  private playFinishChime = (): void => {
    withAudioDucking(0.81, () => {
      this.synthesizeTone(880, 0, 0.2)
      this.synthesizeTone(660, 0.22, 0.2)
      this.synthesizeTone(990, 0.46, 0.35)
    })
  }

  private playEmergencyBeep = (): void => {
    tryCatchSync(() => {
      const ctx = this.getContext()
      if (!ctx) return

      withAudioDucking(0.6, () => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.value = 523.25 // C5
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6)
        osc.stop(ctx.currentTime + 0.6)
      })

      logger.info("Pitido de emergencia reproducido con éxito")
    }, "Error al reproducir pitido de emergencia")
  }

  playTone(type: SoundType): void {
    const ctx = this.getContext()
    if (!ctx) return
    if (ctx.state === "suspended") void ctx.resume()

    // Diccionario declarativo que asocia cada evento del temporizador con su melodía descriptiva
    const soundActionMap: Record<SoundType, () => void> = {
      start: this.playStartMelody,
      pause: this.playPauseBeep,
      finish: this.playFinishChime,
      emergency: this.playEmergencyBeep,
    }

    const soundAction = soundActionMap[type]
    if (soundAction) {
      soundAction()
    }
  }
}
