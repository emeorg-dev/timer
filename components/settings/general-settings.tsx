"use client"

import { Languages } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type LangCode, LANGUAGES, t } from "@/lib/i18n"

import { SettingSection } from "./setting-section"
import { useSettings } from "./settings-provider"
import { SettingCard } from "./setting-card"
import { Label } from "../ui/label"

export function GeneralSettings() {
  const { settings, update } = useSettings()
  const lang = settings.language

  return (
    <div className="px-2 pb-4 pt-2">
      <SettingSection>
        <SettingCard>
          <Label
            htmlFor="language-select"
            className="flex items-start gap-2.5 cursor-pointer flex-1"
          >
            <Languages className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-sm font-medium leading-tight text-balance">
              {t(lang, "language")}
            </span>
          </Label>
          <Select value={settings.language} onValueChange={v => update("language", v as LangCode)}>
            <SelectTrigger
              aria-label={t(lang, "language")}
              className="w-full bg-background/50 backdrop-blur-sm"
            >
              <SelectValue>{LANGUAGES.find(l => l.code === settings.language)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(l => (
                <SelectItem key={l.code} value={l.code}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingCard>
      </SettingSection>
    </div>
  )
}
