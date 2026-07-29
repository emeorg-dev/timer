import { beforeEach, describe, expect, it } from "vitest"

import { SettingsRepository } from "./settings-repository"

describe("SettingsRepository", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("conserva un idioma soportado", () => {
    localStorage.setItem("voice-timer-settings", JSON.stringify({ language: "pt" }))

    expect(new SettingsRepository().load().language).toBe("pt")
  })

  it("restaura español cuando el idioma persistido no está soportado", () => {
    localStorage.setItem("voice-timer-settings", JSON.stringify({ language: "unknown" }))

    expect(new SettingsRepository().load().language).toBe("es")
  })
})
