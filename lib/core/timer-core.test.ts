import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { TimerCore } from "./timer-core"
import type { TimerStatus } from "./timer-core"

describe("Pruebas de Caracterización de TimerCore", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Función auxiliar para rastrear el estado
  function trackStatuses(timer: TimerCore): TimerStatus[] {
    const statuses: TimerStatus[] = []
    timer.on("statusChange", (status) => {
      statuses.push(status)
    })
    return statuses
  }

  // Función auxiliar para rastrear los ticks (pulsos)
  function trackTicks(timer: TimerCore) {
    const ticks: Array<{ remainingSec: number; elapsedSec: number }> = []
    timer.on("tick", (value) => {
      ticks.push(value)
    })
    return ticks
  }

  describe("Grupo 1 - Estado Inicial", () => {
    it("inicia con la duración restante configurada", () => {
      const timer = new TimerCore(10)
      const ticks = trackTicks(timer)
      // Dado que no hay un getter y el tick inicial no se emite en el constructor,
      // podemos usar reset() para forzar un tick y comprobar el estado.
      timer.reset()
      expect(ticks.at(-1)).toEqual({ remainingSec: 10, elapsedSec: 0 })
    })
  })

  describe("Grupo 2 - Inicio Normal", () => {
    it("inicia desde el estado inactivo", () => {
      const timer = new TimerCore(10)
      const statuses = trackStatuses(timer)

      timer.start()

      expect(statuses).toContain("running")
    })

    it("emite el tiempo actualizado mientras se ejecuta", () => {
      const timer = new TimerCore(10)
      const ticks = trackTicks(timer)

      timer.start()

      vi.advanceTimersByTime(2000)

      expect(ticks).toContainEqual({
        remainingSec: 8,
        elapsedSec: 2,
      })
    })
  })

  describe("Grupo 3 - Comportamiento Defectuoso de start()", () => {
    it("actualmente reinicia el límite de tiempo cuando se llama a start mientras se ejecuta", () => {
      const timer = new TimerCore(10)
      const ticks = trackTicks(timer)

      timer.start()

      vi.advanceTimersByTime(4000) // restante ≈ 6

      timer.start() // Esto reiniciará el límite a 10 segundos a partir de ahora

      vi.advanceTimersByTime(1000) // 1 segundo después de reiniciar

      const latestTick = ticks.at(-1)
      expect(latestTick?.remainingSec).toBe(9)
    })

    it("actualmente reinicia desde la duración completa cuando se llama a start mientras está pausado", () => {
      const timer = new TimerCore(10)
      const ticks = trackTicks(timer)

      timer.start()
      vi.advanceTimersByTime(4000) // restante ≈ 6

      timer.pause()
      timer.start() // Actualmente esto reinicia el límite

      vi.advanceTimersByTime(1000)

      const latestTick = ticks.at(-1)
      expect(latestTick?.remainingSec).toBe(9)
    })

    it("actualmente reinicia cuando se llama a start después de terminar", () => {
      const timer = new TimerCore(2)
      const statuses = trackStatuses(timer)

      timer.start()
      vi.advanceTimersByTime(2500)

      expect(statuses).toContain("finished")

      timer.start() // Reinicia el límite

      expect(statuses.at(-1)).toBe("running")
    })
  })

  describe("Grupo 4 - Pausa y Reanudación", () => {
    it("conserva el tiempo restante cuando se pausa", () => {
      const timer = new TimerCore(10)
      const ticks = trackTicks(timer)

      timer.start()

      vi.advanceTimersByTime(3400) // Math.ceil((10000 - 3400) / 1000) = 7

      timer.pause()

      const pausedTick = ticks.at(-1)
      expect(pausedTick?.remainingSec).toBe(7)
      expect(pausedTick?.elapsedSec).toBe(3)
    })

    it("no avanza mientras está pausado", () => {
      const timer = new TimerCore(10)
      const ticks = trackTicks(timer)

      timer.start()
      vi.advanceTimersByTime(3000)

      timer.pause()

      const tickCountAfterPause = ticks.length
      const pausedTick = ticks.at(-1)

      vi.advanceTimersByTime(5000)

      expect(ticks.length).toBe(tickCountAfterPause)
      expect(ticks.at(-1)).toEqual(pausedTick)
    })

    it("continúa desde el tiempo restante conservado cuando se reanuda", () => {
      const timer = new TimerCore(10)
      const ticks = trackTicks(timer)

      timer.start()
      vi.advanceTimersByTime(3000) // restante = 7

      timer.pause()
      vi.advanceTimersByTime(5000) // tiempo transcurrido mientras estaba pausado

      timer.resume()
      vi.advanceTimersByTime(2000) // avanza 2 segundos más. el restante debería ser 5.

      const latestTick = ticks.at(-1)

      expect(latestTick?.remainingSec).toBe(5)
      expect(latestTick?.elapsedSec).toBe(5)
    })
  })

  describe("Grupo 5 - Terminar", () => {
    it("termina cuando el tiempo restante llega a cero", () => {
      const timer = new TimerCore(3)
      const statuses = trackStatuses(timer)

      timer.start()
      vi.advanceTimersByTime(3100)

      expect(statuses.at(-1)).toBe("finished")
    })

    it("emite un tick final con cero tiempo restante", () => {
      const timer = new TimerCore(3)
      const ticks = trackTicks(timer)

      timer.start()
      vi.advanceTimersByTime(3100)

      expect(ticks.at(-1)).toEqual({
        remainingSec: 0,
        elapsedSec: 3,
      })
    })

    it("no emite ticks después de terminar", () => {
      const timer = new TimerCore(2)
      const ticks = trackTicks(timer)

      timer.start()
      vi.advanceTimersByTime(2100) // Termina

      const tickCountAtFinish = ticks.length

      vi.advanceTimersByTime(5000)

      expect(ticks.length).toBe(tickCountAtFinish)
    })

    it("emite el estado terminado solo una vez", () => {
      const timer = new TimerCore(2)
      const statuses = trackStatuses(timer)

      timer.start()
      vi.advanceTimersByTime(7000)

      const finishedEvents = statuses.filter((status) => status === "finished")

      expect(finishedEvents).toHaveLength(1)
    })

    it("actualmente emite dos ticks finales con cero tiempo restante", () => {
      const timer = new TimerCore(2)
      const ticks = trackTicks(timer)

      timer.start()
      vi.advanceTimersByTime(7000)

      const zeroTicks = ticks.filter(({ remainingSec }) => remainingSec === 0)

      expect(zeroTicks).toHaveLength(2)
    })
  })

  describe("Grupo 6 - Reiniciar", () => {
    it("se reinicia a estado inactivo desde ejecución", () => {
      const timer = new TimerCore(10)
      const statuses = trackStatuses(timer)
      const ticks = trackTicks(timer)

      timer.start()
      vi.advanceTimersByTime(3000)

      timer.reset()

      expect(statuses.at(-1)).toBe("idle")
      expect(ticks.at(-1)).toEqual({
        remainingSec: 10,
        elapsedSec: 0,
      })
    })

    it("deja de emitir ticks después del reinicio", () => {
      const timer = new TimerCore(10)
      const ticks = trackTicks(timer)

      timer.start()
      vi.advanceTimersByTime(3000)

      timer.reset()

      const tickCountAfterReset = ticks.length

      vi.advanceTimersByTime(5000)

      expect(ticks.length).toBe(tickCountAfterReset)
    })

    it("restaura los valores iniciales cuando se reinicia desde inactivo", () => {
      const timer = new TimerCore(10)
      const ticks = trackTicks(timer)

      timer.reset()

      expect(ticks.at(-1)).toEqual({
        remainingSec: 10,
        elapsedSec: 0,
      })
    })
  })

  describe("Grupo 7 - Duración", () => {
    it("no inicia cuando la duración es cero", () => {
      const timer = new TimerCore(0)
      const statuses = trackStatuses(timer)

      timer.start()

      expect(statuses).not.toContain("running")
    })

    it("actualiza la duración mientras está inactivo", () => {
      const timer = new TimerCore(10)
      const ticks = trackTicks(timer)

      timer.setDuration(20)

      expect(ticks.at(-1)).toEqual({
        remainingSec: 20,
        elapsedSec: 0,
      })
    })

    it("ignora los cambios de duración mientras se ejecuta", () => {
      const timer = new TimerCore(10)
      const ticks = trackTicks(timer)

      timer.start()
      timer.setDuration(20) // Debería ser ignorado

      vi.advanceTimersByTime(1000)

      expect(ticks.at(-1)?.remainingSec).toBe(9)
    })
  })

  describe("Grupo 8 - Destruir", () => {
    it("detiene la actividad del temporizador cuando se destruye", () => {
      const timer = new TimerCore(10)
      const ticks = trackTicks(timer)

      timer.start()
      vi.advanceTimersByTime(2000)

      timer.destroy()

      const tickCountAtDestroy = ticks.length

      vi.advanceTimersByTime(5000)

      expect(ticks.length).toBe(tickCountAtDestroy)
    })

    it("elimina los listeners (oyentes) cuando se destruye", () => {
      const timer = new TimerCore(10)
      const listener = vi.fn()

      timer.on("tick", listener)

      timer.destroy()
      timer.reset() // normalmente esto emitiría un tick

      expect(listener).not.toHaveBeenCalled()
    })
  })
})
