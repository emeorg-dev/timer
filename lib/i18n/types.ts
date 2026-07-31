export type Locale = "es" | "en" | "pt" | "fr" | "de" | "it"

export type TranslationDictionary = {
  common: {
    theme: {
      label: string
      light: string
      dark: string
      system: string
    }
    language: {
      label: string
      es: string
      en: string
      pt: string
      fr: string
      de: string
      it: string
    }
    actions: {
      cancel: string
      close: string
      confirm: string
    }
  }
  timer: {
    appName: string
    tagline: string
    controls: {
      start: string
      pause: string
      resume: string
      reset: string
    }
    settings: {
      title: string
      announceVoice: string
      announceVoiceDesc: string
      testVoice: string
      testPhrase: string
      announcementType: string
      remaining: string
      elapsed: string
      frequency: string
      every10s: string
      every30s: string
      everyMinute: string
      every5min: string
      onlyAtEnd: string
      setTime: string
      manual: string
      presets: string
      smart: string
      hours: string
      minutes: string
      seconds: string
      sound: string
      enableSound: string
      enableSoundDesc: string
      enableMusic: string
      enableMusicDesc: string
      remainingExample: string
      elapsedExample: string
      audioMusicTitle: string
      musicTrack: string
      selectTrack: string
      searchTrack: string
      noTrack: string
      volume: string
      voiceAnnouncementsTitle: string
    }
    status: {
      finished: string
    }
  }
}
