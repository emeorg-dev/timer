/**
 * Contrato arquitectónico para cualquier motor de síntesis de voz o locución (Patrón Adapter / DIP).
 */
export interface ISpeaker {
  /** Emite una locución vocal en el idioma indicado. */
  speak(text: string, lang: string): void
  /** Interrumpe de inmediato cualquier locución en curso. */
  cancel(): void
}

export interface IUnlockableSpeaker extends ISpeaker {
  unlock(): void
}

export interface IVoiceResolver {
  findBestVoice(targetLang: string): SpeechSynthesisVoice | null
}
