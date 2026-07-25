/**
 * Identificadores canónicos y uniformes para la categorización de excepciones en el sistema.
 *
 * Centraliza los códigos de error que fluyen a través de la arquitectura, garantizando tipado estricto
 * y coherencia entre los reportes de telemetría, el registro en consola y las respuestas HTTP JSON.
 */
export enum ErrorCodes {
  /** Los parámetros de entrada en la solicitud son inválidos, están mal formateados o exceden los límites. */
  VALIDATION_ERROR = "VALIDATION_ERROR",
  /** El cliente u origen ha superado la cuota de peticiones permitidas en la ventana temporal activa. */
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  /** Todos los proveedores y motores de síntesis de voz en nube han fallado o rechazado la generación acústica. */
  AUDIO_SYNTHESIS_FAILED = "AUDIO_SYNTHESIS_FAILED",
  /** Error imprevisto de infraestructura, memoria o de ejecución no capturado explícitamente en el dominio. */
  INTERNAL_ERROR = "INTERNAL_ERROR",
  /** El recurso o archivo multimedia solicitado no existe en la ruta de almacenamiento o servidor. */
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  /** La petición carece de credenciales válidas o de permisos de acceso al recurso. */
  UNAUTHORIZED = "UNAUTHORIZED",
}
