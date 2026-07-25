import { NextResponse } from "next/server"

import { AudioSynthesisError, handleApiError, RateLimitError, ValidationError } from "@/lib/errors"
import { createLogger } from "@/lib/logger"
import { tryCatch } from "@/lib/try-catch"

const logger = createLogger("CloudTTS")

/**
 * Registro en memoria para el control de frecuencia de peticiones por dirección IP (Rate Limiter).
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 50
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minuto

/**
 * Evalúa si una dirección IP cliente ha excedido el cupo de peticiones permitidas por minuto.
 *
 * @param ip Dirección IP identificada en las cabeceras de la petición.
 * @returns `true` si el cliente superó el límite y debe ser bloqueado con un estado HTTP 429.
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const currentRecord = rateLimitMap.get(ip)
  const hasActiveWindow = currentRecord && currentRecord.resetAt > now

  if (hasActiveWindow) {
    const isQuotaExceeded = currentRecord.count >= RATE_LIMIT_MAX
    if (isQuotaExceeded) {
      return true
    }
    currentRecord.count++
    return false
  }

  rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
  return false
}

/**
 * Valida la integridad y formato de los parámetros lingüísticos y textuales recibidos en la URL.
 *
 * @param text Cadena de texto a sintetizar.
 * @param lang Código de dialecto solicitado (ej. 'es-ES').
 * @returns Resultado de la validación conteniendo el estado y un mensaje de error si procede.
 */
function validateSpeechRequest(
  text: string | null,
  lang: string
): { isValid: boolean; errorMessage?: string } {
  const isTextMissingOrTooLong = !text || text.length > 200
  if (isTextMissingOrTooLong) {
    return { isValid: false, errorMessage: "Invalid or missing text parameter (max 200 chars)" }
  }

  const isLangFormatInvalid = !/^[a-zA-Z]{2}(-[a-zA-Z]{2,3})?$/.test(lang)
  if (isLangFormatInvalid) {
    return { isValid: false, errorMessage: "Invalid lang parameter" }
  }

  return { isValid: true }
}

/**
 * Determina el nombre exacto de la voz y el dialecto regional para la API de Google Cloud TTS.
 *
 * Prioriza voces neuronales de alta fidelidad (`Neural2`) para los dialectos principales en español,
 * recurriendo a voces estándar (`Standard-A`) para cualquier otra variante idiomática.
 *
 * @param lang Código de dialecto solicitado.
 * @returns Estructura con el código de lenguaje ajustado y el identificador de voz en nube.
 */
function resolveNeuralVoiceConfig(lang: string): { targetLang: string; voiceName: string } {
  const targetLang = lang === "es" ? "es-US" : lang

  const NEURAL_VOICES: Record<string, string> = {
    "es-ES": "es-ES-Neural2-A",
    "es-US": "es-US-Neural2-A",
  }

  const voiceName = NEURAL_VOICES[targetLang] || `${targetLang}-Standard-A`
  return { targetLang, voiceName }
}

/**
 * Intenta generar la locución utilizando la API oficial y de alta definición de Google Cloud TTS (Capa 1).
 *
 * @param text Texto legitimado a locutar.
 * @param lang Dialecto seleccionado.
 * @param apiKey Clave secreta de autenticación de Google Cloud.
 * @param signal Señal de cancelación de temporizador de seguridad.
 * @returns Búfer de audio MP3 o `null` si el servicio oficial falla o rechaza la solicitud.
 */
