import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextResponse } from 'next/server'

vi.mock('next/server', () => ({
  NextResponse: class {
    status: number
    body: any
    constructor(body: any, init?: { status?: number, headers?: any }) {
      this.body = body
      this.status = init?.status || 200
    }
  }
}))

describe('TTS API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns 400 if text is missing', async () => {
    const req = new Request('http://localhost/api/tts')
    const res = await GET(req) as unknown as { status: number }
    expect(res.status).toBe(400)
  })

  it('returns 400 if text is too long', async () => {
    const longText = 'a'.repeat(201)
    const req = new Request(`http://localhost/api/tts?text=${longText}`)
    const res = await GET(req) as unknown as { status: number }
    expect(res.status).toBe(400)
  })

  it('returns 400 if lang is invalid', async () => {
    const req = new Request(`http://localhost/api/tts?text=hello&lang=invalid`)
    const res = await GET(req) as unknown as { status: number }
    expect(res.status).toBe(400)
  })

  it('fetches successfully with valid parameters', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
    }))

    const req = new Request(`http://localhost/api/tts?text=hello&lang=en-US`)
    const res = await GET(req) as unknown as { status: number }
    expect(res.status).toBe(200)
  })
})
