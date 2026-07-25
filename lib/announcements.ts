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
  "es-ES": {
    hour: ["hora", "horas"],
    minute: ["minuto", "minutos"],
    second: ["segundo", "segundos"],
    remaining: (u, p) => `Queda${p ? "n" : ""} ${u}`,
    elapsed: (u, p) => `Ha${p ? "n" : ""} pasado ${u}`,
    finished: "Tiempo finalizado",
    and: "y",
  },
  "en-US": {
    hour: ["hour", "hours"],
    minute: ["minute", "minutes"],
    second: ["second", "seconds"],
    remaining: u => `${u} remaining`,
    elapsed: (u, p) => `${u} ${p ? "have" : "has"} passed`,
    finished: "Time is up",
    and: "and",
  },
  "pt-BR": {
    hour: ["hora", "horas"],
    minute: ["minuto", "minutos"],
    second: ["segundo", "segundos"],
    remaining: (u, p) => `Falta${p ? "m" : ""} ${u}`,
    elapsed: (u, p) => `Passou${p ? "ram" : ""} ${u}`,
    finished: "Tempo esgotado",
    and: "e",
  },
  "fr-FR": {
    hour: ["heure", "heures"],
    minute: ["minute", "minutes"],
    second: ["seconde", "secondes"],
    remaining: u => `Il reste ${u}`,
    elapsed: (u, p) => `${u} ${p ? "se sont écoulées" : "s'est écoulée"}`,
    finished: "Temps écoulé",
    and: "et",
  },
  "de-DE": {
    hour: ["Stunde", "Stunden"],
    minute: ["Minute", "Minuten"],
    second: ["Sekunde", "Sekunden"],
    remaining: u => `Noch ${u}`,
    elapsed: (u, p) => `${u} ${p ? "sind" : "ist"} vergangen`,
    finished: "Zeit abgelaufen",
    and: "und",
  },
  "it-IT": {
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

/** Descompone un total de segundos en sus horas, minutos y segundos exactos. */
function extractTimeComponents(totalSeconds: number): TimeComponents {
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

/** Formatea una cantidad con su unidad gramatical en singular o plural. */
function formatUnitPhrase(value: number, unit: [string, string]): string {
  const isSingular = value === 1
  return `${value} ${isSingular ? unit[0] : unit[1]}`
}

/** Convierte los componentes de tiempo en una lista de fragmentos verbales (ej: ['1 hora', '20 minutos']). */
function buildLocalizedTimeParts(components: TimeComponents, phrases: PhraseUnits): string[] {
  const { hours, minutes, seconds } = components
  const parts: string[] = []

  if (hours > 0) parts.push(formatUnitPhrase(hours, phrases.hour))
  if (minutes > 0) parts.push(formatUnitPhrase(minutes, phrases.minute))
  if (seconds > 0 && hours === 0) parts.push(formatUnitPhrase(seconds, phrases.second))

  if (parts.length === 0) parts.push(formatUnitPhrase(0, phrases.second))
  return parts
}

/** Une los fragmentos de tiempo aplicando comas y la conjunción final apropiada del idioma. */
function joinTimePartsWithConjunction(parts: string[], conjunction: string): string {
  if (parts.length === 1) return parts[0]
  const initialParts = parts.slice(0, -1).join(", ")
  const lastPart = parts[parts.length - 1]
  return `${initialParts} ${conjunction} ${lastPart}`
}

/** Determina el primer valor numérico significativo (horas, minutos o segundos) para evaluar la regla gramatical de singular o plural. */
function getLeadingNumericValue(components: TimeComponents): number {
  const hasHours = components.hours > 0
  if (hasHours) return components.hours

  const hasMinutes = components.minutes > 0
  if (hasMinutes) return components.minutes

  return components.seconds
}

/**
 * Construye una frase verbal narrada en lenguaje natural a partir de los segundos restantes o transcurridos.
 * Sigue el principio SRP dividiendo la extracción de tiempo, traducción gramatical y pluralización en pasos puros.
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
