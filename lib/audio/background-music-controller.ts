import { duckingBus } from "./audio-ducking-bus"
import type { IFilePlayer, ISoundGenerator } from "./interfaces"

export class BackgroundMusicController {
  private player: IFilePlayer
  private sfx: ISoundGenerator
  private currentStage = 0
  private readonly BASE_VOLUME = 0.4
  private readonly DUCK_VOLUME = 0.1
  private unsubscribeDucking: (() => void) | null = null

  constructor(player: IFilePlayer, sfx: ISoundGenerator) {
    this.player = player
    this.sfx = sfx

    this.player.setSource("/bg-music.ogg")
    this.player.setLoop(true)
    this.player.setVolume(this.BASE_VOLUME)

    this.unsubscribeDucking = duckingBus.subscribe(isDucking => {
      this.player.setVolume(isDucking ? this.DUCK_VOLUME : this.BASE_VOLUME)
    })
  }

  start(): void {
    this.player.play()
  }

  stop(): void {
    this.player.stop()
    this.currentStage = 0
    this.player.setPlaybackRate(1.0)
  }

  pause(): void {
    this.player.pause()
  }

  updatePace(remainingSec: number, durationSec: number): void {
    const percentage = durationSec > 0 ? (remainingSec / durationSec) * 100 : 0
    let targetRate = 1.0
    let stage = 1

    if (percentage <= 5 || (remainingSec <= 15 && durationSec > 30)) {
      targetRate = 1.5
      stage = 4
    } else if (percentage <= 25) {
      targetRate = 1.3
      stage = 3
    } else if (percentage <= 50) {
      targetRate = 1.15
      stage = 2
    }

    if (stage > this.currentStage && this.currentStage !== 0) {
      this.sfx.playTone("emergency")
    }

    this.currentStage = stage
    this.player.setPlaybackRate(targetRate)
  }

  destroy(): void {
    if (this.unsubscribeDucking) {
      this.unsubscribeDucking()
    }
    this.stop()
  }
}
