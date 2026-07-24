import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TimerCore } from "./timer-core"

describe("TimerCore", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Mock requestAnimationFrame
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(cb, 16))
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("initializes correctly", () => {
    const timer = new TimerCore(60)

    let currentStatus = "idle"
    timer.onStatusChange = status => {
      currentStatus = status
    }

    expect(currentStatus).toBe("idle")
  })

  it("starts and counts down", () => {
    const timer = new TimerCore(10)
    let lastRemaining = 10
    timer.onTick = rem => {
      lastRemaining = rem
    }

    let currentStatus = "idle"
    timer.onStatusChange = status => {
      currentStatus = status
    }

    timer.start()
    expect(currentStatus).toBe("running")

    // Advance 2 seconds
    vi.advanceTimersByTime(2000)
    expect(lastRemaining).toBe(8)

    timer.destroy()
  })

  it("pauses and resumes", () => {
    const timer = new TimerCore(10)
    let lastRemaining = 10
    timer.onTick = rem => {
      lastRemaining = rem
    }

    let currentStatus = "idle"
    timer.onStatusChange = status => {
      currentStatus = status
    }

    timer.start()
    vi.advanceTimersByTime(2000) // 8 seconds left
    expect(lastRemaining).toBe(8)

    timer.pause()
    expect(currentStatus).toBe("paused")

    vi.advanceTimersByTime(2000) // Shouldn't change
    expect(lastRemaining).toBe(8)

    timer.resume()
    expect(currentStatus).toBe("running")
    vi.advanceTimersByTime(2000) // 6 seconds left
    expect(lastRemaining).toBe(6)

    timer.destroy()
  })

  it("finishes at zero", () => {
    const timer = new TimerCore(2)
    let currentStatus = "idle"
    timer.onStatusChange = status => {
      currentStatus = status
    }

    timer.start()
    vi.advanceTimersByTime(2500) // Over 2 seconds

    expect(currentStatus).toBe("finished")

    timer.destroy()
  })
})
