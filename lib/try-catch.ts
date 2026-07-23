import { createLogger } from "./logger"

const logger = createLogger("TryCatch")

export type Result<T, E = Error> = [null, T] | [E, null]

/**
 * Función genérica para atrapar errores de funciones asíncronas de forma limpia.
 * (Estilo Go-lang). Registra automáticamente en el logger si algo falla.
 */
export async function tryCatch<T>(promise: Promise<T>, contextMsg?: string): Promise<Result<T>> {
  try {
    const data = await promise
    return [null, data]
  } catch (error) {
    if (contextMsg) {
      logger.error(`[TryCatch] ${contextMsg}`, { error })
    }
    return [error as Error, null]
  }
}

/**
 * Función genérica para ejecutar bloques síncronos de forma segura.
 */
export function tryCatchSync<T>(fn: () => T, contextMsg?: string): Result<T> {
  try {
    const data = fn()
    return [null, data]
  } catch (error) {
    if (contextMsg) {
      logger.error(`[TryCatch] ${contextMsg}`, { error })
    }
    return [error as Error, null]
  }
}

/**
 * Función "fire-and-forget" que ejecuta un bloque ignorando los fallos,
 * pero registrándolos en el sistema.
 */
export function executeSafe(fn: () => void, contextMsg?: string): void {
  try {
    fn()
  } catch (error) {
    if (contextMsg) {
      logger.error(`[ExecuteSafe] ${contextMsg}`, { error })
    }
  }
}
