"use client"

import { useState } from "react"
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, Settings2 } from "lucide-react"

import { SettingsPanel, ThemeToggle, useSettings } from "@/components/"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useShortcuts } from "@/hooks/use-shortcuts"
import { t } from "@/lib/i18n"

export function SettingsSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { settings } = useSettings()
  const lang = settings.language

  useShortcuts({
    onToggleSidebar: () => setIsExpanded(prev => !prev),
  })

  return (
    <>
      {/* Botón flotante siempre visible para abrir (cuando está cerrado) */}
      {!isExpanded && (
        <div className="absolute left-0 top-0 z-40 flex h-14 w-[60px] items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="group shrink-0 size-9 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={() => setIsExpanded(true)}
            aria-label={t(lang, "settings")}
          >
            <Settings2 className="size-4 group-hover:hidden" aria-hidden="true" />
            <PanelRightClose className="size-4 hidden group-hover:block" aria-hidden="true" />
          </Button>
        </div>
      )}

      <Sheet open={isExpanded} onOpenChange={setIsExpanded}>
        <SheetContent
          side="left"
          showClose={false}
          className="flex flex-col w-[80vw] max-w-[288px] border-r border-border/10 bg-background/60 p-0 backdrop-blur-2xl shadow-2xl"
        >
          <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-border/10">
            <div className="flex items-center gap-2">
              <Settings2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <SheetTitle className="font-semibold">{t(lang, "settings")}</SheetTitle>
              <SheetDescription className="sr-only">
                Configuración del temporizador
              </SheetDescription>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="group shrink-0 size-9 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              onClick={() => setIsExpanded(false)}
              aria-label={t(lang, "settings")}
            >
              <PanelLeftOpen className="size-4 group-hover:hidden" aria-hidden="true" />
              <PanelLeftClose className="size-4 hidden group-hover:block" aria-hidden="true" />
            </Button>
          </div>

          <ScrollArea className="flex-1 w-full px-4 py-4">
            <SettingsPanel />
          </ScrollArea>

          <div className="flex items-center justify-between p-4 border-t border-border/10 shrink-0 bg-secondary/10">
            <span className="text-sm font-medium text-muted-foreground">{t(lang, "theme")}</span>
            <ThemeToggle />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
