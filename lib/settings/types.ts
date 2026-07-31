/**
 * Modo de narración verbal para los avisos del temporizador (cuenta regresiva o progresiva).
 */
export type AnnouncementMode = "remaining" | "elapsed"

/**
 * Estructura integral que modela las preferencias personalizables del usuario en la sesión.
 */
export interface Settings {
  voiceEnabled: boolean
  /** Intervalo en segundos entre locuciones (ej. 60s, o 0 para avisar únicamente al finalizar). */
  announcementInterval: number // seconds; 0 = only at end
  announcementMode: AnnouncementMode
  soundEnabled: boolean
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
  announcementInterval: 60,
  announcementMode: "remaining",
  soundEnabled: true,
  musicEnabled: true,
  musicTrack:
    "/music/Leighton_Brothers_-_Steamboat_Bill_(1910)/Leighton_Brothers_-_Steamboat_Bill_(1910).ogg",
  musicVolume: 40,
}
