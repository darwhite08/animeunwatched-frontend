/**
 * Toast store unit tests
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { useToast } from "@/stores/toast.store"

describe("useToast store", () => {
  beforeEach(() => {
    useToast.setState({ toasts: [] })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("starts with empty toasts", () => {
    expect(useToast.getState().toasts).toHaveLength(0)
  })

  it("push adds a toast with default type info", () => {
    useToast.getState().push("Hello!")
    const toasts = useToast.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe("Hello!")
    expect(toasts[0].type).toBe("info")
  })

  it("push accepts an explicit type", () => {
    useToast.getState().push("Error!", "error")
    expect(useToast.getState().toasts[0].type).toBe("error")
  })

  it("dismiss removes toast by id", () => {
    useToast.getState().push("First", "info")
    useToast.getState().push("Second", "error")
    const id = useToast.getState().toasts[0].id
    useToast.getState().dismiss(id)
    const remaining = useToast.getState().toasts
    expect(remaining).toHaveLength(1)
    expect(remaining[0].message).toBe("Second")
  })

  it("auto-dismisses after 3 seconds", () => {
    useToast.getState().push("Temp message")
    expect(useToast.getState().toasts).toHaveLength(1)
    vi.advanceTimersByTime(3001)
    expect(useToast.getState().toasts).toHaveLength(0)
  })

  it("each toast has a unique id", () => {
    useToast.getState().push("A")
    useToast.getState().push("B")
    const [t1, t2] = useToast.getState().toasts
    expect(t1.id).not.toBe(t2.id)
  })

  it("can stack multiple toasts", () => {
    useToast.getState().push("One", "success")
    useToast.getState().push("Two", "error")
    useToast.getState().push("Three", "info")
    expect(useToast.getState().toasts).toHaveLength(3)
  })
})
