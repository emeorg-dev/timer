import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useShortcuts } from "./use-shortcuts"

describe("useShortcuts", () => {
  let onToggleSidebar: () => void
  let onPlayPause: () => void

  beforeEach(() => {
    onToggleSidebar = vi.fn()
    onPlayPause = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("activa onToggleSidebar con la tecla c sin modificadores", () => {
    renderHook(() => useShortcuts({ onToggleSidebar, onPlayPause }))

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "c" }))
    expect(onToggleSidebar).toHaveBeenCalledTimes(1)
  })

  it("activa onToggleSidebar con la tecla { sin modificadores", () => {
    renderHook(() => useShortcuts({ onToggleSidebar }))

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "{" }))
    expect(onToggleSidebar).toHaveBeenCalledTimes(1)
  })

  it("activa onToggleSidebar con Ctrl + { (teclado ES o Mac/PC)", () => {
    renderHook(() => useShortcuts({ onToggleSidebar }))

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "{", ctrlKey: true }))
    expect(onToggleSidebar).toHaveBeenCalledTimes(1)
  })

  it("activa onToggleSidebar con Cmd + { (Mac)", () => {
    renderHook(() => useShortcuts({ onToggleSidebar }))

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "{", metaKey: true }))
    expect(onToggleSidebar).toHaveBeenCalledTimes(1)
  })

  it("activa onToggleSidebar con Ctrl + [ o Cmd + [ (teclado US sin shift)", () => {
    renderHook(() => useShortcuts({ onToggleSidebar }))

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "[", ctrlKey: true }))
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "BracketLeft", metaKey: true }))
    expect(onToggleSidebar).toHaveBeenCalledTimes(2)
  })

  it("activa onToggleSidebar con Ctrl/Cmd + { incluso cuando un elemento de formulario tiene foco", () => {
    renderHook(() => useShortcuts({ onToggleSidebar, onPlayPause }))

    const input = document.createElement("input")
    document.body.appendChild(input)
    input.focus()

    // Un atajo normal (p) se ignora en un input
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "p" }))
    expect(onPlayPause).not.toHaveBeenCalled()

    // Pero Ctrl + { sí debe funcionar para cerrar/abrir el panel
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "{", ctrlKey: true }))
    expect(onToggleSidebar).toHaveBeenCalledTimes(1)

    document.body.removeChild(input)
  })
})
