import type { ISettingsRepository } from "./interfaces"
import type { Settings } from "./types"
import { DEFAULT_SETTINGS } from "./types"

const STORAGE_KEY = "voice-timer-settings"

export class SettingsRepository implements ISettingsRepository {
  load(): Settings {
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch {
      // ignore malformed storage
    }
    return DEFAULT_SETTINGS
  }

  save(settings: Settings): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // ignore quota errors
    }
  }
}
