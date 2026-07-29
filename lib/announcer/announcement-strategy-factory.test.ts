import { describe, expect, it } from "vitest"

import { createAnnouncementStrategy } from "./announcement-strategy-factory"
import { FixedIntervalStrategy } from "./fixed-interval-strategy"
import { SmartMilestoneStrategy } from "./smart-milestone-strategy"

describe("createAnnouncementStrategy", () => {
  it("construye hitos inteligentes para tiempo restante", () => {
    const strategy = createAnnouncementStrategy({
      interval: -1,
      mode: "remaining",
      language: "es",
    })

    expect(strategy).toBeInstanceOf(SmartMilestoneStrategy)
  })

  it("usa un intervalo seguro si una preferencia antigua combina smart con elapsed", () => {
    const strategy = createAnnouncementStrategy({
      interval: -1,
      mode: "elapsed",
      language: "es",
    })

    expect(strategy).toBeInstanceOf(FixedIntervalStrategy)
  })
})
