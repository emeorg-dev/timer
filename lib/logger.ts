/**
 * Logger.ts
 * Implementación de un Logger siguiendo buenas prácticas (SRP).
 * Facilita habilitar/deshabilitar logs por entorno y estandarizar la salida.
 */

type LogLevel = "info" | "warn" | "error" | "debug"

interface LoggerOptions {
  module: string
}

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
 * Factory para instanciar loggers por módulo
 */
export function createLogger(moduleName: string) {
  return new Logger({ module: moduleName })
}
