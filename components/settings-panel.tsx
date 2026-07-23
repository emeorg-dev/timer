"use client"

import { Volume2, Languages, Bell, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSettings, type AnnouncementMode } from "@/components/settings-provider"
import { useSpeech } from "@/hooks/use-speech"
import { LANGUAGES, t, type LangCode } from "@/lib/i18n"
import { ReactNode } from "react"

const INTERVALS: { value: number; key: "smart" | "every10s" | "every30s" | "everyMinute" | "every5min" | "onlyAtEnd" }[] = [
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
      <span className="text-primary">{icon}</span>
      {children}
    </div>
  )
}

function SettingSection({ 
  icon, 
  title, 
  children,
}: { 
  icon?: ReactNode
  title?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
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
    <div className="flex flex-col gap-5">
      {/* Voice toggle */}
      <SettingSection>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="voice-switch" className="flex items-center gap-2 text-sm font-medium">
            <Volume2 className="size-4 text-primary" aria-hidden="true" />
            {t(lang, "announceVoice")}
          </Label>
          <Switch
            id="voice-switch"
            checked={settings.voiceEnabled}
            onCheckedChange={(v) => update("voiceEnabled", v)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTestVoice}
          disabled={!settings.voiceEnabled}
          className="w-full"
        >
          <Volume2 className="size-4" aria-hidden="true" />
          {t(lang, "testVoice")}
        </Button>
      </SettingSection>

      {/* Language */}
      <SettingSection 
        icon={<Languages className="size-4" aria-hidden="true" />}
        title={t(lang, "language")}
      >
        <Select value={settings.language} onValueChange={(v) => update("language", v as LangCode)}>
          <SelectTrigger aria-label={t(lang, "language")}>
            <SelectValue>
              {LANGUAGES.find((l) => l.code === settings.language)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.code} value={l.code}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingSection>

      {/* Announcement type */}
      <SettingSection 
        icon={<Bell className="size-4" aria-hidden="true" />}
        title={t(lang, "announcementType")}
      >
        <RadioGroup
          value={settings.announcementMode}
          onValueChange={(v) => {
            update("announcementMode", v as AnnouncementMode)
            if (v === "elapsed" && settings.announcementInterval === -1) {
              update("announcementInterval", 60)
            }
          }}
          className="gap-2"
        >
          <label className="flex cursor-pointer items-start gap-3 px-1 py-1.5 text-sm hover:text-foreground text-muted-foreground has-[:checked]:text-primary transition-colors">
            <RadioGroupItem value="remaining" className="mt-0.5" />
            <span className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">{t(lang, "remaining")}</span>
              <span className="text-xs">&ldquo;{t(lang, "remainingExample")}&rdquo;</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 px-1 py-1.5 text-sm hover:text-foreground text-muted-foreground has-[:checked]:text-primary transition-colors">
            <RadioGroupItem value="elapsed" className="mt-0.5" />
            <span className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">{t(lang, "elapsed")}</span>
              <span className="text-xs">&ldquo;{t(lang, "elapsedExample")}&rdquo;</span>
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
          onValueChange={(v) => update("announcementInterval", Number.parseInt(v, 10))}
          className="grid grid-cols-1 gap-2"
        >
          {INTERVALS.filter((opt) => opt.key !== "smart" || settings.announcementMode === "remaining").map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-3 px-1 py-1.5 text-sm hover:text-foreground text-muted-foreground has-[:checked]:text-primary transition-colors"
            >
              <RadioGroupItem value={String(opt.value)} />
              <span className="font-medium text-foreground">{t(lang, opt.key)}</span>
            </label>
          ))}
        </RadioGroup>
      </SettingSection>

      {/* Sound */}
      <SettingSection>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="sound-switch" className="flex items-center gap-2 text-sm font-medium">
            <Music className="size-4 text-primary" aria-hidden="true" />
            {t(lang, "enableSound")}
          </Label>
          <Switch
            id="sound-switch"
            checked={settings.soundEnabled}
            onCheckedChange={(v) => update("soundEnabled", v)}
          />
        </div>
      </SettingSection>

      {/* Background Music */}
      <SettingSection>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="music-switch" className="flex items-center gap-2 text-sm font-medium">
            <Music className="size-4 text-primary" aria-hidden="true" />
            {t(lang, "enableMusic")}
          </Label>
          <Switch
            id="music-switch"
            checked={settings.musicEnabled}
            onCheckedChange={(v) => update("musicEnabled", v)}
          />
        </div>
      </SettingSection>
    </div>
  )
}
