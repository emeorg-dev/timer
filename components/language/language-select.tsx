"use client"

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LANGUAGES, type LangCode } from "@/lib/i18n"

import { useLanguage } from "./language-provider"

export function LanguageSelect() {
  const { locale, setLocale, t } = useLanguage()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Select
      value={mounted ? locale : undefined}
      defaultValue={locale}
      onValueChange={(value) => setLocale(value as LangCode)}
    >
      <SelectTrigger
        aria-label={t("common.language.label")}
        className="bg-background/50"
      >
        <SelectValue>
          {mounted
            ? LANGUAGES.find(l => l.code === locale)?.label
            : LANGUAGES.find(l => l.code === locale)?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map(lang => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
