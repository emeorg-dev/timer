import { de } from "./de"
import { en } from "./en"
import { es } from "./es"
import { fr } from "./fr"
import { it } from "./it"
import { pt } from "./pt"
import type { Locale, TranslationDictionary } from "./types"

export type { Locale, Locale as LangCode, TranslationDictionary }

export interface LanguageOption {
  code: Locale
  label: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
]

export const SUPPORTED_LOCALES = ["es", "en", "pt", "fr", "de", "it"] as const
export const DEFAULT_LOCALE: Locale = "es"

const SUPPORTED_LOCALES_SET = new Set<string>(SUPPORTED_LOCALES)

export function isSupportedLocale(locale: unknown): locale is Locale {
  return typeof locale === "string" && SUPPORTED_LOCALES_SET.has(locale)
}

export const dictionaries: Record<Locale, TranslationDictionary> = {
  es,
  en,
  pt,
  fr,
  de,
  it,
}

// Utility to get a deeply nested property using dot notation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNestedTranslation(obj: any, path: string): string {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj) || path
}
