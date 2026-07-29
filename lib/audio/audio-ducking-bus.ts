type DuckListener = (isDucking: boolean) => void

export interface IAudioDucking {
  subscribe(listener: DuckListener): () => void
  requestDuck(): void
  releaseDuck(): void
}

/**
 * Bus central de atenuación de volumen (Audio Ducking Bus) por conteo de referencias.
 *
 * Resuelve el problema de parpadeo y solapamiento acústico al emitir locuciones de voz (TTS) o efectos (SFX)
 * sobre la música de fondo. Manteniendo un contador de solicitudes de atenuación (`duckCount`), asegura que
 * el volumen ambiental permanezca reducido de manera suave si múltiples anuncios se superponen en el tiempo,
 * restaurando la ganancia normal únicamente al liberarse todas y cada una de las locuciones activas.
 */
export class AudioDuckingBus implements IAudioDucking {
  private listeners: Set<DuckListener> = new Set()
  private duckCount = 0

  /**
   * Suscribe un consumidor de audio (ej. controlador de música de fondo) a los cambios de estado de atenuación.
   *
   * @param listener Función callback invocada con `true` cuando se solicita silencio o `false` al restaurarse.
   * @returns Función de desuscripción para limpieza en desmontaje del ciclo de vida.
   */
  subscribe(listener: DuckListener): () => void {
    this.listeners.add(listener)
    // Notify immediately with current state
    listener(this.duckCount > 0)
    return () => this.listeners.delete(listener)
  }

  /**
   * Reclama la atenuación inmediata del volumen de fondo para abrir espacio en el espectro auditivo.
   */
  requestDuck(): void {
    this.duckCount++
    if (this.duckCount === 1) {
      this.notify(true)
    }
  }

  /**
   * Libera una solicitud previa de atenuación. Si el contador desciende a cero, se restaura el volumen normal.
   */
  releaseDuck(): void {
    if (this.duckCount > 0) {
      this.duckCount--
      if (this.duckCount === 0) {
        this.notify(false)
      }
    }
  }

  private notify(isDucking: boolean): void {
    this.listeners.forEach(listener => listener(isDucking))
  }
}

/**
 * Instancia singleton exportada para coordinar globalmente los subsistemas de síntesis de voz, SFX y música.
 */
export const duckingBus = new AudioDuckingBus()
