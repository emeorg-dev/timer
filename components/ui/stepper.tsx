import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface StepperProps {
  label: string
  value: number
  max: number
  onChange: (v: number) => void
}

export function Stepper({ label, value, max, onChange }: StepperProps) {
  const clamp = (v: number) => Math.max(0, Math.min(max, v))
  return (
    <div className="flex flex-col items-center gap-2">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="flex flex-col items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-full bg-transparent"
          onClick={() => onChange(clamp(value + 1))}
          aria-label={`+1 ${label}`}
        >
          <Plus className="size-4" aria-hidden="true" />
        </Button>
        <input
          type="number"
          inputMode="numeric"
          value={value}
          min={0}
          max={max}
          onChange={(e) => onChange(clamp(Number.parseInt(e.target.value || "0", 10)))}
          aria-label={label}
          className="w-16 rounded-lg border border-border bg-card py-2 text-center font-mono text-2xl tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-full bg-transparent"
          onClick={() => onChange(clamp(value - 1))}
          aria-label={`-1 ${label}`}
        >
          <Minus className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
