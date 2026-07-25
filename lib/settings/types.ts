import type { LangCode } from "@/lib/i18n"

/**
 * Modo de narración verbal para los avisos del temporizador (cuenta regresiva o progresiva).
 */
export type AnnouncementMode = "remaining" | "elapsed"

/**
 * Preferencia visual del usuario para el esquema de colores de la interfaz.
 */
export type ThemePref = "light" | "dark" | "system"

/**
 * Estructura integral que modela las preferencias personalizables del usuario en la sesión.
 */
export interface Settings {
  voiceEnabled: boolean
  language: LangCode
  /** Intervalo en segundos entre locuciones (ej. 60s, o 0 para avisar únicamente al finalizar). */
  announcementInterval: number // seconds; 0 = only at end
  announcementMode: AnnouncementMode
  soundEnabled: boolean
  theme: ThemePref
  musicEnabled: boolean
  musicTrack: string
  /** Ganancia o nivel de volumen en escala de 0 a 100 para la música ambiental. */
  musicVolume: number
}

/**
 * Valores por defecto de fábrica, garantizando un estado operativo predecible y sin errores al inicio.
 */
export const DEFAULT_SETTINGS: Settings = {
  voiceEnabled: true,
  language: "es-ES",
  announcementInterval: 60,
  announcementMode: "remaining",
  soundEnabled: true,
  theme: "system",
  musicEnabled: true,
  musicTrack: "/bg-music.ogg",
  musicVolume: 40,
}
