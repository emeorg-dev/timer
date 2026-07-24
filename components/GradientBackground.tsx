"use client"

import { useMemo } from "react"
import { GrainGradient } from "@paper-design/shaders-react"

import { useSettings } from "@/components/settings-provider"
import { useTheme } from "@/hooks/use-theme"
import type { TimerStatus } from "@/hooks/use-timer"
import { interpolateColor } from "@/lib/color-utils"
export function GradientBackground({
  status,
  progress,
}: {
  status: TimerStatus
  progress: number // 0 to 1
}) {
  const { settings } = useSettings()
  const isDark = useTheme(settings.theme)

  const runningColors = useMemo(() => {
    const palettes = isDark
      ? {
          green: ["#000000", "#004400", "#008800", "#22cc22"],
          yellow: ["#000000", "#78350f", "#b45309", "#fef08a"],
          red: ["#000000", "#7f1d1d", "#b91c1c", "#fbbf24"],
        }
      : {
          green: ["#ffffff", "#bbf7d0", "#86efac", "#22c55e"],
          yellow: ["#ffffff", "#fef08a", "#fde047", "#eab308"],
          red: ["#ffffff", "#fecaca", "#fca5a5", "#ef4444"],
        }

    if (status === "finished") return palettes.red

    // Interpolar según el progreso si está corriendo
    if (progress < 0.5) {
      const factor = progress / 0.5
      return [
        interpolateColor(palettes.green[0], palettes.yellow[0], factor),
        interpolateColor(palettes.green[1], palettes.yellow[1], factor),
        interpolateColor(palettes.green[2], palettes.yellow[2], factor),
        interpolateColor(palettes.green[3], palettes.yellow[3], factor),
      ]
    } else {
      const factor = (progress - 0.5) / 0.5
      return [
        interpolateColor(palettes.yellow[0], palettes.red[0], factor),
        interpolateColor(palettes.yellow[1], palettes.red[1], factor),
        interpolateColor(palettes.yellow[2], palettes.red[2], factor),
        interpolateColor(palettes.yellow[3], palettes.red[3], factor),
      ]
    }
  }, [status, progress, isDark])

  const idleColors = isDark
    ? ["#000000", "#18181b", "#3f3f46", "#d4d4d8"]
    : ["#ffffff", "#e4e4e7", "#a1a1aa", "#3f3f46"]

  const isIdle = status === "idle" || status === "paused"
  const currentColors = isIdle ? idleColors : runningColors

  let currentSpeed = 0.2
  if (status === "running") {
    currentSpeed = 0.5 + progress * 2.0
  } else if (status === "finished") {
    currentSpeed = 3.0
  }

  const colorBack = isDark ? "#000000" : "#ffffff"

  return (
    <div className="absolute inset-0 -z-10 pointer-events-none transition-opacity duration-1000">
      <GrainGradient
        style={{ height: "100%", width: "100%" }}
        colorBack={colorBack}
        softness={0.76}
        intensity={0.75}
        noise={0.5}
        shape="corners"
        offsetX={0}
        offsetY={0}
        scale={1}
        rotation={0}
        speed={currentSpeed}
        colors={currentColors}
      />
    </div>
  )
}
