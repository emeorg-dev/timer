import type { LangCode } from "../i18n"
import type { ISpeaker } from "../speech/interfaces"

import type { IAnnouncementStrategy } from "./interfaces"

export class AnnouncerEngine {
  private speaker: ISpeaker
  private strategy: IAnnouncementStrategy | null = null
  private lang: LangCode

  constructor(speaker: ISpeaker, lang: LangCode) {
    this.speaker = speaker
    this.lang = lang
  }

  setStrategy(strategy: IAnnouncementStrategy | null): void {
    this.strategy = strategy
  }

  evaluate(remaining: number, elapsed: number): void {
    if (!this.strategy) return

    if (this.strategy.shouldAnnounce(remaining, elapsed)) {
      const text = this.strategy.getAnnouncementText(remaining, elapsed)
      if (text) {
        this.speaker.speak(text, this.lang)
      }
    }
  }
}
