import { useEffect } from "react"

export function useMicrowaveInput({
  isIdle,
  durationSec,
  setInputSequence,
  handleStart,
}: {
  isIdle: boolean
  durationSec: number
  setInputSequence: React.Dispatch<React.SetStateAction<string>>
  handleStart: () => void
}) {
  useEffect(() => {
    if (!isIdle) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Si el usuario está escribiendo en el ghost input o configuraciones, el input nativo se encarga
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return
      }

      if (e.key >= "0" && e.key <= "9") {
        setInputSequence(prev => {
          const next = prev === "0" ? e.key : prev + e.key
          return next.length > 6 ? next.slice(-6) : next
        })
      } else if (e.key === "Backspace") {
        setInputSequence(prev => prev.slice(0, -1))
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (durationSec > 0) handleStart()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isIdle, durationSec, handleStart, setInputSequence])
}
