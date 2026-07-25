/**
 * Contrato arquitectónico para las estrategias algorítmicas de locución verbal (Patrón Strategy).
 *
 * Desacopla la lógica de decisión temporal (¿cuándo hablar?) del motor reproductor (¿cómo hablar?),
 * cumpliendo con el Principio de Inversión de Dependencias (DIP) y el Principio Abierto/Cerrado (OCP).
 */
export interface IAnnouncementStrategy {
  /**
   * Evalúa si en el segundo actual se ha cruzado un hito temporal que merezca ser anunciado por voz.
   *
   * @param remaining Segundos restantes de la cuenta regresiva en curso.
   * @param elapsed Segundos acumulados transcurridos desde el inicio de la sesión.
   * @returns `true` si el motor debe disparar un evento de síntesis de voz en este instante.
   */
  shouldAnnounce(remaining: number, elapsed: number): boolean

  /**
   * Genera el texto humanizado y gramaticalmente localizado para el último hito temporal cruzado.
   *
   * @param remaining Segundos restantes en el momento de la evaluación.
   * @param elapsed Segundos transcurridos en el momento de la evaluación.
   * @returns Oración completa lista para TTS, o `null` si no hay anuncio pendiente.
   */
  getAnnouncementText(remaining: number, elapsed: number): string | null
}
