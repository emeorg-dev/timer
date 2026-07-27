"use client"

import { Accordion } from "@/components/ui/accordion"

import { AudioSettings } from "./audio-settings"
import { GeneralSettings } from "./general-settings"
import { VoiceSettings } from "./voice-settings"

export function SettingsPanel() {
  return (
    <div className="w-full">
      <GeneralSettings />
      <Accordion defaultValue={["item-2"]} className="w-full">
        <VoiceSettings />
        <AudioSettings />
      </Accordion>
    </div>
  )
}
