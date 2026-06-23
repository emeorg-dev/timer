"use client"

import { useCallback, useEffect, useRef } from "react"
import type { LangCode } from "@/lib/i18n"
import { createLogger } from "@/lib/logger"
import { TTSService } from "@/lib/services/tts-service"
import { playEmergencyBeep } from "./use-sound"

const logger = createLogger("useSpeech")

// Carga global de voces para evitar el bug de array vacío en Chrome
let globalVoices: SpeechSynthesisVoice[] = []
let voicesLoaded = false
const pendingCallbacks: (() => void)[] = []

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const loadVoices = () => {
    globalVoices = window.speechSynthesis.getVoices()
    voicesLoaded = true
    logger.debug("Voces cargadas globalmente", { count: globalVoices.length })
    
    // Si habían acciones encoladas esperando las voces, las ejecutamos ahora
    if (globalVoices.length > 0 && pendingCallbacks.length > 0) {
      logger.info("Procesando callbacks encolados tras carga de voces", { count: pendingCallbacks.length })
      while (pendingCallbacks.length > 0) {
        const cb = pendingCallbacks.shift()
        if (cb) cb()
      }
    }
  }
  // Chrome carga las voces de forma asíncrona
  window.speechSynthesis.onvoiceschanged = loadVoices
  loadVoices()
}


/** Wraps the Web Speech API (SpeechSynthesis) con selección dinámica de voz. */
export function useSpeech() {
  const supportedRef = useRef(false)

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      supportedRef.current = true
    }
  }, [])

  const unlock = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      logger.warn("SpeechSynthesis no soportado al intentar hacer unlock")
      return
    }
    
    const doUnlock = () => {
      logger.info("Desbloqueando SpeechSynthesis con gesto del usuario")
      const synth = window.speechSynthesis
      const primer = new SpeechSynthesisUtterance(" ")
      primer.volume = 0
      synth.speak(primer)
      
      // Desbloquear el Fallback en la Nube
      TTSService.unlockCloudAudio()
    }

    if (!voicesLoaded || globalVoices.length === 0) {
      logger.warn("Voces no cargadas aún. Encolando unlock.")
      pendingCallbacks.push(doUnlock)
      // Fallback: Si en 1.5s no cargan las voces, ejecutamos igual para no bloquear
      setTimeout(doUnlock, 1500)
    } else {
      doUnlock()
    }
  }, [])

  const speak = useCallback(
    (text: string, lang: LangCode) => {
      if (!supportedRef.current) {
        logger.error("Intento de speak() fallido: SpeechSynthesis no está soportado")
        return
      }
      
      const doSpeak = () => {
        const synth = window.speechSynthesis
        logger.debug("Preparando speech", { text, lang, speaking: synth.speaking, pending: synth.pending })
        
        // NOTA: Eliminamos synth.cancel() automático aquí.
        // Cancelar e inmediatamente hablar crashea el motor de Chrome en Linux ("synthesis-failed").
        // Simplemente encolaremos el mensaje detrás del "primer" de desbloqueo.
        
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = lang
        
        // Usar las voces globales
        const voices = globalVoices.length > 0 ? globalVoices : synth.getVoices()
        const prefix = lang.split("-")[0]
        const voice = 
          voices.find((v) => v.lang === lang) ??
          voices.find((v) => v.lang.replace("_", "-") === lang) ??
          voices.find((v) => v.lang.toLowerCase().startsWith(prefix))
        
        if (voice) {
          utterance.voice = voice
          logger.debug("Voz asignada", { voiceURI: voice.voiceURI, lang: voice.lang })
        } else {
          logger.warn("No se encontró voz nativa para el idioma, usando por defecto", { lang, availableVoicesCount: voices.length })
        }
        
        utterance.rate = 1
        utterance.pitch = 1
        
        utterance.onend = () => logger.debug("Speech finalizado con éxito")
        utterance.onerror = (e) => logger.error("Error reproduciendo speech", { error: e.error })
        
        synth.resume()
        synth.speak(utterance)
        logger.info("Speech enviado al motor de síntesis")
      }

      if (!voicesLoaded || globalVoices.length === 0) {
        logger.warn("Voces no cargadas aún. Encolando speech.", { text })
        let executed = false
        const wrappedCb = () => {
          if (executed) return
          executed = true
          doSpeak()
        }
        pendingCallbacks.push(wrappedCb)
        
        // Timeout de seguridad: Si pasan 2 segundos y el OS no devuelve voces (Linux roto),
        // abandonamos el motor nativo y usamos la Nube.
        setTimeout(() => {
          if (!executed) {
            logger.error("Timeout esperando voces nativas. Activando Fallback en la Nube (Cloud TTS).")
            executed = true
            const idx = pendingCallbacks.indexOf(wrappedCb)
            if (idx > -1) pendingCallbacks.splice(idx, 1)
            
            // Delegar a la API Proxy y pitido si falla
            TTSService.playCloudVoice(text, lang).catch(() => {
              playEmergencyBeep()
            })
          }
        }, 2000)
      } else {
        doSpeak()
      }
    },
    [],
  )

  const cancel = useCallback(() => {
    if (supportedRef.current) window.speechSynthesis.cancel()
  }, [])

  useEffect(() => {
    return () => {
      if (supportedRef.current) window.speechSynthesis.cancel()
    }
  }, [])

  return { speak, cancel, unlock }
}
