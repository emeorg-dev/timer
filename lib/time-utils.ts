/**
 * Formatea un número entero con relleno de ceros a la izquierda para garantizar visualización sexagesimal de 2 dígitos.
 *
 * @param n Número entero a formatear (ej. 5 o 12).
 * @returns Cadena formateada como '05' o '12'.
 */
export function pad(n: number) {
  return n.toString().padStart(2, "0")
}

/**
 * Descompone un total de segundos absolutos en sus componentes sexagesimales (horas, minutos y segundos).
 *
 * @param totalSeconds Cantidad total de segundos de la cuenta.
 * @returns Estructura objeto conteniendo `hours`, `minutes` y `seconds`.
 */
export function secondsToTime(totalSeconds: number) {
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}
