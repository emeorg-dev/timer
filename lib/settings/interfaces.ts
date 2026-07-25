import type { Settings } from "./types"

/**
 * Contrato arquitectónico para la persistencia y recuperación de configuraciones (Patrón Repository / DIP).
 */
export interface ISettingsRepository {
  /** Lee y reconstruye el objeto de configuración desde el almacén subyacente. */
  load(): Settings
  /** Serializa y guarda el objeto de configuración en el almacén persistente. */
  save(settings: Settings): void
}
