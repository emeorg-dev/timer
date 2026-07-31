"use client"

import type { ReactNode } from "react"
import { createContext, useCallback, useContext, useEffect, useState } from "react"

import {
  DEFAULT_LOCALE,
  dictionaries,
  getNestedTranslation,
  isSupportedLocale,
} from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/types"

// Map specific deep keys for strict typing
// This is a simplified type for t(). In a real app we'd use a deep keys type helper.
// For now, we accept strings and fallback gracefully.
export type TranslationKey = string

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)
const STORAGE_KEY = "emeorg-locale"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && isSupportedLocale(stored)) {
        setLocaleState(stored)
      } else {
        // Fallback to old key for migration
        const oldStored = localStorage.getItem("voice-timer-settings")
        if (oldStored) {
          const parsed = JSON.parse(oldStored)
          if (parsed.language && isSupportedLocale(parsed.language)) {
            setLocaleState(parsed.language)
            localStorage.setItem(STORAGE_KEY, parsed.language)
          }
        }
      }
    } catch {
      // ignore
    }
    setMounted(true)
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = useCallback(
    (key: TranslationKey) => {
      const dictionary = dictionaries[locale] || dictionaries[DEFAULT_LOCALE]
      return getNestedTranslation(dictionary, key)
    },
    [locale]
  )

  // Avoid hydration mismatch by rendering kids only after locale is ready, 
  // or render them with initial but ensure html lang is updated.
  // We prefer to render immediately to avoid blank screens.
  
  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
