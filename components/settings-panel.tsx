"use client"

import { Accordion } from "@/components/ui/accordion"

import { AudioSettings } from "./settings/audio-settings"
import { GeneralSettings } from "./settings/general-settings"
import { VoiceSettings } from "./settings/voice-settings"

export function SettingsPanel() {
  return (
    <Accordion defaultValue={["item-1"]} className="w-full">
      <GeneralSettings />
      <VoiceSettings />
      <AudioSettings />
    </Accordion>
  )
}
