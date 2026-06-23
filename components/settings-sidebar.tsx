"use client"

import { useState } from "react"
import { Settings2, PanelLeftOpen, PanelLeftClose, PanelRightOpen } from "lucide-react"
import { t } from "@/lib/i18n"
import { useSettings, SettingsPanel, ThemeToggle } from "@/components/"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useShortcuts } from "@/hooks/use-shortcuts"

export function SettingsSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { settings } = useSettings()
  const lang = settings.language

  useShortcuts({
    onToggleSidebar: () => setIsExpanded((prev) => !prev),
  })

  return (
    <>
      {/* Backdrop overlay para móvil cuando está abierto */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "absolute md:relative z-50 flex h-full flex-col transition-all duration-300 ease-in-out shrink-0",
          isExpanded 
            ? "w-[80vw] max-w-72 bg-card shadow-2xl md:shadow-none md:w-72 pointer-events-auto" 
            : "w-[60px] bg-transparent pointer-events-none md:pointer-events-auto"
        )}
      >
      <div className={cn("flex h-14 items-center transition-all duration-300 pointer-events-auto", isExpanded ? "justify-between px-4" : "justify-center px-0")}>
        <div
          className={cn(
            "flex items-center gap-2 overflow-hidden transition-all duration-300 whitespace-nowrap",
            isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
          )}
        >
          <Settings2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="font-semibold">{t(lang, "settings")}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="group shrink-0 size-9 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={t(lang, "settings")}
        >
          {isExpanded ? (
            <>
              <PanelLeftClose className="size-4 group-hover:hidden" aria-hidden="true" />
              <PanelLeftOpen className="size-4 hidden group-hover:block" aria-hidden="true" />
            </>
          ) : (
            <>
              <Settings2 className="size-4 group-hover:hidden" aria-hidden="true" />
              <PanelRightOpen className="size-4 hidden group-hover:block" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300",
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col gap-4 p-4 pt-2 w-72">
          <SettingsPanel />
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium text-muted-foreground">{t(lang, "theme")}</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
    </>
  )
}
