import type { ISettingsRepository } from "./interfaces"
import type { Settings } from "./types"
import { DEFAULT_SETTINGS } from "./types"

const STORAGE_KEY = "voice-timer-settings"

/**
 * Implementación de almacenamiento persistente basada en el almacenamiento local del navegador (`localStorage`).
 *
 * Protege contra fallos de cuota excedida o JSON corrupto mediante bloques de captura silenciosa,
 * retornando siempre un objeto de configuración válido y fusionado con `DEFAULT_SETTINGS` para compatibilidad
 * hacia atrás y en entornos de renderizado del lado del servidor (SSR / Next.js).
 */
export class SettingsRepository implements ISettingsRepository {
  load(): Settings {
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsed = JSON.parse(raw) as any
        
        // Remove legacy properties
        delete parsed.theme
        delete parsed.language
        delete parsed.locale

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
