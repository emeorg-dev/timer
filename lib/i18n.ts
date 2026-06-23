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

type UIKey =
  | "appName"
  | "tagline"
  | "start"
  | "pause"
  | "resume"
  | "reset"
  | "settings"
  | "announceVoice"
  | "testVoice"
  | "testPhrase"
  | "language"
  | "announcementType"
  | "remaining"
  | "elapsed"
  | "frequency"
  | "every10s"
  | "every30s"
  | "everyMinute"
  | "every5min"
  | "onlyAtEnd"
  | "setTime"
  | "manual"
  | "presets"
  | "hours"
  | "minutes"
  | "seconds"
  | "sound"
  | "enableSound"
  | "remainingExample"
  | "elapsedExample"
  | "lightMode"
  | "darkMode"
  | "systemMode"
  | "theme"
  | "finished"

type UIStrings = Record<UIKey, string>

export const UI: Record<LangCode, UIStrings> = {
  "es-ES": {
    appName: "Voice Timer",
    tagline: "Temporizador con anuncios de voz",
    start: "Iniciar",
    pause: "Pausar",
    resume: "Continuar",
    reset: "Reiniciar",
    settings: "Configuración",
    announceVoice: "Anunciar tiempo por voz",
    testVoice: "Probar voz",
    testPhrase: "La voz funciona correctamente",
    language: "Idioma",
    announcementType: "Tipo de anuncio",
    remaining: "Tiempo restante",
    elapsed: "Tiempo transcurrido",
    frequency: "Frecuencia de anuncio",
    every10s: "Cada 10 segundos",
    every30s: "Cada 30 segundos",
    everyMinute: "Cada minuto",
    every5min: "Cada 5 minutos",
    onlyAtEnd: "Solo al finalizar",
    setTime: "Configuración de tiempo",
    manual: "Manual",
    presets: "Presets",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos",
    sound: "Sonido",
    enableSound: "Activar sonido",
    remainingExample: "Quedan 10 minutos",
    elapsedExample: "Han pasado 10 minutos",
    lightMode: "Claro",
    darkMode: "Oscuro",
    systemMode: "Sistema",
    finished: "Tiempo finalizado",
    theme: "Tema",
  },
  "en-US": {
    appName: "Voice Timer",
    tagline: "Timer with voice announcements",
    start: "Start",
    pause: "Pause",
    resume: "Resume",
    reset: "Reset",
    settings: "Settings",
    announceVoice: "Announce time by voice",
    testVoice: "Test voice",
    testPhrase: "The voice is working correctly",
    language: "Language",
    announcementType: "Announcement type",
    remaining: "Time remaining",
    elapsed: "Time elapsed",
    frequency: "Announcement frequency",
    every10s: "Every 10 seconds",
    every30s: "Every 30 seconds",
    everyMinute: "Every minute",
    every5min: "Every 5 minutes",
    onlyAtEnd: "Only at the end",
    setTime: "Time setup",
    manual: "Manual",
    presets: "Presets",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    sound: "Sound",
    enableSound: "Enable sound",
    remainingExample: "10 minutes remaining",
    elapsedExample: "10 minutes have passed",
    lightMode: "Light",
    darkMode: "Dark",
    systemMode: "System",
    finished: "Time is up",
    theme: "Theme",
  },
  "pt-BR": {
    appName: "Voice Timer",
    tagline: "Temporizador com anúncios de voz",
    start: "Iniciar",
    pause: "Pausar",
    resume: "Continuar",
    reset: "Reiniciar",
    settings: "Configurações",
    announceVoice: "Anunciar tempo por voz",
    testVoice: "Testar voz",
    testPhrase: "A voz está funcionando corretamente",
    language: "Idioma",
    announcementType: "Tipo de anúncio",
    remaining: "Tempo restante",
    elapsed: "Tempo decorrido",
    frequency: "Frequência do anúncio",
    every10s: "A cada 10 segundos",
    every30s: "A cada 30 segundos",
    everyMinute: "A cada minuto",
    every5min: "A cada 5 minutos",
    onlyAtEnd: "Apenas no final",
    setTime: "Configuração de tempo",
    manual: "Manual",
    presets: "Predefinições",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos",
    sound: "Som",
    enableSound: "Ativar som",
    remainingExample: "Faltam 10 minutos",
    elapsedExample: "Passaram 10 minutos",
    lightMode: "Claro",
    darkMode: "Escuro",
    systemMode: "Sistema",
    finished: "Tempo esgotado",
    theme: "Tema",
  },
  "fr-FR": {
    appName: "Voice Timer",
    tagline: "Minuteur avec annonces vocales",
    start: "Démarrer",
    pause: "Pause",
    resume: "Reprendre",
    reset: "Réinitialiser",
    settings: "Paramètres",
    announceVoice: "Annoncer le temps par la voix",
    testVoice: "Tester la voix",
    testPhrase: "La voix fonctionne correctement",
    language: "Langue",
    announcementType: "Type d'annonce",
    remaining: "Temps restant",
    elapsed: "Temps écoulé",
    frequency: "Fréquence des annonces",
    every10s: "Toutes les 10 secondes",
    every30s: "Toutes les 30 secondes",
    everyMinute: "Chaque minute",
    every5min: "Toutes les 5 minutes",
    onlyAtEnd: "Seulement à la fin",
    setTime: "Réglage du temps",
    manual: "Manuel",
    presets: "Préréglages",
    hours: "Heures",
    minutes: "Minutes",
    seconds: "Secondes",
    sound: "Son",
    enableSound: "Activer le son",
    remainingExample: "Il reste 10 minutes",
    elapsedExample: "10 minutes se sont écoulées",
    lightMode: "Clair",
    darkMode: "Sombre",
    systemMode: "Système",
    finished: "Temps écoulé",
    theme: "Thème",
  },
  "de-DE": {
    appName: "Voice Timer",
    tagline: "Timer mit Sprachansagen",
    start: "Starten",
    pause: "Pause",
    resume: "Fortsetzen",
    reset: "Zurücksetzen",
    settings: "Einstellungen",
    announceVoice: "Zeit per Sprache ansagen",
    testVoice: "Stimme testen",
    testPhrase: "Die Sprachausgabe funktioniert korrekt",
    language: "Sprache",
    announcementType: "Art der Ansage",
    remaining: "Verbleibende Zeit",
    elapsed: "Verstrichene Zeit",
    frequency: "Ansagehäufigkeit",
    every10s: "Alle 10 Sekunden",
    every30s: "Alle 30 Sekunden",
    everyMinute: "Jede Minute",
    every5min: "Alle 5 Minuten",
    onlyAtEnd: "Nur am Ende",
    setTime: "Zeiteinstellung",
    manual: "Manuell",
    presets: "Vorlagen",
    hours: "Stunden",
    minutes: "Minuten",
    seconds: "Sekunden",
    sound: "Ton",
    enableSound: "Ton aktivieren",
    remainingExample: "Noch 10 Minuten",
    elapsedExample: "10 Minuten sind vergangen",
    lightMode: "Hell",
    darkMode: "Dunkel",
    systemMode: "System",
    finished: "Zeit abgelaufen",
    theme: "Thema",
  },
  "it-IT": {
    appName: "Voice Timer",
    tagline: "Timer con annunci vocali",
    start: "Avvia",
    pause: "Pausa",
    resume: "Riprendi",
    reset: "Reimposta",
    settings: "Impostazioni",
    announceVoice: "Annuncia il tempo con la voce",
    testVoice: "Prova voce",
    testPhrase: "La voce funziona correttamente",
    language: "Lingua",
    announcementType: "Tipo di annuncio",
    remaining: "Tempo rimanente",
    elapsed: "Tempo trascorso",
    frequency: "Frequenza degli annunci",
    every10s: "Ogni 10 secondi",
    every30s: "Ogni 30 secondi",
    everyMinute: "Ogni minuto",
    every5min: "Ogni 5 minuti",
    onlyAtEnd: "Solo alla fine",
    setTime: "Impostazione del tempo",
    manual: "Manuale",
    presets: "Preimpostazioni",
    hours: "Ore",
    minutes: "Minuti",
    seconds: "Secondi",
    sound: "Suono",
    enableSound: "Attiva suono",
    remainingExample: "Mancano 10 minuti",
    elapsedExample: "Sono passati 10 minuti",
    lightMode: "Chiaro",
    darkMode: "Scuro",
    systemMode: "Sistema",
    finished: "Tempo scaduto",
    theme: "Tema",
  },
}

export function t(lang: LangCode, key: UIKey): string {
  return UI[lang][key]
}
