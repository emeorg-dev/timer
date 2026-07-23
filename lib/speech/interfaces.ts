export interface ISpeaker {
  speak(text: string, lang: string): void
  cancel(): void
}
