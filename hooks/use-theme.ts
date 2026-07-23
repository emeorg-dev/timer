"use client"

import { useEffect, useState } from "react"

import type { ThemePref } from "@/components/settings-provider"

/** Applies the theme preference to the documentElement, reacting to system changes. */
export function useTheme(theme: ThemePref) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia("(prefers-color-scheme: dark)")

    const apply = () => {
      const isThemeDark = theme === "dark" || (theme === "system" && media.matches)
      root.classList.toggle("dark", isThemeDark)
      root.classList.toggle("light", !isThemeDark)
      setIsDark(isThemeDark)
    }

    apply()

    if (theme === "system") {
      media.addEventListener("change", apply)
      return () => media.removeEventListener("change", apply)
    }
  }, [theme])

  return isDark
}
