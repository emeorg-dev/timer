import { tryCatchSync } from "../try-catch"
import { createLogger } from "../logger"
import { ISpeaker } from "./interfaces"
import { duckingBus } from "../audio/audio-ducking-bus"

const logger = createLogger("CloudTTSService")

export class CloudTTSService implements ISpeaker {
  private audio: HTMLAudioElement | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.audio = new Audio()
    }
  }

  unlock(): void {
    if (!this.audio) return
    tryCatchSync(() => {
      // Reproduce 1 segundo de silencio absoluto en base64
      this.audio!.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"
      this.audio!.play().catch(() => {})
      logger.debug("Cloud Audio desbloqueado")
    }, "Error intentando desbloquear Cloud Audio")
  }

  speak(text: string, lang: string): void {
    if (!this.audio) return

    logger.info("Activando Cloud TTS (vía Proxy Interno)", { text, lang })
    this.audio.src = `/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`
    
    this.audio.onended = () => {
      this.cleanup()
    }

    this.audio.onerror = () => {
      this.cleanup()
      logger.error("Cloud TTS falló")
    }

    duckingBus.requestDuck()
    this.audio.play().catch((e) => {
      logger.error("Cloud TTS Promise bloqueada", { error: e })
      this.cleanup()
    })
  }

  cancel(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause()
      this.cleanup()
    }
  }

  private cleanup(): void {
    if (this.audio) {
      this.audio.onended = null
      this.audio.onerror = null
    }
    duckingBus.releaseDuck()
  }
}
