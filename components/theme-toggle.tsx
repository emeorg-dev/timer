"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"

import { useSettings } from "@/hooks/use-settings"
import { t } from "@/lib/i18n"
import type { ThemePref } from "@/lib/settings/types"
import { cn } from "@/lib/utils"

const OPTIONS: {
  value: ThemePref
  icon: React.ReactNode
  key: "lightMode" | "darkMode" | "systemMode"
}[] = [
  { value: "light", icon: <Sun className="size-4" aria-hidden="true" />, key: "lightMode" },
  { value: "system", icon: <Monitor className="size-4" aria-hidden="true" />, key: "systemMode" },
  { value: "dark", icon: <Moon className="size-4" aria-hidden="true" />, key: "darkMode" },
]

export function ThemeToggle() {
  const { settings, update } = useSettings()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const lang = settings.language

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-border bg-card p-1"
      role="group"
      aria-label={t(lang, "systemMode")}
    >
      {OPTIONS.map(opt => {
        const isActive = mounted && theme === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              setTheme(opt.value)
              update("theme", opt.value)
            }}
            aria-pressed={isActive}
            aria-label={t(lang, opt.key)}
            title={t(lang, opt.key)}
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            )}
          >
            {opt.icon}
          </button>
        )
      })}
    </div>
  )
}
