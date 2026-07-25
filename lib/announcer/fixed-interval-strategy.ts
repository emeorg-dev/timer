import { buildAnnouncement } from "../announcements"
import type { LangCode } from "../i18n"
import type { AnnouncementMode } from "../settings/types"

import type { IAnnouncementStrategy } from "./interfaces"

/**
 * Estrategia de locución basada en intervalos regulares y constantes de tiempo (ej. cada 30s o 5min).
 *
 * Divide la línea de tiempo en bloques uniformes y detecta transiciones entre bloques para determinar
 * el momento exacto en el que el temporizador ha completado un nuevo intervalo de progreso.
 */
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

  /**
   * Determina si se ha cruzado el límite hacia un nuevo bloque de tiempo.
   *
   * @param remaining Segundos restantes de la cuenta.
   * @param elapsed Segundos transcurridos en la sesión.
   * @returns `true` si el bloque calculado ha cambiado respecto a la última evaluación.
   */
  shouldAnnounce(remaining: number, elapsed: number): boolean {
    const currentBlock =
      this.mode === "remaining"
        ? Math.ceil(remaining / this.interval)
        : Math.floor(elapsed / this.interval)

    if (this.lastAnnouncedBlock === null) {
      this.lastAnnouncedBlock = currentBlock
      return false
    }

    const hasCrossedThreshold =
      this.mode === "remaining"
        ? currentBlock < this.lastAnnouncedBlock
        : currentBlock > this.lastAnnouncedBlock

    if (hasCrossedThreshold) {
      this.lastAnnouncedBlock = currentBlock
      return true
    }
    return false
  }

  /**
   * Genera el texto del anuncio correspondiente al límite del intervalo cruzado.
   *
   * @param remaining Segundos restantes de la cuenta.
   * @param elapsed Segundos transcurridos en la sesión.
   * @returns Oración traducida o `null` si no es aplicable.
   */
  getAnnouncementText(remaining: number, elapsed: number): string | null {
    // Should be called immediately after shouldAnnounce returns true
    if (this.lastAnnouncedBlock === null) return null
    const boundaryToAnnounce = this.lastAnnouncedBlock * this.interval
    if (boundaryToAnnounce <= 0) return null

    return buildAnnouncement(boundaryToAnnounce, this.lang, this.mode, false)
  }
}
