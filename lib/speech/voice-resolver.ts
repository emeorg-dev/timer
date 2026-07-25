/**
 * Evalúa en tiempo de ejecución si el navegador web soporta la API nativa de síntesis de voz (`speechSynthesis`).
 *
 * Provee una comprobación segura frente al renderizado del lado del servidor (SSR) e iframe sandboxes,
 * evitando excepciones y garantizando una transición grácil hacia motores de respaldo en nube (`CloudTTSService`).
 *
 * @returns `true` si el objeto global `window.speechSynthesis` está disponible en el entorno activo.
 */
export function isNativeSpeechSupported(): boolean {
  const isBrowserEnvironment = typeof window !== "undefined"
  if (!isBrowserEnvironment) return false
  return "speechSynthesis" in window
}

/**
 * Motor heurístico de selección y emparejamiento de voces nativas para locución en lenguaje natural.
 *
 * Implementa una estrategia de resolución en 3 capas de prioridad para localizar la voz óptima:
 * 1. Coincidencia exacta de dialecto nativo (ej. 'es-MX' exactamente igual al solicitado).
 * 2. Afinidad geográfica regional (ej. prefiere voces latinoamericanas como 'Paulina' o 'Sabina' para Hispanoamérica,
 *    y 'Mónica' o 'Jorge' para España).
 * 3. Respaldo por idioma base (cualquier voz que comience por 'es').
 */
export class VoiceResolver {
  private getVoices(): SpeechSynthesisVoice[] {
    if (!isNativeSpeechSupported()) return []
    return window.speechSynthesis.getVoices()
  }

  /**
   * Busca y selecciona la mejor voz nativa disponible en el sistema que se ajuste al idioma solicitado.
   *
   * @param targetLang Código de idioma o dialecto deseado (ej. 'es-AR', 'en-US').
   * @returns Instancia óptima de `SpeechSynthesisVoice` o `null` si no hay voces compatibles.
   */
  findBestVoice(targetLang: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices()
    if (voices.length === 0) return null

    const baseLang = targetLang.split("-")[0]
    const normalizedTargetLang = targetLang.replace("_", "-")

    // Capa 1: Coincidencia Exacta
    let voice = voices.find(v => v.lang.replace("_", "-") === normalizedTargetLang)
    if (voice) return voice

    // Capa 2: Preferencias Regionales (Afinidad)
    if (baseLang === "es") {
      const isLatam = normalizedTargetLang !== "es-ES" && normalizedTargetLang !== "es"
      const latamNames = [
        "paulina",
        "sabina",
        "google español de estados unidos",
        "sofia",
        "luciana",
        "mia",
        "angélica",
        "carmit",
        "diego",
      ]
      const spainNames = ["monica", "jorge", "lucia", "marisa", "google español"]

      const preferredNames = isLatam ? latamNames : spainNames

      voice = voices.find(
        v =>
          v.lang.replace("_", "-").startsWith("es") &&
          preferredNames.some(name => v.name.toLowerCase().includes(name))
      )
      if (voice) return voice
    }

    // Capa 3: Coincidencia de Idioma Base (Respaldo)
    voice = voices.find(v => v.lang.toLowerCase().startsWith(baseLang))
    if (voice) return voice

    return null
  }
}
