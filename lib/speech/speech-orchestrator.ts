import { duckingBus, type IAudioDucking } from "../audio/audio-ducking-bus"
import { createLogger } from "../logger"

import { CloudTTSService } from "./cloud-tts-service"
import type { IUnlockableSpeaker, IVoiceResolver } from "./interfaces"
import { isNativeSpeechSupported, VoiceResolver } from "./voice-resolver"

const logger = createLogger("SpeechOrchestrator")
const NATIVE_VOICE_TIMEOUT_MS = 2000
const UNLOCK_TIMEOUT_MS = 1500

/**
 * Resuelve el dialecto y acento exacto a utilizar comparando el idioma solicitado por la app
 * con las preferencias del sistema operativo y navegador web del usuario.
 *
 * @param requestedLang Idioma oficial configurado en el panel de la aplicación (ej. 'es-ES').
 * @returns Dialecto refinado (ej. 'es-MX' si el usuario opera en Latinoamérica y la UI está en español).
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

/**
 * Orquestador central de síntesis de voz con temporización de seguridad y conmutación automática de respaldo.
 *
 * Actúa como la fachada principal para la emisión de voz artificial en la aplicación. Si la Web Speech API
 * del navegador está bloqueada, ausente o no responde en 2000 milisegundos (`NATIVE_VOICE_TIMEOUT_MS`),
 * el orquestador cancela el intento nativo y transiciona imperceptiblemente hacia el servicio en nube (`CloudTTSService`),
 * garantizando que el usuario jamás pierda una alerta del temporizador.
 */
interface SpeechOrchestratorDependencies {
  resolver?: IVoiceResolver
  cloudFallback?: IUnlockableSpeaker
  ducking?: IAudioDucking
}

export class SpeechOrchestrator implements IUnlockableSpeaker {
  private resolver: IVoiceResolver
  private cloudFallback: IUnlockableSpeaker
  private ducking: IAudioDucking
  private pendingCallbacks: (() => void)[] = []
  private voicesLoaded = false
  private supported = false

  constructor(dependencies: SpeechOrchestratorDependencies = {}) {
    this.ducking = dependencies.ducking ?? duckingBus
    this.resolver = dependencies.resolver ?? new VoiceResolver()
    this.cloudFallback = dependencies.cloudFallback ?? new CloudTTSService(this.ducking)

    const canUseNativeSpeech = isNativeSpeechSupported()
    this.supported = canUseNativeSpeech

    if (canUseNativeSpeech) {
      this.setupVoices()
    }
  }

  private setupVoices(): void {
    const synth = window.speechSynthesis
    const markVoicesAsReady = () => this.markVoicesAsReady(synth.getVoices())

    synth.onvoiceschanged = markVoicesAsReady
    markVoicesAsReady()
  }

  private markVoicesAsReady(voices: SpeechSynthesisVoice[]): void {
    if (voices.length === 0 && !this.voicesLoaded) return

    this.voicesLoaded = true
    logger.debug("Voces nativas cargadas", { count: voices.length })
    this.processPending()
  }

  private processPending(): void {
    while (this.pendingCallbacks.length > 0) {
      const task = this.pendingCallbacks.shift()
      if (task) task()
    }
  }

  unlock(): void {
    if (!this.supported) return

    const synth = window.speechSynthesis
    const utterance = new SpeechSynthesisUtterance(" ")
    utterance.volume = 0
    synth.speak(utterance)

    this.cloudFallback.unlock()
  }

  speak(text: string, lang: string): void {
    if (!this.supported) {
      this.speakWithCloud(text, lang)
      return
    }

    const targetDialect = resolveTargetDialect(lang)
    const speakWhenReady = () => this.speakWithBestVoice(text, targetDialect)

    if (this.voicesLoaded) {
      speakWhenReady()
      return
    }

    this.waitForVoicesOrFallback(speakWhenReady, text, targetDialect)
  }

  private speakWithBestVoice(text: string, targetDialect: string): void {
    const nativeVoice = this.resolver.findBestVoice(targetDialect)

    if (!nativeVoice) {
      logger.warn("No se encontró voz nativa compatible, activando servicio Cloud TTS de respaldo")
      this.speakWithCloud(text, targetDialect)
      return
    }

    this.speakNative(text, nativeVoice, targetDialect)
  }

  private speakWithCloud(text: string, lang: string): void {
    this.cloudFallback.speak(text, lang)
  }

  private waitForVoicesOrFallback(
    speakWhenReady: () => void,
    text: string,
    targetDialect: string
  ): void {
    let hasAttemptedSpeech = false
    const executeOnceLoaded = () => {
      if (hasAttemptedSpeech) return
      hasAttemptedSpeech = true
      speakWhenReady()
    }

    this.pendingCallbacks.push(executeOnceLoaded)
    setTimeout(() => {
      if (hasAttemptedSpeech) return

      hasAttemptedSpeech = true
      logger.warn("Tiempo de espera agotado esperando voces nativas, activando Fallback en la nube")
      this.speakWithCloud(text, targetDialect)
    }, NATIVE_VOICE_TIMEOUT_MS)
  }

  private speakNative(text: string, voice: SpeechSynthesisVoice, lang: string): void {
    const synth = window.speechSynthesis
    const utterance = this.createUtterance(text, voice, lang)

    this.bindUtteranceLifecycle(utterance)
    synth.resume()
    synth.speak(utterance)
  }

  private createUtterance(
    text: string,
    voice: SpeechSynthesisVoice,
    lang: string
  ): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.voice = voice
    utterance.rate = 1
    utterance.pitch = 1
    return utterance
  }

  private bindUtteranceLifecycle(utterance: SpeechSynthesisUtterance): void {
    utterance.onstart = () => {
      this.ducking.requestDuck()
    }

    utterance.onend = () => {
      this.ducking.releaseDuck()
    }

    utterance.onerror = e => {
      this.ducking.releaseDuck()

      const isExpectedCancellation = e.error === "interrupted" || e.error === "canceled"
      if (isExpectedCancellation) return

      logger.error("Error nativo TTS en síntesis de voz", { error: e.error })
    }
  }

  cancel(): void {
    this.pendingCallbacks = []
    if (this.supported) {
      window.speechSynthesis.cancel()
    }
    this.cloudFallback.cancel()
  }
}
