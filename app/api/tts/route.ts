import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get("text")
  const lang = searchParams.get("lang") || "es-ES"

  if (!text) {
    return new NextResponse("Missing text parameter", { status: 400 })
  }

  try {
    // Usamos el endpoint público de Google Translate como servicio de voz gratuito.
    // Al hacerlo desde el servidor, evitamos los bloqueos de CORS y Autoplay del navegador.
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

    const arrayBuffer = await response.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable" // Cachear la voz para no hacer tantas peticiones
      },
    })
  } catch (error) {
    console.error("Error en API proxy de TTS:", error)
    return new NextResponse("Error generating speech", { status: 500 })
  }
}
