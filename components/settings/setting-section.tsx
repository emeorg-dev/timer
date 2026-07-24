import type { ReactNode } from "react"

export function SectionHeader({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      <span className="text-primary shrink-0">{icon}</span>
      {children}
    </div>
  )
}

export function SettingSection({
  icon,
  title,
  children,
  className = "",
}: {
  icon?: ReactNode
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {icon && title && <SectionHeader icon={icon}>{title}</SectionHeader>}
      {children}
    </div>
  )
}
