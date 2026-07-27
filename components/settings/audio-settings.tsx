"use client"

import { useState } from "react"
import { AudioLines, Check, ChevronsUpDown, Disc } from "lucide-react"

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { SettingCard } from "./setting-card"
import { useSettings } from "./settings-provider"

const MUSIC_TRACKS = [
  { value: "/bg-music.ogg", label: "Lo-Fi Chill (Default)" },
  { value: "/bg-music-2.ogg", label: "Piano Relax" },
  { value: "/bg-music-3.ogg", label: "Ambient" },
]

export function AudioSettings() {
  const { settings, update } = useSettings()
  const lang = settings.language
  const [isMusicDropdownOpen, setIsMusicDropdownOpen] = useState(false)

  return (
    <AccordionItem value="item-3" className="border-border/10">
      <AccordionTrigger className="hover:no-underline hover:bg-secondary/50 px-2 rounded-md transition-colors">
        <span className="font-semibold text-sm">
          {lang === "es-ES" ? "Audio y Música" : "Audio & Music"}
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-2 pt-4 pb-2 flex flex-col gap-3">
        {/* Sound */}
        <SettingCard className="flex-row items-center justify-between gap-3">
          <Label htmlFor="sound-switch" className="flex items-start gap-2.5 cursor-pointer flex-1">
            <AudioLines className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium leading-tight text-balance">
                {t(lang, "enableSound")}
              </span>
              <span className="text-xs text-muted-foreground font-normal leading-normal text-balance">
                {t(lang, "enableSoundDesc")}
              </span>
            </div>
          </Label>
          <Switch
            id="sound-switch"
            checked={settings.soundEnabled}
            onCheckedChange={v => update("soundEnabled", v)}
            className="shrink-0"
          />
        </SettingCard>

        {/* Background Music */}
        <SettingCard>
          <div className="flex items-center justify-between gap-3">
            <Label
              htmlFor="music-switch"
              className="flex items-start gap-2.5 cursor-pointer flex-1"
            >
              <Disc className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium leading-tight text-balance">
                  {t(lang, "enableMusic")}
                </span>
                <span className="text-xs text-muted-foreground font-normal leading-normal text-balance">
                  {t(lang, "enableMusicDesc")}
                </span>
              </div>
            </Label>
            <Switch
              id="music-switch"
              checked={settings.musicEnabled}
              onCheckedChange={v => update("musicEnabled", v)}
              className="shrink-0"
            />
          </div>

          {settings.musicEnabled && (
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">
                  {lang === "es-ES" ? "Pista de Música" : "Music Track"}
                </Label>
                <Popover open={isMusicDropdownOpen} onOpenChange={setIsMusicDropdownOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isMusicDropdownOpen}
                        className="w-full justify-between bg-background/50 font-normal"
                      />
                    }
                  >
                    {settings.musicTrack
                      ? MUSIC_TRACKS.find(track => track.value === settings.musicTrack)?.label ||
                        settings.musicTrack
                      : lang === "es-ES"
                        ? "Selecciona una pista..."
                        : "Select a track..."}
                    <ChevronsUpDown className="opacity-50 shrink-0" />
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput
                        placeholder={lang === "es-ES" ? "Buscar pista..." : "Search track..."}
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>
                          {lang === "es-ES" ? "Pista no encontrada." : "No track found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {MUSIC_TRACKS.map(track => (
                            <CommandItem
                              key={track.value}
                              value={track.value}
                              onSelect={() => {
                                update("musicTrack", track.value)
                                setIsMusicDropdownOpen(false)
                              }}
                            >
                              {track.label}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  settings.musicTrack === track.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">
                    {lang === "es-ES" ? "Volumen" : "Volume"}
                  </Label>
                  <span className="text-xs text-muted-foreground">{settings.musicVolume}%</span>
                </div>
                <Slider
                  value={[settings.musicVolume]}
                  onValueChange={v => {
                    const newValue = typeof v === "number" ? v : v[0]
                    update("musicVolume", newValue)
                  }}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          )}
        </SettingCard>
      </AccordionContent>
    </AccordionItem>
  )
}
