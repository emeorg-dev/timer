"use client"

import { Bell, ChevronLeft, ChevronRight, Play, Speech } from "lucide-react"

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSpeech } from "@/hooks/use-speech"
import { t } from "@/lib/i18n"

import { SettingCard } from "./setting-card"
import { SettingSection } from "./setting-section"
import { type AnnouncementMode, useSettings } from "./settings-provider"

const INTERVALS: {
  value: number
  key: "smart" | "every10s" | "every30s" | "everyMinute" | "every5min" | "onlyAtEnd"
}[] = [
  { value: -1, key: "smart" },
  { value: 10, key: "every10s" },
  { value: 30, key: "every30s" },
  { value: 60, key: "everyMinute" },
  { value: 300, key: "every5min" },
  { value: 0, key: "onlyAtEnd" },
]

export function VoiceSettings() {
  const { settings, update } = useSettings()
  const { speak, unlock } = useSpeech()
  const lang = settings.language

  // Computed state for Stepper frequency
  const availableIntervals = INTERVALS.filter(
    opt => opt.key !== "smart" || settings.announcementMode === "remaining"
  )
  const currentIndex = availableIntervals.findIndex(i => i.value === settings.announcementInterval)
  const actualIndex = currentIndex === -1 ? 3 : currentIndex
  const currentIntervalOption = availableIntervals[actualIndex]

  const handleTestVoice = () => {
    unlock()
    speak(t(lang, "testPhrase"), lang)
  }

  return (
    <AccordionItem value="item-2" className="border-border/10">
      <AccordionTrigger className="hover:no-underline hover:bg-secondary/50 px-2 rounded-md transition-colors">
        <span className="font-semibold text-sm">
          {lang === "es-ES" ? "Voz y Anuncios" : "Voice & Announcements"}
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-2 pt-4 pb-2 flex flex-col gap-6">
        {/* Voice toggle */}
        <SettingSection>
          <SettingCard>
            <div className="flex items-center justify-between gap-3">
              <Label
                htmlFor="voice-switch"
                className="flex items-center gap-2.5 text-sm font-medium cursor-pointer flex-1"
              >
                <Speech className="size-4 text-primary shrink-0" aria-hidden="true" />
                <span className="leading-tight text-balance">{t(lang, "announceVoice")}</span>
              </Label>
              <Switch
                id="voice-switch"
                checked={settings.voiceEnabled}
                onCheckedChange={v => update("voiceEnabled", v)}
                className="shrink-0"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleTestVoice}
              disabled={!settings.voiceEnabled}
              className="w-full"
            >
              <Play className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{t(lang, "testVoice")}</span>
            </Button>
          </SettingCard>
        </SettingSection>

        <Separator className="opacity-50" />

        {/* Announcement type */}
        <SettingSection
          icon={<Bell className="size-4" aria-hidden="true" />}
          title={t(lang, "announcementType")}
        >
          <div className="flex flex-col gap-2">
            <Tabs
              value={settings.announcementMode}
              onValueChange={v => {
                update("announcementMode", v as AnnouncementMode)
                if (v === "elapsed" && settings.announcementInterval === -1) {
                  update("announcementInterval", 60)
                }
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                <TabsTrigger value="remaining" className="text-xs">
                  {t(lang, "remaining")}
                </TabsTrigger>
                <TabsTrigger value="elapsed" className="text-xs">
                  {t(lang, "elapsed")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground text-center italic">
              {settings.announcementMode === "remaining"
                ? `"${t(lang, "remainingExample")}"`
                : `"${t(lang, "elapsedExample")}"`}
            </p>
          </div>
        </SettingSection>

        {/* Frequency */}
        <SettingSection
          icon={<Bell className="size-4" aria-hidden="true" />}
          title={t(lang, "frequency")}
        >
          <SettingCard>
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 shrink-0 rounded-full"
                onClick={() => {
                  if (actualIndex > 0) {
                    update("announcementInterval", availableIntervals[actualIndex - 1].value)
                  }
                }}
                disabled={actualIndex <= 0}
              >
                <ChevronLeft className="size-4" />
              </Button>

              <div className="flex flex-col items-center justify-center flex-1 min-w-0 px-2 text-center">
                <span className="text-sm font-medium text-foreground truncate w-full leading-tight">
                  {t(lang, currentIntervalOption.key)}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 shrink-0 rounded-full"
                onClick={() => {
                  if (actualIndex < availableIntervals.length - 1) {
                    update("announcementInterval", availableIntervals[actualIndex + 1].value)
                  }
                }}
                disabled={actualIndex >= availableIntervals.length - 1}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </SettingCard>
        </SettingSection>
      </AccordionContent>
    </AccordionItem>
  )
}
