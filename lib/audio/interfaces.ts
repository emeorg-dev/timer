/**
 * Tipos de eventos auditivos y efectos de sonido soportados por el generador de tonos en la interfaz.
 */
export type SoundType = "start" | "pause" | "finish" | "emergency"

/**
 * Contrato base para cualquier reproductor de audio, estandarizando los controles fundamentales.
 */
export interface IAudioOutput {
  play(): void
  pause(): void
  stop(): void
}

/**
 * Contrato para reproductores basados en archivos multimedia externos (ej. pistas Ogg/MP3 para música de fondo).
 *
 * Expone capacidad para alterar velocidad de reproducción (`playbackRate`) en tiempo real sin deformar
 * el tono cuando sea posible, permitiendo generar tensión auditiva acelerada en los últimos segundos.
 */
export interface IFilePlayer extends IAudioOutput {
  setSource(src: string): void
  setVolume(vol: number): void
  setPlaybackRate(rate: number): void
  setLoop(loop: boolean): void
}

/**
 * Contrato para generadores de efectos sintéticos de sonido in situ (ej. Web Audio API, osciladores).
 */
export interface ISoundGenerator {
  playTone(type: SoundType): void
}
