"use client"

import { useEffect } from "react"
import type { ThemePref } from "@/components/settings-provider"

/** Applies the theme preference to the documentElement, reacting to system changes. */
export function useTheme(theme: ThemePref) {
  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia("(prefers-color-scheme: dark)")

    const apply = () => {
      const isDark = theme === "dark" || (theme === "system" && media.matches)
      root.classList.toggle("dark", isDark)
      root.classList.toggle("light", !isDark)
    }

    apply()

    if (theme === "system") {
      media.addEventListener("change", apply)
      return () => media.removeEventListener("change", apply)
    }
  }, [theme])
}
