import type { LangCode } from "@/lib/i18n"

export type AnnouncementMode = "remaining" | "elapsed"
export type ThemePref = "light" | "dark" | "system"

export interface Settings {
  voiceEnabled: boolean
  language: LangCode
  announcementInterval: number // seconds; 0 = only at end
  announcementMode: AnnouncementMode
  soundEnabled: boolean
  theme: ThemePref
  musicEnabled: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  voiceEnabled: true,
  language: "es-ES",
  announcementInterval: 60,
  announcementMode: "remaining",
  soundEnabled: true,
  theme: "system",
  musicEnabled: true,
}
