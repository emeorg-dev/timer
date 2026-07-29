import { describe, expect, it, vi } from "vitest"

import type { IAudioDucking } from "./audio-ducking-bus"
import { BackgroundMusicController } from "./background-music-controller"
import type { IFilePlayer, ISoundGenerator } from "./interfaces"

function createPlayer(): IFilePlayer {
  return {
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    setSource: vi.fn(),
    setVolume: vi.fn(),
    setPlaybackRate: vi.fn(),
    setLoop: vi.fn(),
  }
}

function createSoundGenerator(): ISoundGenerator {
  return { playTone: vi.fn() }
}

function createDuckingBus(): {
  bus: IAudioDucking
  notify: (isDucking: boolean) => void
  unsubscribe: ReturnType<typeof vi.fn>
} {
  let listener: (isDucking: boolean) => void = () => {}
  const unsubscribe = vi.fn()

  return {
    bus: {
      subscribe: nextListener => {
        listener = nextListener
        nextListener(false)
        return unsubscribe
      },
      requestDuck: vi.fn(),
      releaseDuck: vi.fn(),
    },
    notify: isDucking => listener(isDucking),
    unsubscribe,
  }
}

describe("BackgroundMusicController", () => {
  it("reacciona al bus inyectado y limpia su suscripción", () => {
    const player = createPlayer()
    const ducking = createDuckingBus()
    const controller = new BackgroundMusicController(player, createSoundGenerator(), ducking.bus)

    controller.setVolume(0.8)
    ducking.notify(true)

    expect(player.setVolume).toHaveBeenLastCalledWith(0.2)

    controller.destroy()

    expect(ducking.unsubscribe).toHaveBeenCalledOnce()
    expect(player.stop).toHaveBeenCalledOnce()
  })
})
