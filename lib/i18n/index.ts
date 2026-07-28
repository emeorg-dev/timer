import de from "./de"
import en from "./en"
import es from "./es"
import fr from "./fr"
import it from "./it"
import pt from "./pt"

/**
 * Identificadores oficiales y dialectos soportados por el motor de localización e internacionalización.
 */
export type LangCode = "es" | "en" | "pt" | "fr" | "de" | "it"

/**
 * Opción de selección lingüística utilizada para renderizar selectores en la interfaz de configuración.
 */
export interface LanguageOption {
  code: LangCode
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

/**
 * Clave de traducción inferida del diccionario base en español, garantizando tipado estricto en todos los idiomas.
 */
export type UIKey = keyof typeof es

export const UI: Record<LangCode, Record<UIKey, string>> = {
  es,
  en,
  pt,
  fr,
  de,
  it,
}

/**
 * Recupera de forma segura e inmutable la cadena de texto localizada para un idioma y clave específicos.
 *
 * @param lang Código oficial del idioma activo seleccionado por el usuario.
 * @param key Clave tipada (`UIKey`) que identifica el recurso textual en el diccionario.
 * @returns Cadena traducida lista para ser renderizada en el DOM o pronunciada por voz.
 *
 * @example
 * const boton = t("es", "start"); // Retorna "Iniciar"
 */
export function t(lang: LangCode, key: UIKey): string {
  const dictionary = UI[lang] || UI["es"]
  return dictionary[key]
}
