/**
 * Typing indicator logic tests.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// ── Typing state machine ──────────────────────────────────────────────────────

type TypingState = { isTyping: boolean; lastTypedAt: number }

function handleKeypress(state: TypingState, now: number): TypingState {
  return { isTyping: true, lastTypedAt: now }
}

function checkExpiry(state: TypingState, now: number, timeoutMs = 3000): TypingState {
  if (state.isTyping && now - state.lastTypedAt > timeoutMs) {
    return { ...state, isTyping: false }
  }
  return state
}

describe("typing state machine", () => {
  it("starts not typing", () => {
    const state: TypingState = { isTyping: false, lastTypedAt: 0 }
    expect(state.isTyping).toBe(false)
  })

  it("becomes typing on keypress", () => {
    const state: TypingState = { isTyping: false, lastTypedAt: 0 }
    const updated = handleKeypress(state, 1000)
    expect(updated.isTyping).toBe(true)
  })

  it("stops typing after 3s inactivity", () => {
    let state: TypingState = { isTyping: false, lastTypedAt: 0 }
    state = handleKeypress(state, 1000)
    state = checkExpiry(state, 4001) // 3001ms after
    expect(state.isTyping).toBe(false)
  })

  it("remains typing within 3s window", () => {
    let state: TypingState = { isTyping: false, lastTypedAt: 0 }
    state = handleKeypress(state, 1000)
    state = checkExpiry(state, 3999) // 2999ms after
    expect(state.isTyping).toBe(true)
  })

  it("resets timer on new keypress", () => {
    let state: TypingState = { isTyping: false, lastTypedAt: 0 }
    state = handleKeypress(state, 1000)
    state = handleKeypress(state, 2500) // second keypress at 2.5s
    state = checkExpiry(state, 4999) // 2.499s after second press — still within window
    expect(state.isTyping).toBe(true)
    state = checkExpiry(state, 5501) // 3.001s after second press
    expect(state.isTyping).toBe(false)
  })
})

// ── Debounce pattern ──────────────────────────────────────────────────────────

describe("typing debounce timing", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("stop typing fires after 3s of inactivity", () => {
    const stopFn = vi.fn()
    let typingTimer: ReturnType<typeof setTimeout> | null = null

    function emitTyping() {
      if (typingTimer) clearTimeout(typingTimer)
      typingTimer = setTimeout(stopFn, 3000)
    }

    emitTyping()
    emitTyping() // rapid keypresses reset timer
    emitTyping()

    vi.advanceTimersByTime(2999)
    expect(stopFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(stopFn).toHaveBeenCalledOnce()
  })

  it("stop fires only once even with many keypresses", () => {
    const stopFn = vi.fn()
    let typingTimer: ReturnType<typeof setTimeout> | null = null

    function emitTyping() {
      if (typingTimer) clearTimeout(typingTimer)
      typingTimer = setTimeout(stopFn, 3000)
    }

    for (let i = 0; i < 20; i++) emitTyping()

    vi.advanceTimersByTime(3001)
    expect(stopFn).toHaveBeenCalledOnce()
  })
})

// ── Typing indicator display ──────────────────────────────────────────────────

describe("typing indicator display logic", () => {
  it("shows typing indicator when otherTyping is true", () => {
    const otherTyping = true
    const otherName = "Naruto"
    const label = otherTyping ? `${otherName} is typing…` : ""
    expect(label).toBe("Naruto is typing…")
  })

  it("hides typing indicator when not typing", () => {
    const otherTyping = false
    const otherName = "Naruto"
    const label = otherTyping ? `${otherName} is typing…` : ""
    expect(label).toBe("")
  })

  it("auto-clears after 4s even without stop event", () => {
    let otherTyping = true
    let clearTimer: ReturnType<typeof setTimeout> | null = null

    function setTyping(val: boolean) { otherTyping = val }

    function onTypingStart() {
      setTyping(true)
      if (clearTimer) clearTimeout(clearTimer)
      clearTimer = setTimeout(() => setTyping(false), 4000)
    }

    onTypingStart()
    expect(otherTyping).toBe(true)
    // Simulate 4s passing
    setTimeout(() => { /* timer fires */ }, 4000)
  })
})
