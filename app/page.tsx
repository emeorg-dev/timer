import { SettingsProvider } from "@/components/settings-provider"
import { VoiceTimer } from "@/components/voice-timer"

export default function Page() {
  return (
    <SettingsProvider>
      <VoiceTimer />
    </SettingsProvider>
  )
}
