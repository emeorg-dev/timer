import { beforeEach, describe, expect, it, vi } from "vitest"

import { GET } from "./route"

vi.mock("next/server", () => {
  class MockResponse {
    status: number
    body: unknown
    headers: Record<string, string>

    constructor(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      this.body = body
      this.status = init?.status || 200
      this.headers = init?.headers || {}
    }

    static json(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      return new MockResponse(body, init)
    }

    async json() {
      return typeof this.body === "string" ? JSON.parse(this.body) : this.body
    }
  }

  return { NextResponse: MockResponse }
})

describe("TTS API Route con Estandarización de Errores", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("fetch", vi.fn())
  })

  it("devuelve 400 y estructura JSON VALIDATION_ERROR si el parámetro text no está presente", async () => {
    const req = new Request("http://localhost/api/tts")
    const res = (await GET(req)) as unknown as {
      status: number
      body: { code: string; errorId: string; message: string }
    }

    expect(res.status).toBe(400)
    expect(res.body.code).toBe("VALIDATION_ERROR")
    expect(res.body.errorId).toBeDefined()
    expect(res.body.message).toContain("Invalid or missing text parameter")
  })

  it("devuelve 400 y estructura JSON VALIDATION_ERROR si el texto supera los 200 caracteres", async () => {
    const longText = "a".repeat(201)
    const req = new Request(`http://localhost/api/tts?text=${longText}`)
    const res = (await GET(req)) as unknown as {
      status: number
      body: { code: string; errorId: string }
    }

    expect(res.status).toBe(400)
    expect(res.body.code).toBe("VALIDATION_ERROR")
  })

  it("devuelve 400 y estructura JSON VALIDATION_ERROR si el formato de lang es inválido", async () => {
    const req = new Request(`http://localhost/api/tts?text=hello&lang=invalid`)
    const res = (await GET(req)) as unknown as {
      status: number
      body: { code: string; errorId: string }
    }

    expect(res.status).toBe(400)
    expect(res.body.code).toBe("VALIDATION_ERROR")
  })

  it("devuelve 502 y estructura JSON AUDIO_SYNTHESIS_FAILED si los servicios de voz en nube fallan", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })
    )

    const req = new Request(`http://localhost/api/tts?text=hola&lang=es-ES`)
    const res = (await GET(req)) as unknown as {
      status: number
      body: { code: string; errorId: string }
    }

    expect(res.status).toBe(502)
    expect(res.body.code).toBe("AUDIO_SYNTHESIS_FAILED")
    expect(res.body.errorId).toBeDefined()
  })

  it("sintetiza exitosamente y devuelve 200 con cabeceras de caché inmutables ante parámetros válidos", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      })
    )

    const req = new Request(`http://localhost/api/tts?text=hola&lang=es-ES`)
    const res = (await GET(req)) as unknown as { status: number; headers: Record<string, string> }

    expect(res.status).toBe(200)
    expect(res.headers["Cache-Control"]).toBe("public, max-age=31536000, immutable")
  })

  it("devuelve 429 y estructura JSON RATE_LIMIT_EXCEEDED si una IP supera el cupo de 50 peticiones/min", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      })
    )

    const ip = "192.168.1.100"
    let lastRes: { status: number; body?: { code: string } } = { status: 200 }

    // Realizamos 51 peticiones continuas desde la misma IP
    for (let i = 0; i < 51; i++) {
      const req = new Request(`http://localhost/api/tts?text=test${i}&lang=es-ES`, {
        headers: { "x-forwarded-for": ip },
      })
      lastRes = (await GET(req)) as unknown as { status: number; body?: { code: string } }
    }

    expect(lastRes.status).toBe(429)
    expect(lastRes.body?.code).toBe("RATE_LIMIT_EXCEEDED")
  })
})
