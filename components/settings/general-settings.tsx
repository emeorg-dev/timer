import { Languages } from "lucide-react"

import { useSettings } from "@/components/settings-provider"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type LangCode, LANGUAGES, t } from "@/lib/i18n"

import { SettingSection } from "./setting-section"

export function GeneralSettings() {
  const { settings, update } = useSettings()
  const lang = settings.language

  return (
    <AccordionItem value="item-1" className="border-border/10">
      <AccordionTrigger className="hover:no-underline hover:bg-secondary/50 px-2 rounded-md transition-colors">
        <span className="font-semibold text-sm">General</span>
      </AccordionTrigger>
      <AccordionContent className="px-2 pt-4 pb-2">
        <SettingSection
          icon={<Languages className="size-4" aria-hidden="true" />}
          title={t(lang, "language")}
        >
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
        </SettingSection>
      </AccordionContent>
    </AccordionItem>
  )
}
