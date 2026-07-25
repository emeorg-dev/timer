/**
 * Interpola linealmente (RGB) entre dos colores hexadecimales para generar transiciones suaves en animaciones.
 *
 * Esencial para el fondo de gradiente (`GradientBackground`), permitiendo modificar la temperatura
 * o intensidad visual del lienzo en sincronía con el avance de la cuenta regresiva (Tensión Visual).
 *
 * @param color1 Color inicial en formato hexadecimal (ej. '#1a2a6c').
 * @param color2 Color de destino en formato hexadecimal (ej. '#b21f1f').
 * @param factor Progreso normalizado de la transición, donde `0.0` representa `color1` y `1.0` representa `color2`.
 * @returns Color interpolado resultante en formato hexadecimal '#RRGGBB'.
 *
 * @example
 * const colorMedio = interpolateColor("#000000", "#ffffff", 0.5); // Retorna "#808080"
 */
export function interpolateColor(color1: string, color2: string, factor: number) {
  const hex = (x: number) => {
    const s = Math.round(x).toString(16)
    return s.length === 1 ? "0" + s : s
  }

  const r1 = parseInt(color1.substring(1, 3), 16)
  const g1 = parseInt(color1.substring(3, 5), 16)
  const b1 = parseInt(color1.substring(5, 7), 16)

  const r2 = parseInt(color2.substring(1, 3), 16)
  const g2 = parseInt(color2.substring(3, 5), 16)
  const b2 = parseInt(color2.substring(5, 7), 16)

  const r = r1 + factor * (r2 - r1)
  const g = g1 + factor * (g2 - g1)
  const b = b1 + factor * (b2 - b1)

  return `#${hex(r)}${hex(g)}${hex(b)}`
}
