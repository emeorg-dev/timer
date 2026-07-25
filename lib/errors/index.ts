/**
 * Módulo centralizado de manejo y estandarización de excepciones (Error Standardization).
 *
 * Expone la jerarquía inmutable de errores, los códigos canónicos de fallo y los interceptores REST
 * para garantizar una telemetría robusta y un contrato de respuestas HTTP JSON predecible.
 */

export * from "./api.error"
export * from "./base.error"
export * from "./error-codes"
export * from "./error-handler"
