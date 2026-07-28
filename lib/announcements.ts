import type { LangCode } from "./i18n"

type AnnouncementMode = "remaining" | "elapsed"

interface PhraseUnits {
  hour: [string, string] // [singular, plural]
  minute: [string, string]
  second: [string, string]
  remaining: (units: string, isPlural: boolean) => string
  elapsed: (units: string, isPlural: boolean) => string
  finished: string
  and: string
}

const PHRASES: Record<LangCode, PhraseUnits> = {
  es: {
    hour: ["hora", "horas"],
    minute: ["minuto", "minutos"],
    second: ["segundo", "segundos"],
    remaining: (u, p) => `Queda${p ? "n" : ""} ${u}`,
    elapsed: (u, p) => `Ha${p ? "n" : ""} pasado ${u}`,
    finished: "Tiempo finalizado",
    and: "y",
  },
  en: {
    hour: ["hour", "hours"],
    minute: ["minute", "minutes"],
    second: ["second", "seconds"],
    remaining: u => `${u} remaining`,
    elapsed: (u, p) => `${u} ${p ? "have" : "has"} passed`,
    finished: "Time is up",
    and: "and",
  },
  pt: {
    hour: ["hora", "horas"],
    minute: ["minuto", "minutos"],
    second: ["segundo", "segundos"],
    remaining: (u, p) => `Falta${p ? "m" : ""} ${u}`,
    elapsed: (u, p) => `Passou${p ? "ram" : ""} ${u}`,
    finished: "Tempo esgotado",
    and: "e",
  },
  fr: {
    hour: ["heure", "heures"],
    minute: ["minute", "minutes"],
    second: ["seconde", "secondes"],
    remaining: u => `Il reste ${u}`,
    elapsed: (u, p) => `${u} ${p ? "se sont écoulées" : "s'est écoulée"}`,
    finished: "Temps écoulé",
    and: "et",
  },
  de: {
    hour: ["Stunde", "Stunden"],
    minute: ["Minute", "Minuten"],
    second: ["Sekunde", "Sekunden"],
    remaining: u => `Noch ${u}`,
    elapsed: (u, p) => `${u} ${p ? "sind" : "ist"} vergangen`,
    finished: "Zeit abgelaufen",
    and: "und",
  },
  it: {
    hour: ["ora", "ore"],
    minute: ["minuto", "minuti"],
    second: ["secondo", "secondi"],
    remaining: (u, p) => `Manca${p ? "no" : ""} ${u}`,
    elapsed: (u, p) => `${p ? "Sono passati" : "È passato"} ${u}`,
    finished: "Tempo scaduto",
    and: "e",
  },
}

interface TimeComponents {
  hours: number
  minutes: number
  seconds: number
}

/**
 * Descompone un total de segundos absolutos en sus componentes sexagesimales (horas, minutos y segundos).
 *
 * Esencial para el formateo humano y gramatical del tiempo, aislando el cálculo matemático básico
 * del procesamiento lingüístico en cumplimiento con el Principio de Responsabilidad Única (SRP).
 *
 * @param totalSeconds Cantidad de segundos enteros a convertir.
 * @returns Estructura con las horas, minutos y segundos desglosados.
 */