async function synthesizeWithGoogleCloud(
  text: string,
  lang: string,
  apiKey: string,
  signal: AbortSignal
): Promise<ArrayBuffer | null> {
  try {
    const cloudTtsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`
    const { targetLang, voiceName } = resolveNeuralVoiceConfig(lang)

    const cloudResponse = await fetch(cloudTtsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: targetLang, name: voiceName },
        audioConfig: { audioEncoding: "MP3" },
      }),
      signal,
    })

    const isSynthesisSuccessful = cloudResponse.ok
    if (isSynthesisSuccessful) {
      const data = await cloudResponse.json()
      const buffer = Buffer.from(data.audioContent, "base64")
      return new Uint8Array(buffer).buffer as ArrayBuffer
    }
  } catch (error) {
    logger.warn(
      "Fallo en Google Cloud TTS (Capa 1), degradando al servicio gratuito de respaldo.",
      { error }
    )
  }
  return null
}

/**
 * Sintetiza la voz utilizando el endpoint gratuito de Google Translate TTS (Capa 2 / Respaldo).
 *
 * Emula los encabezados de un navegador estándar para garantizar la disponibilidad del audio
 * cuando la clave API oficial no está presente o ha agotado su cuota en la nube.
 *
 * @param text Texto a pronunciar.
 * @param lang Código oficial del idioma.
 * @param signal Señal de aborto para evitar peticiones colgadas.
 * @returns Búfer con los datos binarios del archivo MP3 generado.
 */
async function synthesizeWithGoogleTranslate(
  text: string,
  lang: string,
  signal: AbortSignal
): Promise<ArrayBuffer> {
  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`

  const response = await fetch(googleTtsUrl, {
    headers: {
      // Nos hacemos pasar por un navegador estándar para evitar ser bloqueados por los firewalls
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Referer: "https://translate.google.com/",
    },
    signal,
  })

  const isResponseValid = response.ok
  if (!isResponseValid) {
    throw new Error(`Google TTS API responded with status: ${response.status}`)
  }

  return response.arrayBuffer()
}

/**
 * Orquesta la cadena de síntesis en nube (Patrón Chain of Responsibility).
 *
 * Intenta en primera instancia generar el audio mediante la infraestructura Premium (Google Cloud TTS);
 * si esta opción no está configurada o falla, transiciona de manera transparente al motor gratuito de respaldo.
 * Impone una temporización máxima de 5 segundos (`AbortController`) para no congelar la interfaz del usuario.
 */
async function orchestrateCloudSpeech(text: string, lang: string): Promise<ArrayBuffer> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)

  try {
    const apiKey = process.env.GOOGLE_TTS_API_KEY
    const hasCloudApiKey = Boolean(apiKey)

    if (hasCloudApiKey) {
      const cloudBuffer = await synthesizeWithGoogleCloud(text, lang, apiKey!, controller.signal)
      const isCloudSynthesisSuccessful = Boolean(cloudBuffer)
      if (isCloudSynthesisSuccessful) {
        return cloudBuffer!
      }
    }

    // Respaldo (Fallback): Google Translate TTS
    return await synthesizeWithGoogleTranslate(text, lang, controller.signal)
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Endpoint y Proxy Backend para la Síntesis de Voz en Nube (Cloud TTS API Route).
 *
 * Actúa como la fachada de servidor y escudo de seguridad para el orquestador vocal (`SpeechOrchestrator`).
 * Provee locución artificial a navegadores web carentes de motores nativos compatibles o sin voces locales instaladas.
 *
 * Implementa las siguientes garantías arquitectónicas:
 * 1. **Seguridad y Cuotas**: Protección in-memory contra ataques de denegación de servicio mediante Rate Limiting.
 * 2. **Alta Disponibilidad**: Cadena de responsabilidad entre Google Cloud TTS (Neural) y Google Translate TTS (Gratis).
 * 3. **Rendimiento e Inmutabilidad**: Cabeceras `Cache-Control` inmutables de 1 año (`max-age=31536000`), logrando
 *    que frases recurrentes como "Faltan 5 minutos" sean servidas en milisegundos desde la caché local del disco del usuario.
 *
 * @param request Petición HTTP entrante con parámetros `text` y `lang` en la cadena de consulta.
 * @returns Respuesta HTTP con el payload de audio MP3 o un código de error de validación/límite.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const text = searchParams.get("text")
    const lang = searchParams.get("lang") || "es-ES"

    // 1. Validación gramatical y de longitud lanzando excepción semántica
    const validation = validateSpeechRequest(text, lang)
    const isRequestInvalid = !validation.isValid
    if (isRequestInvalid) {
      throw new ValidationError(validation.errorMessage || "Texto o formato de idioma inválido")
    }

    // 2. Control de frecuencia (Rate Limiting) por dirección IP
    const clientIp = request.headers.get("x-forwarded-for") || "unknown"
    const isRateLimitExceeded = checkRateLimit(clientIp)
    if (isRateLimitExceeded) {
      throw new RateLimitError(clientIp)
    }

    // 3. Orquestación de síntesis vocal con manejo seguro de excepciones
    const [error, audioBuffer] = await tryCatch(
      orchestrateCloudSpeech(text!, lang),
      "Fallo en API proxy de TTS"
    )

    const isSpeechGenerationFailed = error || !audioBuffer
    if (isSpeechGenerationFailed) {
      throw new AudioSynthesisError(
        "Fallo al sintetizar el audio en todos los servicios de nube.",
        error
      )
    }

    // 4. Entrega con caché inmutable de alto rendimiento
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    // 5. Interceptación y normalización en JSON estructurado (Error Standardization)
    return handleApiError(error)
  }
}
