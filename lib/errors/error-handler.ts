import { NextResponse } from "next/server"

import { createLogger } from "@/lib/logger"

import { AppError } from "./base.error"
import { ErrorCodes } from "./error-codes"

const logger = createLogger("ErrorHandler")

/**
 * Estructura estándar y pública enviada al cliente cuando se produce una interrupción o error en la API.
 */
export interface ErrorResponse {
  /** Código de estado HTTP exacto reflejado en la cabecera de la respuesta. */
  status: number
  /** Identificador canónico de la categoría del error (`ErrorCodes`). */
  code: string
  /** Mensaje legible e informativo sobre la causa del error. */
  message: string
  /** Clave opcional para localización e internacionalización en el cliente web. */
  messageKey?: string
  /** Metadatos adicionales y variables de contexto sobre el fallo. */
  details?: Record<string, unknown>
  /** UUID v4 único generado para correlacionar el reporte con las trazas del servidor de telemetría. */
  errorId: string
  /** Marca de tiempo ISO-8601 del momento en el que se procesó la excepción. */
  timestamp: string
}

/**
 * Punto de control centralizado y escudo de interceptación para todas las excepciones emitidas por las APIs (Next.js).
 *
 * Actúa como el único componente autorizado para transformar excepciones internas del servidor en respuestas
 * HTTP seguras, uniformes y estructuradas en formato JSON (`ErrorResponse`). Garantiza que ningún error crudo ni traza
 * de pila sensible (Stack Trace) llegue a exponerse al cliente, delegando el registro de auditoría a la telemetría.
 *
 * @param error Excepción capturada en el bloque `catch` de la ruta API.
 * @returns Instancia de `NextResponse` serializada con el código HTTP y el payload JSON estandarizado.
 *
 * @example
 * export async function GET(request: Request) {
 *   try {
 *     // Lógica de dominio...
 *   } catch (error) {
 *     return handleApiError(error);
 *   }
 * }
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  if (error instanceof AppError) {
    // 1. Si es una excepción de nuestro dominio, respetamos su nivel y estatus
    logger[error.logLevel](error.message, {
      code: error.code,
      status: error.status,
      errorId: error.errorId,
      details: error.details,
      isOperational: error.isOperational,
      cause: error.cause,
    })

    return NextResponse.json(
      {
        status: error.status,
        code: error.code,
        message: error.message,
        messageKey: error.messageKey,
        details: error.details,
        errorId: error.errorId,
        timestamp: error.timestamp.toISOString(),
      },
      { status: error.status }
    )
  }

  // 2. Si es una excepción imprevista (ej. fallo de sintaxis, out-of-memory), la aislamos en un error 500
  const errorId = crypto.randomUUID()
  const timestamp = new Date().toISOString()

  logger.error("Excepción interna no manejada interceptada en el límite de la API", {
    errorId,
    error,
    isOperational: false,
  })

  return NextResponse.json(
    {
      status: 500,
      code: ErrorCodes.INTERNAL_ERROR,
      message: "Ha ocurrido un error interno inesperado en el servidor.",
      errorId,
      timestamp,
    },
    { status: 500 }
  )
}
