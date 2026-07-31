"use client"

import { useEffect, useMemo, useState } from "react"
import { GrainGradient } from "@paper-design/shaders-react"

import { useTheme } from "next-themes"

import { useSettings } from "@/hooks/use-settings"
import type { TimerStatus } from "@/hooks/use-timer"
import { interpolateColor } from "@/lib/color-utils"

/**
 * Calcula el límite máximo de píxeles para el shader WebGL.
 * Limita la resolución (máx 1080p / 1.5x DPR) para mantener nitidez visual en escritorio sin sobrecargar la CPU/GPU.
 */
function getOptimalMaxPixelCount(maxDpr = 1.5, fallback = 1920 * 1080): number {
  if (typeof window === "undefined") return fallback
  const calculated =
    window.innerWidth * window.innerHeight * Math.min(window.devicePixelRatio, maxDpr) ** 2
  return Math.min(Math.round(calculated), 2073600)
}

function getShaderSpeed(
  status: TimerStatus,
  isVisible: boolean,
  isIdle: boolean,
  progress: number
): number {
  const isHiddenOrIdle = !isVisible || isIdle
  const isRunning = status === "running"
  const isFinished = status === "finished"

  if (isHiddenOrIdle) return 0
  if (isRunning) return 0.5 + progress * 2.0
  if (isFinished) return 3.0
  return 0
}

function interpolatePalette(paletteA: string[], paletteB: string[], factor: number): string[] {
  return paletteA.map((color, i) => interpolateColor(color, paletteB[i], factor))
}

function getRunningColors(status: TimerStatus, progress: number, isDark: boolean): string[] {
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

  if (progress < 0.5) {
    const factor = progress / 0.5
    return interpolatePalette(palettes.green, palettes.yellow, factor)
  }

  const factor = (progress - 0.5) / 0.5
  return interpolatePalette(palettes.yellow, palettes.red, factor)
}

export function GradientBackground({
  status,
  progress,
}: {
  status: TimerStatus
  progress: number // 0 to 1
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible")
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const visualProgress = Math.round(progress * 100) / 100

  const runningColors = useMemo(
    () => getRunningColors(status, visualProgress, isDark),
    [status, visualProgress, isDark]
  )

  const idleColors = isDark
    ? ["#000000", "#18181b", "#3f3f46", "#d4d4d8"]
    : ["#ffffff", "#e4e4e7", "#a1a1aa", "#3f3f46"]

  const isIdle = status === "idle" || status === "paused"
  const currentColors = isIdle ? idleColors : runningColors

  const currentSpeed = getShaderSpeed(status, isVisible, isIdle, visualProgress)

  const colorBack = isDark ? "#000000" : "#ffffff"
  const maxPixelCount = getOptimalMaxPixelCount()

  if (!isVisible) {
    return (
      <div className="absolute inset-0 -z-10 bg-background pointer-events-none transition-opacity duration-1000" />
    )
  }

  return (
    <div className="absolute inset-0 -z-10 pointer-events-none transition-opacity duration-1000">
      <GrainGradient
        key={isDark ? "dark" : "light"}
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
        maxPixelCount={maxPixelCount}
        minPixelRatio={1}
      />
    </div>
  )
}
