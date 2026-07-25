import deDE from "./de-DE/translation.json"
import enUS from "./en-US/translation.json"
import esES from "./es-ES/translation.json"
import frFR from "./fr-FR/translation.json"
import itIT from "./it-IT/translation.json"
import ptBR from "./pt-BR/translation.json"

export type LangCode = "es-ES" | "en-US" | "pt-BR" | "fr-FR" | "de-DE" | "it-IT"

export interface LanguageOption {
  code: LangCode
  label: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: "es-ES", label: "Español" },
  { code: "en-US", label: "English" },
  { code: "pt-BR", label: "Português" },
  { code: "fr-FR", label: "Français" },
  { code: "de-DE", label: "Deutsch" },
  { code: "it-IT", label: "Italiano" },
]

export type UIKey = keyof typeof esES

export const UI: Record<LangCode, Record<UIKey, string>> = {
  "es-ES": esES,
  "en-US": enUS,
  "pt-BR": ptBR,
  "fr-FR": frFR,
  "de-DE": deDE,
  "it-IT": itIT,
}

export function t(lang: LangCode, key: UIKey): string {
  return UI[lang][key]
}
