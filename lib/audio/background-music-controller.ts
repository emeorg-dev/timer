import { duckingBus } from "./audio-ducking-bus"
import type { IFilePlayer, ISoundGenerator } from "./interfaces"

/**
 * Configuración de ritmo y velocidad de reproducción para una etapa del temporizador.
 */
interface PaceConfig {
  /** Nivel o etapa de urgencia (0=inactivo, 1=normal, 2=aviso, 3=alerta, 4=urgencia crítica). */
  stage: number
  /** Multiplicador de velocidad para el reproductor musical (ej. 1.0, 1.15, 1.3, 1.5). */
  playbackRate: number
}

/**
 * Evalúa en qué etapa de aceleración musical y tensión auditiva se encuentra el temporizador
 * basándose en el porcentaje de tiempo restante y los segundos críticos finales.
 *
 * @param remainingSec Segundos exactos que restan para finalizar la cuenta.
 * @param durationSec Duración total programada inicialmente para la sesión.
 * @returns Configuración rítmica (`PaceConfig`) adaptada a la urgencia temporal.
 */
function determinePaceStage(remainingSec: number, durationSec: number): PaceConfig {
  const hasValidDuration = durationSec > 0
  const remainingPercentage = hasValidDuration ? (remainingSec / durationSec) * 100 : 0

  const isCriticalFinalSeconds = remainingSec <= 15 && durationSec > 30
  const isCriticalPercentage = remainingPercentage <= 5
  const isUrgentStage = isCriticalPercentage || isCriticalFinalSeconds

  if (isUrgentStage) {
    return { stage: 4, playbackRate: 1.5 }
  }

  const isWarningStage = remainingPercentage <= 25
  if (isWarningStage) {
    return { stage: 3, playbackRate: 1.3 }
  }

  const isNoticeStage = remainingPercentage <= 50
  if (isNoticeStage) {
    return { stage: 2, playbackRate: 1.15 }
  }

  return { stage: 1, playbackRate: 1.0 }
}

/**
 * Controlador orquestador de música ambiental con aceleración rítmica progresiva (Tensión Auditiva).
 *
 * Conecta el reproductor de archivos (`IFilePlayer`), el generador de efectos (`ISoundGenerator`) y el
 * bus de atenuación (`AudioDuckingBus`). A medida que el temporizador avanza y atraviesa umbrales porcentuales o
 * temporales críticos, el controlador aumenta la velocidad del audio e intercala alarmas de urgencia,
 * al mismo tiempo que reduce su propio volumen automáticamente cuando otras capas (voz/efectos) reclaman el canal.
 */
export class BackgroundMusicController {
  private player: IFilePlayer
  private sfx: ISoundGenerator
  private currentStage = 0
  private baseVolume = 0.4
  private duckVolume = 0.1
  private currentTrack =
    "/music/Leighton_Brothers_-_Steamboat_Bill_(1910)/Leighton_Brothers_-_Steamboat_Bill_(1910).ogg"
  private isDucking = false
  private unsubscribeDucking: (() => void) | null = null

  constructor(player: IFilePlayer, sfx: ISoundGenerator) {
    this.player = player
    this.sfx = sfx

    this.player.setSource(this.currentTrack)
    this.player.setLoop(true)
    this.player.setVolume(this.baseVolume)

    this.unsubscribeDucking = duckingBus.subscribe(isDucking => {
      this.isDucking = isDucking
      this.player.setVolume(isDucking ? this.duckVolume : this.baseVolume)
    })
  }

  setTrack(trackUrl: string): void {
    if (this.currentTrack !== trackUrl) {
      this.currentTrack = trackUrl
      this.player.setSource(trackUrl)
    }
  }

  setVolume(volume: number): void {
    this.baseVolume = volume
    this.duckVolume = volume * 0.25
    this.player.setVolume(this.isDucking ? this.duckVolume : this.baseVolume)
  }

  start(): void {
    this.player.play()
  }

  stop(): void {
    this.player.stop()
    this.currentStage = 0
    this.player.setPlaybackRate(1.0)
  }

  pause(): void {
    this.player.pause()
  }

  updatePace(remainingSec: number, durationSec: number): void {
    const { stage, playbackRate } = determinePaceStage(remainingSec, durationSec)

    const isEscalatingToNewStage = stage > this.currentStage && this.currentStage !== 0
    if (isEscalatingToNewStage) {
      this.sfx.playTone("emergency")
    }

    this.currentStage = stage
    this.player.setPlaybackRate(playbackRate)
  }

  destroy(): void {
    if (this.unsubscribeDucking) {
      this.unsubscribeDucking()
    }
    this.stop()
  }
}
