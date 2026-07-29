import type { LangCode } from "../i18n"
import type { AnnouncementMode } from "../settings/types"

import { FixedIntervalStrategy } from "./fixed-interval-strategy"
import type { IAnnouncementStrategy } from "./interfaces"
import { SmartMilestoneStrategy } from "./smart-milestone-strategy"

const SMART_MILESTONE_INTERVAL = -1

interface AnnouncementStrategyOptions {
  interval: number
  mode: AnnouncementMode
  language: LangCode
}

function shouldUseSmartMilestones(options: AnnouncementStrategyOptions): boolean {
  return options.interval === SMART_MILESTONE_INTERVAL && options.mode === "remaining"
}

export function createAnnouncementStrategy(
  options: AnnouncementStrategyOptions
): IAnnouncementStrategy {
  if (shouldUseSmartMilestones(options)) {
    return new SmartMilestoneStrategy(options.mode, options.language)
  }

  const interval = options.interval === SMART_MILESTONE_INTERVAL ? 60 : options.interval
  return new FixedIntervalStrategy(interval, options.mode, options.language)
}
