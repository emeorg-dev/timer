import { IAnnouncementStrategy } from "./interfaces"
import { AnnouncementMode } from "../settings/types"
import { buildAnnouncement } from "../announcements"
import { LangCode } from "../i18n"

export class FixedIntervalStrategy implements IAnnouncementStrategy {
  private interval: number
  private mode: AnnouncementMode
  private lang: LangCode
  private lastAnnouncedBlock: number | null = null

  constructor(interval: number, mode: AnnouncementMode, lang: LangCode) {
    this.interval = interval
    this.mode = mode
    this.lang = lang
  }

  shouldAnnounce(remaining: number, elapsed: number): boolean {
    const currentBlock = this.mode === "remaining"
      ? Math.ceil(remaining / this.interval)
      : Math.floor(elapsed / this.interval)

    if (this.lastAnnouncedBlock === null) {
      this.lastAnnouncedBlock = currentBlock
      return false
    }

    const crossedThreshold = this.mode === "remaining"
      ? currentBlock < this.lastAnnouncedBlock
      : currentBlock > this.lastAnnouncedBlock

    if (crossedThreshold) {
      this.lastAnnouncedBlock = currentBlock
      return true
    }
    return false
  }

  getAnnouncementText(remaining: number, elapsed: number): string | null {
    // Should be called immediately after shouldAnnounce returns true
    if (this.lastAnnouncedBlock === null) return null
    const boundaryToAnnounce = this.lastAnnouncedBlock * this.interval
    if (boundaryToAnnounce <= 0) return null
    
    return buildAnnouncement(boundaryToAnnounce, this.lang, this.mode, false)
  }
}
