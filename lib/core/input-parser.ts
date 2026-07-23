export class InputParser {
  /**
   * Parses a sequence of digits (like microwave input) into total seconds.
   * Format is HHMMSS. Max length 6.
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
