import type { LangCode } from "./i18n"

type AnnouncementMode = "remaining" | "elapsed"

interface PhraseUnits {
  hour: [string, string] // [singular, plural]
  minute: [string, string]
  second: [string, string]
  // builder receives the joined unit phrase and a boolean indicating if the leading unit is plural
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

function unitPhrase(value: number, unit: [string, string]): string {
  return `${value} ${value === 1 ? unit[0] : unit[1]}`
}

/** Builds a localized spoken phrase from a total number of seconds. */
export function buildAnnouncement(
  totalSeconds: number,
  lang: LangCode,
  mode: AnnouncementMode,
  isSmart: boolean = false
): string {
  const p = PHRASES[lang]

  if (totalSeconds <= 0) {
    return p.finished
  }

  // Cuenta regresiva simple en modo inteligente para los últimos 10 segundos
  if (isSmart && mode === "remaining" && totalSeconds <= 10) {
    return totalSeconds.toString()
  }

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts: string[] = []
  if (hours > 0) parts.push(unitPhrase(hours, p.hour))
  if (minutes > 0) parts.push(unitPhrase(minutes, p.minute))
  if (seconds > 0 && hours === 0) parts.push(unitPhrase(seconds, p.second))

  if (parts.length === 0) parts.push(unitPhrase(0, p.second))

  let units: string
  if (parts.length === 1) {
    units = parts[0]
  } else {
    units = `${parts.slice(0, -1).join(", ")} ${p.and} ${parts[parts.length - 1]}`
  }

  const firstValue = hours > 0 ? hours : minutes > 0 ? minutes : seconds
  const isPlural = new Intl.PluralRules(lang).select(firstValue) !== "one"

  return mode === "remaining" ? p.remaining(units, isPlural) : p.elapsed(units, isPlural)
}
