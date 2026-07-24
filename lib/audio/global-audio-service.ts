import type { LangCode } from "../i18n"
import { SpeechOrchestrator } from "../speech/speech-orchestrator"

import type { AudioDuckingBus } from "./audio-ducking-bus"
import { duckingBus } from "./audio-ducking-bus"
import type { SoundType } from "./interfaces"
import { SoundEffectPlayer } from "./sound-effect-player"

export class GlobalAudioService {
  private static instance: GlobalAudioService | null = null

  private speechOrchestrator: SpeechOrchestrator
  private soundEffectPlayer: SoundEffectPlayer

  private constructor() {
    this.speechOrchestrator = new SpeechOrchestrator()
    this.soundEffectPlayer = new SoundEffectPlayer()
  }

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
