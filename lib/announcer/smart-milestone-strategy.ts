import { buildAnnouncement } from "../announcements"
import type { LangCode } from "../i18n"
import type { AnnouncementMode } from "../settings/types"

import type { IAnnouncementStrategy } from "./interfaces"

export class SmartMilestoneStrategy implements IAnnouncementStrategy {
  private mode: AnnouncementMode
  private lang: LangCode
  private lastAnnouncedFloor: number | null = null
  private crossedMilestone: number = -1

  constructor(mode: AnnouncementMode, lang: LangCode) {
    this.mode = mode
    this.lang = lang
  }

  private isSmartMilestone(seconds: number): boolean {
    if (seconds <= 0) return false
    if (seconds <= 10) return true // cada segundo
    if (seconds <= 60) return seconds % 10 === 0 // cada 10 segundos
    if (seconds <= 1200) return seconds % 60 === 0 // cada 1 minuto
    return seconds % 1200 === 0 // cada 20 minutos
  }

  shouldAnnounce(remaining: number, elapsed: number): boolean {
    // Smart solo aplica a remaining en el contexto original
    if (this.mode !== "remaining") return false

    const currentFloor = Math.floor(remaining)
    if (this.lastAnnouncedFloor === null) {
      this.lastAnnouncedFloor = currentFloor
      return false
    }

    if (currentFloor >= this.lastAnnouncedFloor) {
      return false
    }

    this.crossedMilestone = -1
    for (let t = this.lastAnnouncedFloor - 1; t >= currentFloor; t--) {
      if (this.isSmartMilestone(t)) {
        this.crossedMilestone = t
      }
    }

    this.lastAnnouncedFloor = currentFloor
    return this.crossedMilestone > 0
  }

  getAnnouncementText(remaining: number, elapsed: number): string | null {
    if (this.crossedMilestone <= 0) return null
    return buildAnnouncement(this.crossedMilestone, this.lang, this.mode, true)
  }
}
