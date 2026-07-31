"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"

import { useLanguage } from "@/components/language/language-provider"
import { cn } from "@/lib/utils"

type ThemeValue = "light" | "system" | "dark"

const OPTIONS: {
  value: ThemeValue
  icon: React.ReactNode
  key: "light" | "dark" | "system"
}[] = [
  { value: "light", icon: <Sun className="size-4" aria-hidden="true" />, key: "light" },
  { value: "system", icon: <Monitor className="size-4" aria-hidden="true" />, key: "system" },
  { value: "dark", icon: <Moon className="size-4" aria-hidden="true" />, key: "dark" },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-border bg-card p-1"
      role="group"
      aria-label={t("common.theme.label")}
    >
      {OPTIONS.map(opt => {
        const isActive = mounted && theme === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            aria-pressed={isActive}
            aria-label={t(`common.theme.${opt.key}`)}
            title={t(`common.theme.${opt.key}`)}
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
