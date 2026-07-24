import { type ReactNode } from "react"

import { cn } from "@/lib/utils"

export function SettingCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors",
        className
      )}
    >
      {children}
    </div>
  )
}
