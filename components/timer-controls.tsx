"use client"

import { Play, Pause, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/components/settings-provider"
import { t } from "@/lib/i18n"
import type { TimerStatus } from "@/hooks/use-timer"

export function TimerControls({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
}: {
  status: TimerStatus
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
}) {
  const { settings } = useSettings()
  const lang = settings.language

  return (
    <div className="flex items-center justify-center gap-3">
      {status === "idle" && (
        <Button size="lg" className="min-w-36 gap-2" onClick={onStart}>
          <Play className="size-5" aria-hidden="true" />
          {t(lang, "start")}
        </Button>
      )}

      {status === "running" && (
        <Button size="lg" variant="secondary" className="min-w-36 gap-2" onClick={onPause}>
          <Pause className="size-5" aria-hidden="true" />
          {t(lang, "pause")}
        </Button>
      )}

      {(status === "paused" || status === "finished") && (
        <>
          {status === "paused" && (
            <Button size="lg" className="min-w-36 gap-2" onClick={onResume}>
              <Play className="size-5" aria-hidden="true" />
              {t(lang, "resume")}
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            className="min-w-36 gap-2 bg-transparent"
            onClick={onReset}
          >
            <RotateCcw className="size-5" aria-hidden="true" />
            {t(lang, "reset")}
          </Button>
        </>
      )}
    </div>
  )
}
