import { Button } from "@/components/ui/button"

const PRESETS = [
  { label: "1m", sequence: "0100" },
  { label: "5m", sequence: "0500" },
  { label: "15m", sequence: "1500" },
  { label: "25m", sequence: "2500" },
] as const

interface QuickPresetsProps {
  onSelect: (sequence: string) => void
  onClear: () => void
}

export function QuickPresets({ onSelect, onClear }: QuickPresetsProps) {
  return (
    <div className="flex w-full max-w-md shrink-0 flex-wrap justify-center gap-2">
      {PRESETS.map(preset => (
        <Button
          key={preset.label}
          variant="outline"
          className="w-16 font-mono"
          onClick={() => onSelect(preset.sequence)}
        >
          {preset.label}
        </Button>
      ))}
      <Button variant="ghost" className="w-16 text-muted-foreground" onClick={onClear}>
        CLR
      </Button>
    </div>
  )
}
