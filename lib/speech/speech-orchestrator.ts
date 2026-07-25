import { duckingBus } from "../audio/audio-ducking-bus"
import { createLogger } from "../logger"

import { CloudTTSService } from "./cloud-tts-service"
import type { ISpeaker } from "./interfaces"
import { isNativeSpeechSupported, VoiceResolver } from "./voice-resolver"

const logger = createLogger("SpeechOrchestrator")
const NATIVE_VOICE_TIMEOUT_MS = 2000
const UNLOCK_TIMEOUT_MS = 1500

/**
 * Resuelve el dialecto y acento exacto a utilizar comparando el idioma solicitado por la app
 * con las preferencias del sistema operativo y navegador web del usuario.
 */
function resolveTargetDialect(requestedLang: string): string {
  const baseUiLang = requestedLang.split("-")[0]
  const userLanguage =
    typeof navigator !== "undefined" && navigator.languages && navigator.languages.length > 0
      ? navigator.languages[0]
      : typeof navigator !== "undefined"
        ? navigator.language
        : requestedLang
  const baseUserLang = userLanguage.split("-")[0]

  return baseUiLang === baseUserLang ? userLanguage : requestedLang
}

export class SpeechOrchestrator implements ISpeaker {
  private resolver: VoiceResolver
  private cloudFallback: CloudTTSService
  private pendingCallbacks: (() => void)[] = []
  private voicesLoaded = false
  private supported = false

  constructor() {
    this.resolver = new VoiceResolver()
    this.cloudFallback = new CloudTTSService()

    const canUseNativeSpeech = isNativeSpeechSupported()
    this.supported = canUseNativeSpeech

    if (canUseNativeSpeech) {
      this.setupVoices()
    }
  }

  private setupVoices(): void {
    const synth = window.speechSynthesis
    const loadVoices = () => {
      const availableVoices = synth.getVoices()
      const hasDetectedVoices = availableVoices.length > 0
      const isSpeechEngineReady = hasDetectedVoices || this.voicesLoaded

      if (!isSpeechEngineReady) return

      this.voicesLoaded = true
      logger.debug("Voces nativas cargadas", { count: availableVoices.length })
      this.processPending()
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
    const executeUnlock = () => {
      const synth = window.speechSynthesis
      const utterance = new SpeechSynthesisUtterance(" ")
      utterance.volume = 0
      synth.speak(utterance)
      this.cloudFallback.unlock()
    }

    if (this.voicesLoaded) {
      executeUnlock()
      return
    }

    let hasUnlocked = false
    const unlockOnceLoaded = () => {
      if (hasUnlocked) return
      hasUnlocked = true
      executeUnlock()
    }
    this.pendingCallbacks.push(unlockOnceLoaded)
    setTimeout(unlockOnceLoaded, UNLOCK_TIMEOUT_MS)
  }

  speak(text: string, lang: string): void {
    if (!this.supported) {
      return this.cloudFallback.speak(text, lang)
    }

    const targetDialect = resolveTargetDialect(lang)

    const attemptNativeSpeech = () => {
      const nativeVoice = this.resolver.findBestVoice(targetDialect)
      if (!nativeVoice) {
        logger.warn(
          "No se encontró voz nativa compatible, activando servicio Cloud TTS de respaldo"
        )
        return this.cloudFallback.speak(text, targetDialect)
      }

      this.speakNative(text, nativeVoice, targetDialect)
    }

    if (this.voicesLoaded) {
      attemptNativeSpeech()
      return
    }

    // Si las voces del sistema aún se están cargando asíncronamente en segundo plano:
    let hasAttemptedSpeech = false
    const executeOnceLoaded = () => {
      if (hasAttemptedSpeech) return
      hasAttemptedSpeech = true
      attemptNativeSpeech()
    }

    this.pendingCallbacks.push(executeOnceLoaded)

    setTimeout(() => {
      if (!hasAttemptedSpeech) {
        hasAttemptedSpeech = true
        logger.warn(
          "Tiempo de espera agotado esperando voces nativas, activando Fallback en la nube"
        )
        this.cloudFallback.speak(text, targetDialect)
      }
    }, NATIVE_VOICE_TIMEOUT_MS)
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
      duckingBus.releaseDuck()

      const isExpectedCancellation = e.error === "interrupted" || e.error === "canceled"
      if (isExpectedCancellation) return

      logger.error("Error nativo TTS en síntesis de voz", { error: e.error })
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
