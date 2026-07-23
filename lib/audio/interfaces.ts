export type SoundType = "start" | "pause" | "finish" | "emergency"

export interface IAudioOutput {
  play(): void
  pause(): void
  stop(): void
}

export interface IFilePlayer extends IAudioOutput {
  setSource(src: string): void
  setVolume(vol: number): void
  setPlaybackRate(rate: number): void
  setLoop(loop: boolean): void
}

export interface ISoundGenerator {
  playTone(type: SoundType): void
}
