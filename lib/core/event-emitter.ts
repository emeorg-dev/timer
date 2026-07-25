// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listener<T = any> = (data: T) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventsMap = Record<string, any>

/**
 * Clase base para la gestión de suscripción y emisión de eventos fuertemente tipados (Patrón Observer / PubSub).
 *
 * Permite la comunicación desacoplada dentro de la arquitectura de la aplicación, como la transmisión de
 * latidos (`tick`) y cambios de estado del temporizador (`TimerCore`) hacia los hooks de React.
 */
export class EventEmitter<Events extends EventsMap = EventsMap> {
  private listeners: { [K in keyof Events]?: Set<Listener<Events[K]>> } = {}

  /**
   * Suscribe un oyente a un evento específico, garantizando tipado estricto en la carga útil (payload).
   *
   * @param event Nombre del evento a escuchar (ej. 'tick', 'statusChange').
   * @param listener Callback invocado automáticamente al emitirse el evento.
   * @returns Función de desuscripción inmutable para limpieza al desmontar.
   */
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
