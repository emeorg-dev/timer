/**
 * Verifica si el usuario tiene el foco actualmente en un elemento de entrada de formulario
 * (inputs, textareas o selects), para evitar que los atajos de teclado globales interfieran con la escritura.
 */
export function isFormElementFocused(): boolean {
  if (typeof document === "undefined") return false
  const activeEl = document.activeElement?.tagName
  return activeEl === "INPUT" || activeEl === "TEXTAREA" || activeEl === "SELECT"
}

/**
 * Verifica si un evento de teclado fue disparado mientras se mantenía activa una tecla
 * modificadora de sistema (Ctrl, Alt o Meta/Cmd), para evitar colisiones con atajos nativos del navegador u SO.
 */
export function hasSystemModifierKey(e: KeyboardEvent): boolean {
  return e.ctrlKey || e.altKey || e.metaKey
}
