// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listener<T = any> = (data: T) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventsMap = Record<string, any>

export class EventEmitter<Events extends EventsMap = EventsMap> {
  private listeners: { [K in keyof Events]?: Set<Listener<Events[K]>> } = {}

  public on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set()
    }
    this.listeners[event]!.add(listener)

    // Return an unsubscribe function
    return () => this.off(event, listener)
  }

  public off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    if (!this.listeners[event]) return
    this.listeners[event]!.delete(listener)
  }

  protected emit<K extends keyof Events>(event: K, data: Events[K]): void {
    if (!this.listeners[event]) return
    this.listeners[event]!.forEach(listener => listener(data))
  }

  public removeAllListeners(): void {
    this.listeners = {}
  }
}
