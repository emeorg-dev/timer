import { tryCatchSync } from "../try-catch"
import { createLogger } from "../logger"

const logger = createLogger("TTSService")

// Global audio instance for unlocking and playing Cloud TTS securely
export const cloudAudio = typeof window !== "undefined" ? new Audio() : null

export const TTSService = {
  /**
   * Desbloquea la instancia global de Audio con un archivo de silencio.
   * Esto previene los errores de Autoplay cuando el usuario hace el primer click.
   */
  unlockCloudAudio() {
    if (!cloudAudio) return

    tryCatchSync(() => {
      // Reproduce 1 segundo de silencio absoluto en base64 para engañar al navegador
      cloudAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"
      cloudAudio.play().catch(() => {})
      logger.debug("Cloud Audio desbloqueado")
    }, "Error intentando desbloquear Cloud Audio")
  },

  /**
   * Llama a nuestra API Proxy Interna para generar voz y saltar problemas de CORS.
   */
  playCloudVoice(text: string, lang: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!cloudAudio) {
        return reject(new Error("Cloud Audio instance not available"))
      }

      logger.info("Activando Cloud TTS de emergencia (vía Proxy Interno)", { text, lang })
      cloudAudio.src = `/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`
      
      cloudAudio.onended = () => {
        cloudAudio.onended = null
        cloudAudio.onerror = null
        resolve()
      }

      cloudAudio.onerror = (e) => {
        cloudAudio.onended = null
        cloudAudio.onerror = null
        reject(new Error("Cloud TTS play failed or was blocked"))
      }

      cloudAudio.play().catch((e) => {
        logger.error("Cloud TTS Promise bloqueada", { error: e })
        reject(e)
      })
    })
  }
}
