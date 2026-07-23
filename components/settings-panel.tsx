"use client"

import type { ReactNode } from "react"
import { Bell, Languages, Speech, AudioLines, Disc, Play } from "lucide-react"

import { type AnnouncementMode, useSettings } from "@/components/settings-provider"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useSpeech } from "@/hooks/use-speech"
import { type LangCode, LANGUAGES, t } from "@/lib/i18n"

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

function SectionHeader({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      <span className="text-primary shrink-0">{icon}</span>
      {children}
    </div>
  )
}

function SettingSection({
  icon,
  title,
  children,
  className = "",
}: {
  icon?: ReactNode
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {icon && title && <SectionHeader icon={icon}>{title}</SectionHeader>}
      {children}
    </div>
  )
}

export function SettingsPanel() {
  const { settings, update } = useSettings()
  const { speak, unlock } = useSpeech()
  const lang = settings.language

  const handleTestVoice = () => {
    unlock()
    speak(t(lang, "testPhrase"), lang)
  }

  return (
    <Accordion defaultValue={["item-1"]} className="w-full">
      {/* General Settings */}
      <AccordionItem value="item-1" className="border-border/10">
        <AccordionTrigger className="hover:no-underline hover:bg-secondary/50 px-2 rounded-md transition-colors">
          <span className="font-semibold text-sm">General</span>
        </AccordionTrigger>
        <AccordionContent className="px-2 pt-4 pb-2">
          <SettingSection
            icon={<Languages className="size-4" aria-hidden="true" />}
            title={t(lang, "language")}
          >
            <Select
              value={settings.language}
              onValueChange={v => update("language", v as LangCode)}
            >
              <SelectTrigger
                aria-label={t(lang, "language")}
                className="w-full bg-background/50 backdrop-blur-sm"
              >
                <SelectValue>
                  {LANGUAGES.find(l => l.code === settings.language)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(l => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingSection>
        </AccordionContent>
      </AccordionItem>

      {/* Voice & Announcements */}
      <AccordionItem value="item-2" className="border-border/10">
        <AccordionTrigger className="hover:no-underline hover:bg-secondary/50 px-2 rounded-md transition-colors">
          <span className="font-semibold text-sm">
            {lang === "es-ES" ? "Voz y Anuncios" : "Voice & Announcements"}
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-2 pt-4 pb-2 flex flex-col gap-6">
          {/* Voice toggle */}
          <SettingSection>
            <div className="flex flex-col gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
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
            </div>
          </SettingSection>

          <Separator className="opacity-50" />

          {/* Announcement type */}
          <SettingSection
            icon={<Bell className="size-4" aria-hidden="true" />}
            title={t(lang, "announcementType")}
          >
            <RadioGroup
              value={settings.announcementMode}
              onValueChange={v => {
                update("announcementMode", v as AnnouncementMode)
                if (v === "elapsed" && settings.announcementInterval === -1) {
                  update("announcementInterval", 60)
                }
              }}
              className="gap-2"
            >
              <label className="flex cursor-pointer items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 text-muted-foreground has-[:checked]:text-primary has-[:checked]:bg-secondary/10 transition-all">
                <RadioGroupItem value="remaining" className="mt-0.5 shrink-0" />
                <span className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="font-medium text-foreground truncate">{t(lang, "remaining")}</span>
                  <span className="text-xs leading-tight text-balance">&ldquo;{t(lang, "remainingExample")}&rdquo;</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 text-muted-foreground has-[:checked]:text-primary has-[:checked]:bg-secondary/10 transition-all">
                <RadioGroupItem value="elapsed" className="mt-0.5 shrink-0" />
                <span className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="font-medium text-foreground truncate">{t(lang, "elapsed")}</span>
                  <span className="text-xs leading-tight text-balance">&ldquo;{t(lang, "elapsedExample")}&rdquo;</span>
                </span>
              </label>
            </RadioGroup>
          </SettingSection>

          {/* Frequency */}
          <SettingSection
            icon={<Bell className="size-4" aria-hidden="true" />}
            title={t(lang, "frequency")}
          >
            <RadioGroup
              value={String(settings.announcementInterval)}
              onValueChange={v => update("announcementInterval", Number.parseInt(v, 10))}
              className="grid grid-cols-1 gap-1.5"
            >
              {INTERVALS.filter(
                opt => opt.key !== "smart" || settings.announcementMode === "remaining"
              ).map(opt => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/30 text-sm text-muted-foreground has-[:checked]:text-primary has-[:checked]:bg-primary/5 transition-colors"
                >
                  <RadioGroupItem value={String(opt.value)} className="shrink-0" />
                  <span className="font-medium text-foreground truncate">{t(lang, opt.key)}</span>
                </label>
              ))}
            </RadioGroup>
          </SettingSection>
        </AccordionContent>
      </AccordionItem>

      {/* Audio & Music */}
      <AccordionItem value="item-3" className="border-border/10">
        <AccordionTrigger className="hover:no-underline hover:bg-secondary/50 px-2 rounded-md transition-colors">
          <span className="font-semibold text-sm">
            {lang === "es-ES" ? "Audio y Música" : "Audio & Music"}
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-2 pt-4 pb-2 flex flex-col gap-3">
          {/* Sound */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
            <Label
              htmlFor="sound-switch"
              className="flex items-center gap-2.5 text-sm font-medium cursor-pointer flex-1"
            >
              <AudioLines className="size-4 text-primary shrink-0" aria-hidden="true" />
              <span className="leading-tight text-balance">{t(lang, "enableSound")}</span>
            </Label>
            <Switch
              id="sound-switch"
              checked={settings.soundEnabled}
              onCheckedChange={v => update("soundEnabled", v)}
              className="shrink-0"
            />
          </div>

          {/* Background Music */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
            <Label
              htmlFor="music-switch"
              className="flex items-center gap-2.5 text-sm font-medium cursor-pointer flex-1"
            >
              <Disc className="size-4 text-primary shrink-0" aria-hidden="true" />
              <span className="leading-tight text-balance">{t(lang, "enableMusic")}</span>
            </Label>
            <Switch
              id="music-switch"
              checked={settings.musicEnabled}
              onCheckedChange={v => update("musicEnabled", v)}
              className="shrink-0"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
