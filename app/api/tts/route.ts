import { NextResponse } from "next/server"
import { tryCatch } from "@/lib/try-catch"


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get("text")
  const lang = searchParams.get("lang") || "es-ES"

  if (!text) {
    return new NextResponse("Missing text parameter", { status: 400 })
  }

  const fetchAudio = async () => {
    // Capa 2: Google Cloud TTS Oficial (Premium)
    const apiKey = process.env.GOOGLE_TTS_API_KEY
    if (apiKey) {
      try {
        const cloudTtsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`
        
        let targetLang = lang;
        if (targetLang === "es") targetLang = "es-US"; // Fallback por defecto si no hay país

        // Por defecto intentamos pedir la voz estándar del dialecto detectado (ej: es-CL-Standard-A)
        let voiceName = `${targetLang}-Standard-A` 
        
        // Voces Premium (Neural2) para dialectos conocidos y soportados
        if (targetLang === "es-ES") {
          voiceName = "es-ES-Neural2-A"
        } else if (targetLang === "es-US") {
          voiceName = "es-US-Neural2-A"
        }

        const cloudRes = await fetch(cloudTtsUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: targetLang, name: voiceName },
            audioConfig: { audioEncoding: "MP3" }
          })
        })

        if (cloudRes.ok) {
          const data = await cloudRes.json()
          return Buffer.from(data.audioContent, "base64")
        }
      } catch (e) {
        console.warn("Fallo en Google Cloud TTS, pasando a fallback (Translate).", e)
      }
    }

    // Capa 3: Google Translate (Gratis)
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`
    const response = await fetch(googleTtsUrl, {
      headers: {
        // Nos hacemos pasar por un navegador estándar para evitar ser bloqueados por Google
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Referer": "https://translate.google.com/"
      }
    })

    if (!response.ok) {
      throw new Error(`Google TTS API responded with status: ${response.status}`)
    }

    return response.arrayBuffer()
  }

  const [error, arrayBuffer] = await tryCatch(fetchAudio(), "Fallo en API proxy de TTS")

  if (error || !arrayBuffer) {
    return new NextResponse("Error generating speech", { status: 500 })
  }

  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable" // Cachear la voz para no hacer tantas peticiones
    },
  })
}
