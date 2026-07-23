import { createLogger } from "../logger"
import { tryCatchSync } from "../try-catch"

import { duckingBus } from "./audio-ducking-bus"
import type { ISoundGenerator, SoundType } from "./interfaces"

const logger = createLogger("SoundEffectPlayer")

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

  private tone(freq: number, startDelay: number, duration: number): void {
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

    // Ducking
    duckingBus.requestDuck()
    setTimeout(() => {
      duckingBus.releaseDuck()
    }, duration * 1000)
  }

  playTone(type: SoundType): void {
    const ctx = this.getContext()
    if (!ctx) return
    if (ctx.state === "suspended") void ctx.resume()

    switch (type) {
      case "start":
        this.tone(660, 0, 0.15)
        this.tone(880, 0.16, 0.18)
        break
      case "pause":
        this.tone(440, 0, 0.18)
        break
      case "finish":
        this.tone(880, 0, 0.2)
        this.tone(660, 0.22, 0.2)
        this.tone(990, 0.46, 0.35)
        break
      case "emergency":
        this.playEmergencyBeep()
        break
    }
  }

  private playEmergencyBeep(): void {
    tryCatchSync(() => {
      const ctx = this.getContext()
      if (!ctx) return

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = 523.25 // C5
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6)
      osc.stop(ctx.currentTime + 0.6)

      duckingBus.requestDuck()
      setTimeout(() => {
        duckingBus.releaseDuck()
      }, 600)

      logger.info("Pitido de emergencia reproducido con éxito")
    }, "Error al reproducir pitido de emergencia")
  }
}
