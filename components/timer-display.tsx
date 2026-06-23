"use client"

import { cn } from "@/lib/utils"
import { pad, secondsToTime } from "@/lib/time-utils"
import { useMemo } from "react"

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

export function TimerDisplay({
  remaining,
  duration,
  status,
  inputValue,
  onInputChange,
  onEnter,
}: {
  remaining: number
  duration: number
  status: "idle" | "running" | "paused" | "finished"
  inputValue?: string
  onInputChange?: (val: string) => void
  onEnter?: () => void
}) {
  const { hours, minutes, seconds } = secondsToTime(remaining)

  const progress = status === "idle" 
    ? 0 
    : (duration > 0 ? (duration - remaining) / duration : 0)

  // Use a fixed SVG coordinate system and scale the rendered box responsively
  // so the circle always fits the viewport without causing scroll.
  const size = 280
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  const dynamicColor = useMemo(() => {
    if (status === "idle" || status === "paused") return "var(--color-primary)"
    if (status === "finished") return "#ef4444"

    if (progress < 0.5) {
      const factor = progress / 0.5
      return interpolateColor("#10b981", "#eab308", factor)
    } else {
      const factor = (progress - 0.5) / 0.5
      return interpolateColor("#eab308", "#ef4444", factor)
    }
  }, [status, progress])

  return (
    <div
      className="relative aspect-square w-[min(78vw,46vh,360px)]"
      role="timer"
      aria-live="off"
      aria-label={`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`}
    >
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="opacity-10 dark:opacity-20"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={dynamicColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-[stroke-dashoffset] duration-300 ease-linear"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {status === "idle" && onInputChange !== undefined && (
          <input
            type="tel"
            className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-text"
            value={inputValue || ""}
            onChange={(e) => {
              // Limpiar todo lo que no sea número y tomar los últimos 6
              const val = e.target.value.replace(/\D/g, "").slice(-6)
              onInputChange(val)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onEnter) {
                e.currentTarget.blur()
                onEnter()
              }
            }}
            autoComplete="off"
            aria-label="Ingrese el tiempo en números"
          />
        )}
        <div
          className={cn(
            "font-mono tabular-nums tracking-tight",
            "text-[clamp(2rem,12vmin,4rem)]",
            status === "finished" && "text-destructive",
          )}
        >
          {hours > 0 && <span>{pad(hours)}:</span>}
          <span>{pad(minutes)}:</span>
          <span>{pad(seconds)}</span>
        </div>
      </div>
    </div>
  )
}
