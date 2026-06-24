"use client"

import { useCallback, useEffect, useRef } from "react"
import type { LangCode } from "@/lib/i18n"
import { createLogger } from "@/lib/logger"
import { TTSService } from "@/lib/services/tts-service"
import { playEmergencyBeep } from "./use-sound"

const logger = createLogger("useSpeech")

// Tiempos de espera configurables para evitar números mágicos
const NATIVE_VOICE_TIMEOUT_MS = 2000
const UNLOCK_TIMEOUT_MS = 1500

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
        const pendingSpeechTask = pendingCallbacks.shift()
        if (pendingSpeechTask) pendingSpeechTask()
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
      const silentAudioUnlockUtterance = new SpeechSynthesisUtterance(" ")
      silentAudioUnlockUtterance.volume = 0
      synth.speak(silentAudioUnlockUtterance)

      // Desbloquear el Fallback en la Nube
      TTSService.unlockCloudAudio()
    }

    if (!voicesLoaded) {
      logger.warn("Voces no cargadas aún. Encolando unlock.")
      pendingCallbacks.push(doUnlock)
      // Fallback: Si en 1.5s no cargan las voces, ejecutamos igual para no bloquear
      setTimeout(doUnlock, UNLOCK_TIMEOUT_MS)
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

      const doFallback = () => {
        logger.info("Delegando habla al Fallback en la Nube (Cloud TTS).")
        TTSService.playCloudVoice(text, lang).catch(() => {
          playEmergencyBeep()
        })
      }

      const doSpeakNative = () => {
        const synth = window.speechSynthesis
        logger.debug("Preparando speech", { text, lang, speaking: synth.speaking, pending: synth.pending })

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
        logger.info("Speech enviado al motor de síntesis nativo")
      }

      // 1. Si las voces aún no han cargado del todo, encolamos y esperamos un máximo de 2 segundos.
      if (!voicesLoaded) {
        logger.warn("Voces no cargadas aún. Encolando speech.", { text })
        let isSpeechResolved = false

        const executeSpeechTask = () => {
          if (isSpeechResolved) return
          isSpeechResolved = true

          if (globalVoices.length === 0) {
            doFallback()
          } else {
            doSpeakNative()
          }
        }
        pendingCallbacks.push(executeSpeechTask)

        // Timeout de seguridad: Si pasan 2 segundos y el OS no devuelve voces, abortamos y usamos la Nube.
        setTimeout(() => {
          if (!isSpeechResolved) {
            logger.error("Timeout esperando voces nativas. Activando Fallback en la Nube (Cloud TTS).")
            isSpeechResolved = true
            const idx = pendingCallbacks.indexOf(executeSpeechTask)
            if (idx > -1) pendingCallbacks.splice(idx, 1)

            doFallback()
          }
        }, NATIVE_VOICE_TIMEOUT_MS)
      }
      // 2. Si las voces YA cargaron, pero el array está vacío (Ej. Linux sin voces instaladas), saltamos a la Nube de inmediato.
      else if (globalVoices.length === 0) {
        logger.warn("El navegador reportó 0 voces nativas instaladas. Activando Fallback inmediato.")
        doFallback()
      }
      // 3. Caso ideal: Voces cargadas y disponibles. Hablamos por el navegador.
      else {
        doSpeakNative()
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
