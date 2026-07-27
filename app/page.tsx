import { SettingsProvider } from "@/components/settings"
import { VoiceTimer } from "@/components/timer"

export default function Page() {
  return (
    <SettingsProvider>
      <VoiceTimer />
    </SettingsProvider>
  )
}
