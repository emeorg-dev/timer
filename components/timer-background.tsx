"use client"

import React, { useMemo } from "react"
// Se importan de forma deferida o se asumen presentes.
// El usuario debe instalar: @shadergradient/react @react-three/fiber three three-stdlib camera-controls
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react"
import { TimerStatus } from "@/hooks/use-timer"
import { cn } from "@/lib/utils"
import { useSettings } from "./settings-provider"
import { useTheme } from "@/hooks/use-theme"

function interpolateColor(color1: string, color2: string, factor: number) {
  const hex = (x: number) => {
    const s = Math.round(x).toString(16)
    return s.length === 1 ? "0" + s : s
  }

  const r1 = parseInt(color1.substring(1, 3), 16)
  const g1 = parseInt(color1.substring(3, 5), 16)
  const b1 = parseInt(color1.substring(5, 7), 16)

  const r2 = parseInt(color2.substring(1, 3), 16)
  const g2 = parseInt(color2.substring(3, 5), 16)
  const b2 = parseInt(color2.substring(5, 7), 16)

  const r = r1 + factor * (r2 - r1)
  const g = g1 + factor * (g2 - g1)
  const b = b1 + factor * (b2 - b1)

  return `#${hex(r)}${hex(g)}${hex(b)}`
}

export function TimerBackground({
  status,
  progress,
}: {
  status: TimerStatus
  progress: number // 0 to 1
}) {
  const { settings } = useSettings()
  const isDark = useTheme(settings.theme)

  const runningColors = useMemo(() => {
    const palettes = isDark ? {
      green: ["#000000", "#008800", "#22cc22"], // Verde puro de laboratorio (0% azul)
      yellow: ["#000000", "#b45309", "#fef08a"], // Ámbar -> Amarillo
      red: ["#000000", "#b91c1c", "#fbbf24"], // Rojo -> Ámbar (fuego)
    } : {
      green: ["#ffffff", "#86efac", "#22c55e"], // Verde más claro y brillante
      yellow: ["#ffffff", "#fde047", "#eab308"], // Amarillo suave
      red: ["#ffffff", "#fca5a5", "#ef4444"], // Rojo claro
    }

    if (status === "finished") return palettes.red

    // Interpolar según el progreso si está corriendo
    if (progress < 0.5) {
      const factor = progress / 0.5
      return [
        interpolateColor(palettes.green[0], palettes.yellow[0], factor),
        interpolateColor(palettes.green[1], palettes.yellow[1], factor),
        interpolateColor(palettes.green[2], palettes.yellow[2], factor),
      ]
    } else {
      const factor = (progress - 0.5) / 0.5
      return [
        interpolateColor(palettes.yellow[0], palettes.red[0], factor),
        interpolateColor(palettes.yellow[1], palettes.red[1], factor),
        interpolateColor(palettes.yellow[2], palettes.red[2], factor),
      ]
    }
  }, [status, progress, isDark])

  const idleColors = isDark
    ? ["#000000", "#3f3f46", "#d4d4d8"] // Gris neutro -> Plata neutro (Dark)
    : ["#ffffff", "#3f3f46", "#000000"] // Blanco -> Gris medio -> Negro (Light)

  const commonProps = {
    type: "sphere" as const,
    cAzimuthAngle: 180,
    cPolarAngle: 90,
    cDistance: 1,
    cameraZoom: 5,
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    lightType: "3d" as const,
    brightness: 1.5,
    envPreset: "lobby" as const,
    grain: "on" as const,
    uDensity: 1.5,
    uAmplitude: 0.5,
  }

  const isIdle = status === "idle" || status === "paused"
  const currentColors = isIdle ? idleColors : runningColors
  const currentSpeed = isIdle ? 0.05 : 0.3

  return (
    <div
      className={cn(
        "absolute inset-0 z-0 pointer-events-none overflow-hidden blur-xl transition-opacity duration-1000 flex items-center justify-center",
        "opacity-30 md:opacity-40"
      )}
    >
      <ShaderGradientCanvas
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <ShaderGradient
          {...commonProps}
          color1={currentColors[0]}
          color2={currentColors[1]}
          color3={currentColors[2]}
          uSpeed={currentSpeed}
        />
      </ShaderGradientCanvas>
    </div>
  )
}
