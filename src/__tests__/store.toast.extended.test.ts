/**
 * Extended toast store tests — timing, multiple toasts, edge cases.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { useToast } from "@/stores/toast.store"

describe("useToast store — extended", () => {
  beforeEach(() => {
    useToast.setState({ toasts: [] })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("toast has unique id based on timestamp + random suffix", () => {
    useToast.getState().push("First")
    useToast.getState().push("Second")
    const [t1, t2] = useToast.getState().toasts
    expect(t1.id).not.toBe(t2.id)
    expect(t1.id.includes("-")).toBe(true) // id format: `${Date.now()}-${random}`
  })

  it("success type works", () => {
    useToast.getState().push("Success!", "success")
    expect(useToast.getState().toasts[0].type).toBe("success")
  })

  it("error type works", () => {
    useToast.getState().push("Error!", "error")
    expect(useToast.getState().toasts[0].type).toBe("error")
  })

  it("info is the default type", () => {
    useToast.getState().push("Info!")
    expect(useToast.getState().toasts[0].type).toBe("info")
  })

  it("toasts auto-dismiss after 3 seconds", () => {
    useToast.getState().push("Temp")
    expect(useToast.getState().toasts).toHaveLength(1)
    vi.advanceTimersByTime(3001)
    expect(useToast.getState().toasts).toHaveLength(0)
  })

  it("toasts remain before 3 seconds", () => {
    useToast.getState().push("Persistent?")
    vi.advanceTimersByTime(2999)
    expect(useToast.getState().toasts).toHaveLength(1)
  })

  it("dismiss removes a specific toast by id", () => {
    useToast.getState().push("A")
    useToast.getState().push("B")
    const [a, b] = useToast.getState().toasts

    useToast.getState().dismiss(a.id)
    expect(useToast.getState().toasts).toHaveLength(1)
    expect(useToast.getState().toasts[0].id).toBe(b.id)
  })

  it("dismiss on non-existent id does not throw", () => {
    expect(() => useToast.getState().dismiss("non-existent-id")).not.toThrow()
  })

  it("can add 10 toasts without issues", () => {
    for (let i = 0; i < 10; i++) {
      useToast.getState().push(`Toast ${i}`)
    }
    expect(useToast.getState().toasts).toHaveLength(10)
  })

  it("message is stored correctly", () => {
    const msg = "Test message with special chars: <>&\"'"
    useToast.getState().push(msg)
    expect(useToast.getState().toasts[0].message).toBe(msg)
  })
})
