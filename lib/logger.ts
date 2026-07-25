/**
 * Logger.ts
 * Implementación de un Logger siguiendo buenas prácticas (SRP).
 * Facilita habilitar/deshabilitar logs por entorno y estandarizar la salida.
 */

type LogLevel = "info" | "warn" | "error" | "debug"

/**
 * Opciones de inicialización para registrar eventos de un módulo o dominio específico.
 */
interface LoggerOptions {
  /** Nombre del módulo arquitectónico (ej. 'TimerCore', 'SpeechOrchestrator'). */
  module: string
}

/**
 * Servicio de telemetría y depuración en consola con aislamiento y formateo por módulo.
 *
 * Sigue el Principio de Responsabilidad Única (SRP) encapsulando el formateo de marcas de tiempo e inspección
 * de objetos. Suaviza el ruido en producción desactivando logs de nivel `debug` e `info` automáticamente cuando
 * el entorno (`NODE_ENV`) no es 'development', preservando únicamente errores y advertencias críticas.
 */
class Logger {
  private module: string

  constructor(options: LoggerOptions) {
    this.module = options.module
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown) {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.module}]`

    // Solo logueamos data si existe para mantener la consola limpia
    return data !== undefined
      ? `${prefix}: ${message}\nData: ${JSON.stringify(data, null, 2)}`
      : `${prefix}: ${message}`
  }

  // Habilitado solo si estamos en entorno de desarrollo o si forzamos debug
  private isDevelopment = process.env.NODE_ENV === "development"

  debug(message: string, data?: unknown) {
    if (!this.isDevelopment) return
    console.debug(this.formatMessage("debug", message, data))
  }

  info(message: string, data?: unknown) {
    if (!this.isDevelopment) return
    console.info(this.formatMessage("info", message, data))
  }

  warn(message: string, data?: unknown) {
    console.warn(this.formatMessage("warn", message, data))
  }

  error(message: string, data?: unknown) {
    console.error(this.formatMessage("error", message, data))
  }
}

/**
 * Fábrica (Factory Pattern) para instanciar loggers inmutables asociados a un subsistema o componente.
 *
 * @param moduleName Identificador descriptivo del módulo que emitirá los reportes.
 * @returns Instancia de `Logger` configurada con el prefijo del módulo.
 *
 * @example
 * const logger = createLogger("AudioPlayer");
 * logger.info("Reproduciendo pista ambiental", { track: "lofi" });
 */
export function createLogger(moduleName: string) {
  return new Logger({ module: moduleName })
}
