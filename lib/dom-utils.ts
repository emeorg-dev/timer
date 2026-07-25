/**
 * Evalúa si el foco de interacción del usuario se encuentra dentro de un campo de formulario.
 *
 * Previene la colisión de los atajos de teclado globales (`useShortcuts`) cuando el usuario está tecleando
 * en un `input`, `textarea` o `select`, asegurando que teclas como la 's' o el espacio no activen el temporizador.
 *
 * @returns `true` si el elemento activo del DOM es un control de entrada de texto o selección.
 */
export function isFormElementFocused(): boolean {
  if (typeof document === "undefined") return false
  const activeEl = document.activeElement?.tagName
  return activeEl === "INPUT" || activeEl === "TEXTAREA" || activeEl === "SELECT"
}

/**
 * Evalúa si un evento de teclado se disparó mientras una tecla modificadora de sistema estaba presionada.
 *
 * Protege los comandos nativos del sistema operativo y navegador (como Ctrl+R, Alt+Tab o Cmd+C),
 * impidiendo que la aplicación intercepte o sobrescriba combinaciones de teclas nativas del usuario.
 *
 * @param e Evento de teclado interceptado por el listener global.
 * @returns `true` si la tecla Ctrl, Alt o Meta (Command/Windows) está activa durante el evento.
 */
export function hasSystemModifierKey(e: KeyboardEvent): boolean {
  return e.ctrlKey || e.altKey || e.metaKey
}
