import type { ErrorCodes } from "./error-codes"

/**
 * Parámetros de inicialización para construir una excepción semántica e inmutable.
 */
export interface AppErrorParams {
  /** Código de categorización canónica (`ErrorCodes`). */
  code: ErrorCodes
  /** Mensaje descriptivo legible en lenguaje natural sobre la razón y contexto del fallo. */
  message: string
  /** Código de estado HTTP sugerido para la respuesta del servidor (ej. 400, 429, 502). */
  status: number
  /** Nivel de severidad en el sistema de telemetría y logging (ej. 'warn' para cuotas, 'error' para caídas). */
  logLevel: "debug" | "info" | "warn" | "error"
  /** Clave de internacionalización opcional para la traducción en el cliente. */
  messageKey?: string
  /** Metadatos o datos de depuración adjuntos que no contienen información sensible. */
  details?: Record<string, unknown>
  /** Excepción original o causa subyacente que detonó el fallo actual. */
  cause?: unknown
}

/**
 * Clase base inmutable para la jerarquía arquitectónica de excepciones y fallos en el sistema.
 *
 * Todas las excepciones de dominio y servicios heredan obligatoriamente de esta clase abstracta,
 * garantizando que los errores no sean manejados como simples cadenas de texto dispersas, sino como
 * estructuras de datos predecibles, trazables y tipadas.
 *
 * Implementa las siguientes capacidades de resiliencia y telemetría:
 * 1. **Trazabilidad y Correlación**: Asigna una marca de tiempo exacta (`timestamp`) y un identificador
 *    único (`errorId` UUID v4), permitiendo al usuario reportar el ID exacto sin exponer trazas de código.
 * 2. **Clasificación Operativa**: Mediante la bandera `isOperational`, discrimina entre fallos esperados
 *    del negocio o validación (`true`) frente a caídas imprevistas de infraestructura o memoria (`false`).
 * 3. **Captura Pura de Pila**: Preserva el rasto original del stack en el momento de la instanciación.
 *
 * @example
 * class CustomError extends AppError {
 *   constructor(msg: string) {
 *     super({ code: ErrorCodes.VALIDATION_ERROR, message: msg, status: 400, logLevel: "warn" });
 *   }
 * }
 */
export abstract class AppError extends Error {
  /** Código canónico tipado identificando la categoría del error. */
  public readonly code: ErrorCodes
  /** Código HTTP asociado al error para serialización REST / API. */
  public readonly status: number
  /** Nivel de severidad asignado para la salida en consola o servicio log. */
  public readonly logLevel: "debug" | "info" | "warn" | "error"
  /** Clave opcional de internacionalización para la interfaz del usuario. */
  public readonly messageKey?: string
  /** Diccionario adicional con variables y valores de contexto del fallo. */
  public readonly details?: Record<string, unknown>
  /** Error o excepción que provocó en cascada este evento. */
  public override readonly cause?: unknown
  /** Fecha y hora exacta en la que se generó y capturó la excepción. */
  public readonly timestamp: Date = new Date()
  /** Identificador único universal (UUID) para rastreo de auditoría en los logs. */
  public readonly errorId: string = crypto.randomUUID()
  /** Indica si es un error controlado en la lógica de negocio (`true`) o un fallo crítico imprevisto (`false`). */
  public readonly isOperational: boolean = true

  constructor(params: AppErrorParams) {
    super(params.message)
    this.name = this.constructor.name
    this.code = params.code
    this.status = params.status
    this.logLevel = params.logLevel
    this.messageKey = params.messageKey
    this.details = params.details
    this.cause = params.cause

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
