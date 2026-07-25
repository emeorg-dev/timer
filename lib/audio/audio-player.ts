import type { IFilePlayer } from "./interfaces"

/**
 * Adaptador de reproducción de archivos multimedia basado en el elemento nativo del navegador (`HTMLAudioElement`).
 *
 * Encapsula la gestión de errores de reproducción asíncrona (como políticas de auto-play bloqueadas por el navegador),
 * e implementa la modificación de velocidad en tiempo real (`playbackRate`) deshabilitando la preservación de tono
 * (`preservesPitch = false`) para generar un efecto dramático de urgencia al acelerar la música ambiental.
 */
export class AudioPlayer implements IFilePlayer {
  private audio: HTMLAudioElement | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.audio = new Audio()
    }
  }

  setSource(src: string): void {
    if (this.audio) {
      this.audio.src = src
    }
  }

  setVolume(vol: number): void {
    if (this.audio) {
      this.audio.volume = vol
    }
  }

  setPlaybackRate(rate: number): void {
    if (this.audio) {
      this.audio.playbackRate = rate
      // @ts-ignore
      this.audio.preservesPitch = false
    }
  }

  setLoop(loop: boolean): void {
    if (this.audio) {
      this.audio.loop = loop
    }
  }

  play(): void {
    if (this.audio && this.audio.paused) {
      this.audio.play().catch(e => console.error("Error reproduciendo audio", e))
    }
  }

  pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause()
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
    }
  }
}
