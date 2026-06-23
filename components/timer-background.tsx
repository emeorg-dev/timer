"use client"

import React, { useMemo } from "react"
// Se importan de forma diferida o se asumen presentes.
// El usuario debe instalar: @shadergradient/react @react-three/fiber three three-stdlib camera-controls
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react"
import { TimerStatus } from "@/hooks/use-timer"

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
  const colors = useMemo(() => {
    // Paletas [color1 (sombra/profundo), color2 (tono principal), color3 (brillo/highlight)]
    const palettes = {
      idle: ["#020617", "#334155", "#cbd5e1"],
      paused: ["#020617", "#334155", "#cbd5e1"],
      green: ["#020617", "#059669", "#a3e635"],
      yellow: ["#020617", "#b45309", "#fef08a"],
      red: ["#020617", "#b91c1c", "#fbbf24"],
    }

    if (status === "idle") return palettes.idle
    if (status === "finished") return palettes.red
    if (status === "paused") return palettes.paused

    // Si está corriendo, interpolamos cada uno de los 3 colores
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
  }, [status, progress])

  // ShaderGradient envPreset="city" le da buenos reflejos, 
  // uRotation acelera la rotacion
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30 md:opacity-40 blur-xl transition-opacity duration-1000 flex items-center justify-center">
      <ShaderGradientCanvas
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <ShaderGradient
          type="sphere"
          color1={colors[0]}
          color2={colors[1]}
          color3={colors[2]}
          cAzimuthAngle={180}
          cPolarAngle={90}
          cDistance={1}
          cameraZoom={5}
          positionX={0}
          positionY={0}
          positionZ={0}
          lightType="3d"
          brightness={1.5}
          envPreset="city"
          grain="on"
          // Propiedades para hacerla más "esfera" y menos mancha
          uDensity={1.5}
          uAmplitude={0.5}
          uSpeed={status === "running" ? 0.3 : 0.05}
        />
      </ShaderGradientCanvas>
    </div>
  )
}
