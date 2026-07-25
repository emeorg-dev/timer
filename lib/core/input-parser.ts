/**
 * Analizador y convertidor gramatical para entradas numéricas al estilo microondas.
 */
export class InputParser {
  /**
   * Transforma una cadena continua de hasta 6 dígitos sexagesimales (HHMMSS) en segundos absolutos enteros.
   *
   * Trabaja en conjunto con `useMicrowaveInput`, interpretando la escritura de derecha a izquierda:
   * '90' se traduce como 1 min 30 s (90s); '100' se interpreta como 1 min 00 s (60s).
   *
   * @param inputSequence Cadena de texto numérica pura de hasta 6 caracteres (ej. '130' o '90').
   * @returns Cantidad de segundos equivalente listos para alimentar a `TimerCore`.
   *
   * @example
   * const seg = InputParser.parse("130"); // 1 min 30 seg = 90 segundos
   */
  static parse(inputSequence: string): number {
    if (!inputSequence) return 0
    const padded = inputSequence.padStart(6, "0")
    const h = parseInt(padded.slice(0, 2), 10)
    const m = parseInt(padded.slice(2, 4), 10)
    const s = parseInt(padded.slice(4, 6), 10)
    return h * 3600 + m * 60 + s
  }
}
