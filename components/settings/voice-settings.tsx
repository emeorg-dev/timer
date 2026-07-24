import { Bell, Play, Speech } from "lucide-react"

import { type AnnouncementMode, useSettings } from "@/components/settings-provider"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useSpeech } from "@/hooks/use-speech"
import { t } from "@/lib/i18n"

import { SettingCard } from "./setting-card"
import { SettingSection } from "./setting-section"

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
                <span className="text-xs leading-tight text-balance">
                  &ldquo;{t(lang, "remainingExample")}&rdquo;
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 text-muted-foreground has-[:checked]:text-primary has-[:checked]:bg-secondary/10 transition-all">
              <RadioGroupItem value="elapsed" className="mt-0.5 shrink-0" />
              <span className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="font-medium text-foreground truncate">{t(lang, "elapsed")}</span>
                <span className="text-xs leading-tight text-balance">
                  &ldquo;{t(lang, "elapsedExample")}&rdquo;
                </span>
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
  )
}
