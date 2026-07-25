import { buildAnnouncement } from "../announcements"
import type { LangCode } from "../i18n"
import type { AnnouncementMode } from "../settings/types"

import type { IAnnouncementStrategy } from "./interfaces"

/**
 * Estrategia de locución dinámica basada en hitos cognitivos decrecientes (Hitos Inteligentes).
 *
 * Adapta la frecuencia de los avisos según la proximidad al final del tiempo: avisa cada 20 minutos al inicio,
 * cada minuto al entrar en la recta final, cada 10 segundos cerca de terminar y cuenta regresiva segundo a segundo
 * en los últimos 10 segundos, construyendo una narrativa auditiva de máxima tensión.
 */
export class SmartMilestoneStrategy implements IAnnouncementStrategy {
  private mode: AnnouncementMode
  private lang: LangCode
  private lastAnnouncedFloor: number | null = null
  private crossedMilestone: number = -1

  constructor(mode: AnnouncementMode, lang: LangCode) {
    this.mode = mode
    this.lang = lang
  }

  /**
   * Evalúa si un segundo específico corresponde a un hito inteligente dentro de la escala de urgencia.
   *
   * @param seconds Segundo entero a evaluar en la línea de tiempo.
   * @returns `true` si el segundo es un hito de anuncio programado.
   */
  private isSmartMilestone(seconds: number): boolean {
    if (seconds <= 0) return false
    if (seconds <= 10) return true // cada segundo
    if (seconds <= 60) return seconds % 10 === 0 // cada 10 segundos
    if (seconds <= 1200) return seconds % 60 === 0 // cada 1 minuto
    return seconds % 1200 === 0 // cada 20 minutos
  }

  /**
   * Evalúa si se ha cruzado alguno de los hitos inteligentes desde el último tick de reloj.
   *
   * @param remaining Segundos restantes de la cuenta regresiva.
   * @param elapsed Segundos transcurridos en la sesión.
   * @returns `true` si se cruzó un hito válido hacia atrás.
   */
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

  /**
   * Genera el texto del anuncio en modo inteligente (ej. solo el número en los últimos 10s).
   *
   * @param remaining Segundos restantes en el momento de la evaluación.
   * @param elapsed Segundos transcurridos en el momento de la evaluación.
   * @returns Cadena narrable con la locución o `null`.
   */
  getAnnouncementText(remaining: number, elapsed: number): string | null {
    if (this.crossedMilestone <= 0) return null
    return buildAnnouncement(this.crossedMilestone, this.lang, this.mode, true)
  }
}
