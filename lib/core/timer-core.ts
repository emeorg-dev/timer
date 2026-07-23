export type TimerStatus = "idle" | "running" | "paused" | "finished"

export class TimerCore {
  private durationSec: number
  private remainingSec: number
  private status: TimerStatus = "idle"
  
  private deadlineMs: number = 0
  private rafId: number | null = null
  private lastWholeSec: number
  
  public onTick?: (remaining: number, elapsed: number) => void
  public onStatusChange?: (status: TimerStatus) => void

  constructor(durationSec: number) {
    this.durationSec = durationSec
    this.remainingSec = durationSec
    this.lastWholeSec = durationSec
  }

  setDuration(durationSec: number): void {
    if (this.status === "idle") {
      this.durationSec = durationSec
      this.remainingSec = durationSec
      this.lastWholeSec = durationSec
      if (this.onTick) this.onTick(this.remainingSec, 0)
    }
  }

  private setStatus(newStatus: TimerStatus): void {
    this.status = newStatus
    if (this.onStatusChange) this.onStatusChange(newStatus)
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      if (typeof window !== "undefined") {
        cancelAnimationFrame(this.rafId)
      }
      this.rafId = null
    }
  }

  private tick = (): void => {
    if (this.status !== "running") return

    const msLeft = this.deadlineMs - Date.now()
    const secLeft = Math.max(0, Math.ceil(msLeft / 1000))

    if (secLeft !== this.lastWholeSec) {
      this.lastWholeSec = secLeft
      this.remainingSec = secLeft
      if (this.onTick) this.onTick(this.remainingSec, this.durationSec - this.remainingSec)
    }

    if (msLeft <= 0) {
      this.remainingSec = 0
      this.setStatus("finished")
      if (this.onTick) this.onTick(0, this.durationSec)
      return
    }

    if (typeof window !== "undefined") {
      this.rafId = requestAnimationFrame(this.tick)
    }
  }

  start(): void {
    if (this.durationSec <= 0) return
    this.deadlineMs = Date.now() + this.durationSec * 1000
    this.lastWholeSec = this.durationSec
    this.setStatus("running")
    this.stopLoop()
    if (typeof window !== "undefined") {
      this.rafId = requestAnimationFrame(this.tick)
    }
  }

  pause(): void {
    if (this.status !== "running") return
    this.stopLoop()
    const secLeft = Math.max(0, Math.ceil((this.deadlineMs - Date.now()) / 1000))
    this.remainingSec = secLeft
    if (this.onTick) this.onTick(this.remainingSec, this.durationSec - this.remainingSec)
    this.setStatus("paused")
  }

  resume(): void {
    if (this.status !== "paused") return
    this.deadlineMs = Date.now() + this.remainingSec * 1000
    this.lastWholeSec = this.remainingSec
    this.stopLoop()
    if (typeof window !== "undefined") {
      this.rafId = requestAnimationFrame(this.tick)
    }
    this.setStatus("running")
  }

  reset(): void {
    this.stopLoop()
    this.lastWholeSec = this.durationSec
    this.remainingSec = this.durationSec
    if (this.onTick) this.onTick(this.remainingSec, 0)
    this.setStatus("idle")
  }

  destroy(): void {
    this.stopLoop()
  }
}
