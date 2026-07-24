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
