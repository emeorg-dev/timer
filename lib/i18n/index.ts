import deDE from "./de-DE/translation.json"
import enUS from "./en-US/translation.json"
import esES from "./es-ES/translation.json"
import frFR from "./fr-FR/translation.json"
import itIT from "./it-IT/translation.json"
import ptBR from "./pt-BR/translation.json"

/**
 * Identificadores oficiales y dialectos soportados por el motor de localización e internacionalización.
 */
export type LangCode = "es-ES" | "en-US" | "pt-BR" | "fr-FR" | "de-DE" | "it-IT"

/**
 * Opción de selección lingüística utilizada para renderizar selectores en la interfaz de configuración.
 */
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

/**
 * Clave de traducción inferida del diccionario base en español, garantizando tipado estricto en todos los idiomas.
 */
export type UIKey = keyof typeof esES

export const UI: Record<LangCode, Record<UIKey, string>> = {
  "es-ES": esES,
  "en-US": enUS,
  "pt-BR": ptBR,
  "fr-FR": frFR,
  "de-DE": deDE,
  "it-IT": itIT,
}

/**
 * Recupera de forma segura e inmutable la cadena de texto localizada para un idioma y clave específicos.
 *
 * @param lang Código oficial del idioma activo seleccionado por el usuario.
 * @param key Clave tipada (`UIKey`) que identifica el recurso textual en el diccionario.
 * @returns Cadena traducida lista para ser renderizada en el DOM o pronunciada por voz.
 *
 * @example
 * const boton = t("es-ES", "start"); // Retorna "Iniciar"
 */
export function t(lang: LangCode, key: UIKey): string {
  return UI[lang][key]
}