function extractTimeComponents(totalSeconds: number): TimeComponents {
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

/**
 * Formatea una cantidad numérica junto a su unidad temporal con la conjugación gramatical correcta.
 *
 * @param value Valor numérico de la unidad de tiempo (ej. 1 o 5).
 * @param unit Par de palabras en singular y plural [singular, plural] correspondientes al idioma.
 * @returns Cadena formateada como '1 hora' o '5 horas'.
 */
function formatUnitPhrase(value: number, unit: [string, string]): string {
  const isSingular = value === 1
  return `${value} ${isSingular ? unit[0] : unit[1]}`
}

/**
 * Convierte los componentes temporales en una lista de fragmentos verbales ordenados y limpios.
 *
 * Omite unidades con valor cero para producir frases concisas y naturales (ej. oculta los segundos
 * si el temporizador excede 1 hora, a menos que el tiempo total sea inferior a un minuto).
 *
 * @param components Horas, minutos y segundos calculados para la locución.
 * @param phrases Diccionario lingüístico con las conjugaciones del dialecto activo.
 * @returns Lista de cadenas descriptivas listas para ser concatenadas (ej. ['2 horas', '15 minutos']).
 */
function buildLocalizedTimeParts(components: TimeComponents, phrases: PhraseUnits): string[] {
  const { hours, minutes, seconds } = components
  const parts: string[] = []

  if (hours > 0) parts.push(formatUnitPhrase(hours, phrases.hour))
  if (minutes > 0) parts.push(formatUnitPhrase(minutes, phrases.minute))
  if (seconds > 0 && hours === 0) parts.push(formatUnitPhrase(seconds, phrases.second))

  if (parts.length === 0) parts.push(formatUnitPhrase(0, phrases.second))
  return parts
}

/**
 * Une múltiples fragmentos de tiempo utilizando comas y la conjunción coordinante final apropiada del idioma.
 *
 * @param parts Fragmentos de tiempo ya formateados en singular o plural.
 * @param conjunction Conjunción nativa para el último elemento (ej. 'y' en español, 'and' en inglés).
 * @returns Frase temporal cohesiva (ej. '1 hora, 20 minutos y 5 segundos').
 */
function joinTimePartsWithConjunction(parts: string[], conjunction: string): string {
  if (parts.length === 1) return parts[0]
  const initialParts = parts.slice(0, -1).join(", ")
  const lastPart = parts[parts.length - 1]
  return `${initialParts} ${conjunction} ${lastPart}`
}

/**
 * Determina el primer valor numérico significativo (horas, minutos o segundos) en un intervalo temporal.
 *
 * Esencial para el motor gramatical de internacionalización (i18n), ya que permite evaluar
 * las reglas de pluralización nativas (`Intl.PluralRules`) del idioma activo basándose en la unidad de
 * mayor jerarquía que encabezará la oración en voz alta.
 *
 * @param components Componentes desglosados de tiempo (horas, minutos y segundos exactos).
 * @returns El valor numérico principal sobre el cual recae la conjugación gramatical (singular o plural).
 */
function getLeadingNumericValue(components: TimeComponents): number {
  const hasHours = components.hours > 0
  if (hasHours) return components.hours

  const hasMinutes = components.minutes > 0
  if (hasMinutes) return components.minutes

  return components.seconds
}

/**
 * Construye una frase verbal en lenguaje natural lista para ser narrada por el motor de síntesis vocal (TTS).
 *
 * Sigue los principios de Arquitectura Limpia y SOLID dividiendo el proceso de locución en transformaciones
 * puras e independientes: desglosar el tiempo, traducir unidades, aplicar conjugaciones de plural (`Intl.PluralRules`)
 * y envolver la oración según el modo de cuenta ('remaining' para cuenta regresiva o 'elapsed' para progresiva).
 *
 * @param totalSeconds Segundos exactos del evento auditivo que se desea narrar.
 * @param lang Dialecto e idioma oficial de la locución (ej. 'es-ES', 'pt-BR').
 * @param mode Modo de cuenta que determina el encabezado gramatical (ej. 'Quedan X' o 'Han pasado X').
 * @param isSmart Indica si el modo de Hitos Inteligentes está activo para pronunciar solo números en los últimos 10s.
 * @returns Oración completa y localizada, optimizada para su comprensión auditiva por voz natural.
 *
 * @example
 * const locucion = buildAnnouncement(65, "es-ES", "remaining");
 * // Retorna: "Queda 1 minuto y 5 segundos"
 */
export function buildAnnouncement(
  totalSeconds: number,
  lang: LangCode,
  mode: AnnouncementMode,
  isSmart: boolean = false
): string {
  const phrases = PHRASES[lang]
  const isFinished = totalSeconds <= 0

  if (isFinished) {
    return phrases.finished
  }

  // Cuenta regresiva simple en modo inteligente para los últimos 10 segundos finales
  const isFinalSmartCountdown = isSmart && mode === "remaining" && totalSeconds <= 10
  if (isFinalSmartCountdown) {
    return totalSeconds.toString()
  }

  const components = extractTimeComponents(totalSeconds)
  const timeParts = buildLocalizedTimeParts(components, phrases)
  const joinedTimePhrase = joinTimePartsWithConjunction(timeParts, phrases.and)

  const leadingNumericValue = getLeadingNumericValue(components)
  const isPluralGrammar = new Intl.PluralRules(lang).select(leadingNumericValue) !== "one"

  const isRemainingMode = mode === "remaining"
  if (isRemainingMode) {
    return phrases.remaining(joinedTimePhrase, isPluralGrammar)
  }
  return phrases.elapsed(joinedTimePhrase, isPluralGrammar)
}
