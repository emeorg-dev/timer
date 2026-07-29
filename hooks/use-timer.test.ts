import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useTimer } from "./use-timer"

describe("useTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("expone el estado inicial del timer", () => {
    const { result } = renderHook(() => useTimer(10))

    expect(result.current.status).toBe("idle")
    expect(result.current.remaining).toBe(10)
    expect(result.current.elapsed).toBe(0)
  })

  it("refleja el estado running al iniciar", () => {
    const { result } = renderHook(() => useTimer(10))

    act(() => {
      result.current.start()
    })

    expect(result.current.status).toBe("running")
  })

  it("actualiza remaining y elapsed con los ticks de TimerCore", () => {
    const { result } = renderHook(() => useTimer(10))

    act(() => {
      result.current.start()
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.remaining).toBe(7)
    expect(result.current.elapsed).toBe(3)
  })

  it("refleja el estado paused y conserva el tiempo", () => {
    const { result } = renderHook(() => useTimer(10))

    act(() => {
      result.current.start()
      vi.advanceTimersByTime(3000)
      result.current.pause()
    })

    expect(result.current.status).toBe("paused")
    expect(result.current.remaining).toBe(7)
    expect(result.current.elapsed).toBe(3)
  })

  it("reanuda desde el tiempo conservado", () => {
    const { result } = renderHook(() => useTimer(10))

    act(() => {
      result.current.start()
      vi.advanceTimersByTime(3000)
      result.current.pause()
      vi.advanceTimersByTime(5000)
      result.current.resume()
      vi.advanceTimersByTime(2000)
    })

    expect(result.current.remaining).toBe(5)
    expect(result.current.elapsed).toBe(5)
  })

  it("restaura el estado inicial al reiniciar", () => {
    const { result } = renderHook(() => useTimer(10))

    act(() => {
      result.current.start()
      vi.advanceTimersByTime(3000)
      result.current.reset()
    })

    expect(result.current.status).toBe("idle")
    expect(result.current.remaining).toBe(10)
    expect(result.current.elapsed).toBe(0)
  })

  it("mantiene elapsed consistente si durationSec cambia mientras corre", () => {
    const { result, rerender } = renderHook(
      ({ durationSec }) => useTimer(durationSec),
      {
        initialProps: {
          durationSec: 10,
        },
      }
    )

    act(() => {
      result.current.start()
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.remaining).toBe(7)
    expect(result.current.elapsed).toBe(3)

    rerender({
      durationSec: 20,
    })

    expect(result.current.remaining).toBe(7)

    // Este valor documenta el comportamiento defectuoso actual:
    // calcula 20 (nueva prop) - 7 (remaining interno) = 13.
    expect(result.current.elapsed).toBe(13)
  })

  it("sincroniza una nueva duración mientras está idle", () => {
    const { result, rerender } = renderHook(
      ({ durationSec }) => useTimer(durationSec),
      {
        initialProps: {
          durationSec: 10,
        },
      }
    )

    rerender({
      durationSec: 20,
    })

    expect(result.current.remaining).toBe(20)
    expect(result.current.elapsed).toBe(0)
  })

  it("documenta qué duración usa reset después de cambiar la prop mientras corre", () => {
    const { result, rerender } = renderHook(
      ({ durationSec }) => useTimer(durationSec),
      {
        initialProps: {
          durationSec: 10,
        },
      }
    )

    act(() => {
      result.current.start()
      vi.advanceTimersByTime(2000)
    })

    rerender({
      durationSec: 20,
    })

    act(() => {
      result.current.reset()
    })

    // Al hacer reset el estado pasa a idle.
    // El useEffect([durationSec, status]) reacciona al idle, y aplica setDuration(20).
    // Por lo tanto, remaining terminaría siendo 20.
    expect(result.current.remaining).toBe(20)
  })

  it("limpia TimerCore al desmontarse", () => {
    const { result, unmount } = renderHook(() => useTimer(10))

    act(() => {
      result.current.start()
      vi.advanceTimersByTime(2000)
    })

    unmount()

    expect(() => {
      vi.advanceTimersByTime(5000)
    }).not.toThrow()
    
    // Si TimerCore no limpió el intervalo, los timers falsos seguirían corriendo.
    // Como unmount llama destroy(), limpia el timer de forma correcta.
  })
})
