import type { LangCode } from "../i18n"
import { SpeechOrchestrator } from "../speech/speech-orchestrator"

import type { AudioDuckingBus } from "./audio-ducking-bus"
import { duckingBus } from "./audio-ducking-bus"
import type { SoundType } from "./interfaces"
import { SoundEffectPlayer } from "./sound-effect-player"

/**
 * Fachada centralizada y punto de acceso único (Singleton) para todos los servicios acústicos de la aplicación.
 *
 * Coordina la síntesis de voz (`SpeechOrchestrator`), los efectos de sonido (`SoundEffectPlayer`) y el bus de
 * atenuación (`AudioDuckingBus`), aplicando inicialización perezosa (Lazy Loading) para evitar instanciar contextos
 * de audio antes de que el usuario interactúe con el documento (cumpliendo con las políticas de Autoplay del navegador).
 */
export class GlobalAudioService {
  private static instance: GlobalAudioService | null = null

  private _speechOrchestrator: SpeechOrchestrator | null = null
  private _soundEffectPlayer: SoundEffectPlayer | null = null

  private constructor() {
    // Inicialización perezosa (Lazy load): instanciamos solo al invocar
  }

  private get speechOrchestrator(): SpeechOrchestrator {
    if (!this._speechOrchestrator) {
      this._speechOrchestrator = new SpeechOrchestrator()
    }
    return this._speechOrchestrator
  }

  private get soundEffectPlayer(): SoundEffectPlayer {
    if (!this._soundEffectPlayer) {
      this._soundEffectPlayer = new SoundEffectPlayer()
    }
    return this._soundEffectPlayer
  }

  /**
   * Obtiene la instancia única e inmutable del servicio global de audio (Patrón Singleton).
   *
   * @returns Instancia singleton de `GlobalAudioService`.
   */
  public static getInstance(): GlobalAudioService {
    if (!GlobalAudioService.instance) {
      GlobalAudioService.instance = new GlobalAudioService()
    }
    return GlobalAudioService.instance
  }

  public get duckingBus(): AudioDuckingBus {
    return duckingBus
  }

  // --- Sound Effects ---
  public playTone(type: SoundType): void {
    this.soundEffectPlayer.playTone(type)
  }

  // --- Speech ---
  public unlockSpeech(): void {
    this.speechOrchestrator.unlock()
  }

  public speak(text: string, lang: LangCode): void {
    this.speechOrchestrator.speak(text, lang)
  }

  public cancelSpeech(): void {
    this.speechOrchestrator.cancel()
  }
}
