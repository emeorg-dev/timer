"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSettings } from "@/components/settings-provider"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { Stepper } from "@/components/ui/stepper"

const PRESETS = [5, 10, 15, 25, 30, 45, 60] // minutes


export function TimeSetup({
  hours,
  minutes,
  seconds,
  onChange,
  disabled,
}: {
  hours: number
  minutes: number
  seconds: number
  onChange: (h: number, m: number, s: number) => void
  disabled: boolean
}) {
  const { settings } = useSettings()
  const lang = settings.language

  return (
    <Tabs defaultValue="presets" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="presets">{t(lang, "presets")}</TabsTrigger>
        <TabsTrigger value="manual">{t(lang, "manual")}</TabsTrigger>
      </TabsList>

      <TabsContent value="presets" className="mt-4">
        <div
          className={cn(
            "grid grid-cols-4 gap-2",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          {PRESETS.map((m) => {
            const active = hours === 0 && minutes === m && seconds === 0
            return (
              <Button
                key={m}
                variant={active ? "default" : "outline"}
                className={cn("h-12 flex-col gap-0", !active && "bg-transparent")}
                onClick={() => onChange(0, m, 0)}
              >
                <span className="text-base font-semibold">{m}</span>
                <span className="text-[10px] uppercase tracking-wide opacity-70">min</span>
              </Button>
            )
          })}
        </div>
      </TabsContent>

      <TabsContent value="manual" className="mt-4">
        <div
          className={cn(
            "flex items-end justify-center gap-4",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <Stepper
            label={t(lang, "hours")}
            value={hours}
            max={23}
            onChange={(v) => onChange(v, minutes, seconds)}
          />
          <span className="pb-3 font-mono text-2xl text-muted-foreground">:</span>
          <Stepper
            label={t(lang, "minutes")}
            value={minutes}
            max={59}
            onChange={(v) => onChange(hours, v, seconds)}
          />
          <span className="pb-3 font-mono text-2xl text-muted-foreground">:</span>
          <Stepper
            label={t(lang, "seconds")}
            value={seconds}
            max={59}
            onChange={(v) => onChange(hours, minutes, v)}
          />
        </div>
      </TabsContent>
    </Tabs>
  )
}
