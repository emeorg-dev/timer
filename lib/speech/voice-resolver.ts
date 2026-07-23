export class VoiceResolver {
  private getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return []
    return window.speechSynthesis.getVoices()
  }

  findBestVoice(targetLang: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices()
    if (voices.length === 0) return null

    const baseLang = targetLang.split("-")[0]
    const normalizedTargetLang = targetLang.replace("_", "-")

    // Capa 1: Coincidencia Exacta
    let voice = voices.find((v) => v.lang.replace("_", "-") === normalizedTargetLang)
    if (voice) return voice

    // Capa 2: Preferencias Regionales (Afinidad)
    if (baseLang === "es") {
      const isLatam = normalizedTargetLang !== "es-ES" && normalizedTargetLang !== "es"
      const latamNames = ["paulina", "sabina", "google español de estados unidos", "sofia", "luciana", "mia", "angélica", "carmit", "diego"]
      const spainNames = ["monica", "jorge", "lucia", "marisa", "google español"]
      
      const preferredNames = isLatam ? latamNames : spainNames
      
      voice = voices.find((v) => 
        v.lang.replace("_", "-").startsWith("es") && 
        preferredNames.some(name => v.name.toLowerCase().includes(name))
      )
      if (voice) return voice
    }

    // Capa 3: Coincidencia de Idioma Base (Respaldo)
    voice = voices.find((v) => v.lang.toLowerCase().startsWith(baseLang))
    if (voice) return voice

    return null
  }
}
