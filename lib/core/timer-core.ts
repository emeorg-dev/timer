import { EventEmitter } from "./event-emitter"

/**
 * Estados de ejecución posibles del motor del temporizador durante su ciclo de vida.
 */
export type TimerStatus = "idle" | "running" | "paused" | "finished"

/**
 * Eventos y estructuras de datos emitidos por el motor del temporizador hacia sus observadores.
 */
export type TimerEvents = {
  /** Evento de latido emitido en transiciones de segundos exactos. */
  tick: { remainingSec: number; elapsedSec: number }
  /** Evento emitido al transicionar el estado del temporizador. */
  statusChange: TimerStatus
}

/**
 * Motor central del temporizador y máquina de estados (Dominio / Core Engine).
 *
 * Aísla la lógica temporal de la interfaz gráfica y de React, manteniendo precisión absoluta
 * mediante la comparación constante contra una marca de tiempo objetivo (`deadlineMs - Date.now()`).
 * Este diseño evita el desfase por deriva del bucle de eventos (`drift`) inherente a los `setInterval`
 * del navegador en pestañas inactivas o procesos pesados.
 */
export class TimerCore extends EventEmitter<TimerEvents> {
  private durationSec: number
  private remainingSec: number
  private status: TimerStatus = "idle"

  private deadlineMs: number = 0
  private timerId: ReturnType<typeof setInterval> | null = null
  private lastWholeSec: number

  constructor(durationSec: number) {
    super()
    this.durationSec = durationSec
    this.remainingSec = durationSec
    this.lastWholeSec = durationSec
  }

  setDuration(durationSec: number): void {
    if (this.status === "idle") {
      this.durationSec = durationSec
      this.remainingSec = durationSec
      this.lastWholeSec = durationSec
      this.emit("tick", { remainingSec: this.remainingSec, elapsedSec: 0 })
    }
  }

  private setStatus(newStatus: TimerStatus): void {
    this.status = newStatus
    this.emit("statusChange", newStatus)
  }

  private stopLoop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId)
      this.timerId = null
    }
  }

  private tick = (): void => {
    const isRunning = this.status === "running"
    if (!isRunning) return

    const msLeft = this.deadlineMs - Date.now()
    const secLeft = Math.max(0, Math.ceil(msLeft / 1000))

    const hasChangedSecond = secLeft !== this.lastWholeSec
    if (hasChangedSecond) {
      this.lastWholeSec = secLeft
      this.remainingSec = secLeft
      this.emit("tick", {
        remainingSec: this.remainingSec,
        elapsedSec: this.durationSec - this.remainingSec,
      })
    }

    const hasDeadlinePassed = msLeft <= 0
    if (hasDeadlinePassed) {
      this.remainingSec = 0
      this.setStatus("finished")
      this.emit("tick", { remainingSec: 0, elapsedSec: this.durationSec })
      this.stopLoop()
      return
    }
  }

  start(): void {
    if (this.durationSec <= 0) return
    this.deadlineMs = Date.now() + this.durationSec * 1000
    this.lastWholeSec = this.durationSec
    this.setStatus("running")
    this.stopLoop()
    this.timerId = setInterval(this.tick, 100)
    this.tick()
  }

  pause(): void {
    if (this.status !== "running") return
    this.stopLoop()
    const secLeft = Math.max(0, Math.ceil((this.deadlineMs - Date.now()) / 1000))
    this.remainingSec = secLeft
    this.emit("tick", {
      remainingSec: this.remainingSec,
      elapsedSec: this.durationSec - this.remainingSec,
    })
    this.setStatus("paused")
  }

  resume(): void {
    if (this.status !== "paused") return
    this.deadlineMs = Date.now() + this.remainingSec * 1000
    this.lastWholeSec = this.remainingSec
    this.stopLoop()
    this.setStatus("running")
    this.timerId = setInterval(this.tick, 100)
    this.tick()
  }

  reset(): void {
    this.stopLoop()
    this.lastWholeSec = this.durationSec
    this.remainingSec = this.durationSec
    this.emit("tick", { remainingSec: this.remainingSec, elapsedSec: 0 })
    this.setStatus("idle")
  }

  destroy(): void {
    this.stopLoop()
    this.removeAllListeners()
  }
}
