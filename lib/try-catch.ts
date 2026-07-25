import { createLogger } from "./logger"

const logger = createLogger("TryCatch")

/**
 * Estructura de tupla al estilo Go-lang para manejo limpio de errores sin bloques try/catch anidados.
 */
export type Result<T, E = Error> = [null, T] | [E, null]

/**
 * Envuelve una Promesa asíncrona para capturar y canalizar errores sin interrumpir el flujo del programa.
 *
 * Aplica el patrón de retorno estilo Go-lang `[error, data]`, evitando la proliferación de bloques `try/catch`
 * anidados en la lógica de UI o servicios. Si la promesa es rechazada y se provee un mensaje contextual,
 * el fallo se registra de inmediato en el logger de telemetría del subsistema.
 *
 * @param promise Promesa o ejecución asíncrona que se desea evaluar de forma segura.
 * @param contextMsg Mensaje opcional para enriquecer y categorizar el log de error en caso de fallo.
 * @returns Tupla con `[null, data]` en caso de éxito, o `[Error, null]` si ocurre una excepción.
 *
 * @example
 * const [err, audio] = await tryCatch(fetchAudio(), "Error al solicitar TTS en nube");
 * if (err) return fallbackNativeSpeech();
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
 * Envuelve la ejecución de una función síncrona en un bloque seguro al estilo Go-lang `[error, data]`.
 *
 * @param fn Función síncrona evaluadora (callback o getter).
 * @param contextMsg Mensaje opcional para documentar el fallo en el logger si se lanza una excepción.
 * @returns Tupla con `[null, data]` o `[Error, null]`.
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
 * Ejecuta una operación de forma segura ("fire-and-forget"), absorbiendo y registrando cualquier excepción.
 *
 * Ideal para tareas secundarias y de limpieza (como revocar Wake Locks, cerrar conexiones de audio
 * o limpiar cachés DOM) cuyo fallo no debe impedir ni interrumpir el flujo del temporizador principal.
 *
 * @param fn Bloque o instrucción de código que se desea ejecutar de manera independiente.
 * @param contextMsg Categoría o descripción opcional para rastrear el fallo en consola.
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
