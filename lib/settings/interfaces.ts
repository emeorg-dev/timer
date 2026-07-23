import { Settings } from "./types"

export interface ISettingsRepository {
  load(): Settings
  save(settings: Settings): void
}
