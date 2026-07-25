import { AppError } from "./base.error"
import { ErrorCodes } from "./error-codes"

/**
 * Excepción lanzada cuando los parámetros de una petición o entrada son incorrectos, incompletos o mal formateados.
 *
 * Se traduce automáticamente en una respuesta HTTP 400 (Bad Request).
 * Su severidad en logs se cataloga como una advertencia (`warn`) al tratarse de un error del cliente.
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      code: ErrorCodes.VALIDATION_ERROR,
      message,
      status: 400,
      logLevel: "warn",
      details,
    })
  }
}

/**
 * Excepción lanzada cuando un cliente o dirección IP supera el cupo máximo de peticiones permitidas.
 *
 * Se traduce en una respuesta HTTP 429 (Too Many Requests), protegiendo al servidor frente a ataques DDoS
 * o consumos desmedidos de APIs de terceros (como las cuotas de Google Cloud TTS).
 */
export class RateLimitError extends AppError {
  constructor(ip: string, windowSeconds: number = 60) {
    super({
      code: ErrorCodes.RATE_LIMIT_EXCEEDED,
      message: `El cliente con IP [${ip}] ha excedido el límite de peticiones para una ventana de ${windowSeconds} segundos.`,
      status: 429,
      logLevel: "warn",
      details: { ip, windowSeconds },
    })
  }
}

/**
 * Excepción lanzada cuando la generación o descarga del archivo de audio falla en todas las capas de la nube.
 *
 * Se traduce en una respuesta HTTP 502 (Bad Gateway), indicando que los proveedores externos (Google Cloud
 * y Google Translate) no han respondido satisfactoriamente a la solicitud de síntesis vocal.
 */
export class AudioSynthesisError extends AppError {
  constructor(message: string, cause?: unknown) {
    super({
      code: ErrorCodes.AUDIO_SYNTHESIS_FAILED,
      message,
      status: 502,
      logLevel: "error",
      cause,
    })
  }
}

/**
 * Excepción lanzada ante errores imprevistos, fallos de sistema, memoria o excepciones no capturadas.
 *
 * Se traduce en una respuesta HTTP 500 (Internal Server Error) y se marca explícitamente como un fallo
 * no operativo (`isOperational = false`), detonando registros de alta severidad en el sistema de telemetría.
 */
export class InternalError extends AppError {
  public override readonly isOperational = false

  constructor(
    message: string = "Ha ocurrido un error interno inesperado en el servidor.",
    cause?: unknown
  ) {
    super({
      code: ErrorCodes.INTERNAL_ERROR,
      message,
      status: 500,
      logLevel: "error",
      cause,
    })
  }
}
