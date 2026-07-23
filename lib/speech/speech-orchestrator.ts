import { duckingBus } from "../audio/audio-ducking-bus"
import { createLogger } from "../logger"

import { CloudTTSService } from "./cloud-tts-service"
import type { ISpeaker } from "./interfaces"
import { VoiceResolver } from "./voice-resolver"

const logger = createLogger("SpeechOrchestrator")
const NATIVE_VOICE_TIMEOUT_MS = 2000
const UNLOCK_TIMEOUT_MS = 1500

export class SpeechOrchestrator implements ISpeaker {
  private resolver: VoiceResolver
  private cloudFallback: CloudTTSService
  private pendingCallbacks: (() => void)[] = []
  private voicesLoaded = false
  private supported = false

  constructor() {
    this.resolver = new VoiceResolver()
    this.cloudFallback = new CloudTTSService()

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.supported = true
      this.setupVoices()
    }
  }

  private setupVoices(): void {
    const synth = window.speechSynthesis
    const loadVoices = () => {
      const voices = synth.getVoices()
      if (voices.length > 0 || this.voicesLoaded) {
        // if already loaded or has voices
        this.voicesLoaded = true
        logger.debug("Voces cargadas", { count: voices.length })
        this.processPending()
      }
    }
    synth.onvoiceschanged = loadVoices
    loadVoices()
  }

  private processPending(): void {
    while (this.pendingCallbacks.length > 0) {
      const task = this.pendingCallbacks.shift()
      if (task) task()
    }
  }

  unlock(): void {
    if (!this.supported) return
    const doUnlock = () => {
      const synth = window.speechSynthesis
      const utterance = new SpeechSynthesisUtterance(" ")
      utterance.volume = 0
      synth.speak(utterance)
      this.cloudFallback.unlock()
    }

    if (!this.voicesLoaded) {
      this.pendingCallbacks.push(doUnlock)
      setTimeout(doUnlock, UNLOCK_TIMEOUT_MS)
    } else {
      doUnlock()
    }
  }

  speak(text: string, lang: string): void {
    if (!this.supported) {
      return this.cloudFallback.speak(text, lang)
    }

    // Determine target dialect
    const baseUiLang = lang.split("-")[0]
    const userLanguage =
      typeof navigator !== "undefined" && navigator.languages && navigator.languages.length > 0
        ? navigator.languages[0]
        : typeof navigator !== "undefined"
          ? navigator.language
          : lang
    const baseUserLang = userLanguage.split("-")[0]
    const targetLang = baseUiLang === baseUserLang ? userLanguage : lang

    const executeTask = () => {
      const voice = this.resolver.findBestVoice(targetLang)
      if (!voice) {
        logger.warn("No se encontró voz nativa, activando Fallback")
        return this.cloudFallback.speak(text, targetLang)
      }

      this.speakNative(text, voice, targetLang)
    }

    if (!this.voicesLoaded) {
      let isResolved = false
      const taskWrapper = () => {
        if (isResolved) return
        isResolved = true
        executeTask()
      }
      this.pendingCallbacks.push(taskWrapper)

      setTimeout(() => {
        if (!isResolved) {
          isResolved = true
          logger.error("Timeout esperando voces, activando Fallback")
          this.cloudFallback.speak(text, targetLang)
        }
      }, NATIVE_VOICE_TIMEOUT_MS)
    } else {
      executeTask()
    }
  }

  private speakNative(text: string, voice: SpeechSynthesisVoice, lang: string): void {
    const synth = window.speechSynthesis
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.voice = voice
    utterance.rate = 1
    utterance.pitch = 1

    utterance.onstart = () => {
      duckingBus.requestDuck()
    }

    utterance.onend = () => {
      duckingBus.releaseDuck()
    }

    utterance.onerror = e => {
      if (e.error !== "interrupted" && e.error !== "canceled") {
        logger.error("Error nativo TTS", { error: e.error })
      }
      duckingBus.releaseDuck()
    }

    synth.resume()
    synth.speak(utterance)
  }

  cancel(): void {
    if (this.supported) {
      window.speechSynthesis.cancel()
    }
    this.cloudFallback.cancel()
  }
}
