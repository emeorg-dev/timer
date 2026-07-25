import type { LangCode } from "../i18n"
import type { ISpeaker } from "../speech/interfaces"

import type { IAnnouncementStrategy } from "./interfaces"

/**
 * Motor central de orquestación de locuciones verbales y avisos del temporizador.
 *
 * Actúa como el Contexto en el Patrón Strategy, evaluando en cada tick del reloj si la estrategia
 * activa (`FixedIntervalStrategy` o `SmartMilestoneStrategy`) solicita emitir una narración vocal,
 * delegando la síntesis al servicio de altavoz (`ISpeaker`) inyectado en el constructor.
 */
export class AnnouncerEngine {
  private speaker: ISpeaker
  private strategy: IAnnouncementStrategy | null = null
  private lang: LangCode

  constructor(speaker: ISpeaker, lang: LangCode) {
    this.speaker = speaker
    this.lang = lang
  }

  /**
   * Asigna o reemplaza dinámicamente la estrategia de evaluación temporal en tiempo de ejecución.
   *
   * @param strategy Nueva instancia de estrategia algorítmica o `null` para silenciar el temporizador.
   */
  setStrategy(strategy: IAnnouncementStrategy | null): void {
    this.strategy = strategy
  }

  /**
   * Evalúa el progreso temporal actual y pronuncia el anuncio verbal si la estrategia lo dicta.
   *
   * @param remaining Segundos restantes exactos de la cuenta.
   * @param elapsed Segundos transcurridos acumulados en la sesión.
   */
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
