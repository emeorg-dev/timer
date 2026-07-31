import { beforeEach, describe, expect, it } from "vitest"

import { SettingsRepository } from "./settings-repository"

describe("SettingsRepository", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("conserva la configuración existente", () => {
    localStorage.setItem("voice-timer-settings", JSON.stringify({ voiceEnabled: false }))

    expect(new SettingsRepository().load().voiceEnabled).toBe(false)
  })

  it("utiliza valores por defecto si no hay configuración", () => {
    localStorage.removeItem("voice-timer-settings")

    expect(new SettingsRepository().load().voiceEnabled).toBe(true)
  })
})
