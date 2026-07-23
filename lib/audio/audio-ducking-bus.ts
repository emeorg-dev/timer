type DuckListener = (isDucking: boolean) => void

export class AudioDuckingBus {
  private listeners: Set<DuckListener> = new Set()
  private duckCount = 0

  subscribe(listener: DuckListener): () => void {
    this.listeners.add(listener)
    // Notify immediately with current state
    listener(this.duckCount > 0)
    return () => this.listeners.delete(listener)
  }

  requestDuck(): void {
    this.duckCount++
    if (this.duckCount === 1) {
      this.notify(true)
    }
  }

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

// Global instance to coordinate across all audio subsystems
export const duckingBus = new AudioDuckingBus()
