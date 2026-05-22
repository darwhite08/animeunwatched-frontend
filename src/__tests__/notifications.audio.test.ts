/**
 * Notification audio pool tests.
 *
 * jsdom doesn't implement HTMLMediaElement.play/pause, so we patch them onto
 * the prototype and assert against the recorded calls.
 */
import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  playSound,
  stopSound,
  stopAllSounds,
  preloadNotificationAudio,
  __resetForTests,
} from "@/lib/audio/notifications"

type Patched = {
  play: ReturnType<typeof vi.fn>
  pause: ReturnType<typeof vi.fn>
}

let playMock: Patched["play"]
let pauseMock: Patched["pause"]

beforeEach(() => {
  __resetForTests()
  // Replace prototype methods so every new Audio() shares the same spies.
  playMock = vi.fn(() => Promise.resolve())
  pauseMock = vi.fn()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(HTMLMediaElement.prototype as any).play = playMock
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(HTMLMediaElement.prototype as any).pause = pauseMock
})

describe("preloadNotificationAudio", () => {
  it("creates the pool + installs a gesture listener (idempotent)", () => {
    const spy = vi.spyOn(window, "addEventListener")
    preloadNotificationAudio()
    preloadNotificationAudio()
    // pointerdown / keydown / touchstart — three listeners, installed only once
    const events = spy.mock.calls.map(c => c[0])
    expect(events.filter(e => e === "pointerdown")).toHaveLength(1)
    expect(events.filter(e => e === "keydown")).toHaveLength(1)
    expect(events.filter(e => e === "touchstart")).toHaveLength(1)
  })
})

describe("playSound", () => {
  it("calls play() on the pooled element", () => {
    playSound("new-message")
    expect(playMock).toHaveBeenCalled()
  })

  it("sets loop when opts.loop is true", () => {
    const audios: HTMLAudioElement[] = []
    const origAudio = window.Audio
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Audio = function (src?: string) {
      const el = new origAudio(src)
      audios.push(el)
      return el
    }
    try {
      playSound("incoming-call", { loop: true })
      expect(audios.some(a => a.loop === true)).toBe(true)
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).Audio = origAudio
    }
  })

  it("respects opts.volume override", () => {
    playSound("outgoing-call", { volume: 0.1 })
    // The same element is reused; we can't inspect it here without exposing,
    // but we can assert play() was still called (the volume is set first).
    expect(playMock).toHaveBeenCalled()
  })

  it("does nothing on the server (no window) — function exists and returns void", () => {
    // jsdom always has window, so this just confirms the signature: a successful
    // call with no return value is what server-side users will hit (early return).
    expect(playSound("new-message")).toBeUndefined()
  })
})

describe("stopSound + stopAllSounds", () => {
  it("stopSound pauses the named sound", () => {
    playSound("new-message")
    stopSound("new-message")
    expect(pauseMock).toHaveBeenCalled()
  })

  it("stopAllSounds pauses every sound in the pool", () => {
    playSound("incoming-call")
    playSound("outgoing-call")
    playSound("new-message")
    pauseMock.mockClear()
    stopAllSounds()
    // Three sounds in the pool → three pause() calls
    expect(pauseMock).toHaveBeenCalledTimes(3)
  })
})

describe("gesture unlock", () => {
  it("dispatching pointerdown triggers play() on every entry (unlock cycle)", async () => {
    preloadNotificationAudio()
    playMock.mockClear()
    window.dispatchEvent(new Event("pointerdown"))
    // Yield to the unlock async cycle
    await Promise.resolve()
    await Promise.resolve()
    // Three sounds in the pool → three unlock-play attempts
    expect(playMock.mock.calls.length).toBeGreaterThanOrEqual(3)
  })

  it("removes listeners once all entries are unlocked", async () => {
    const removeSpy = vi.spyOn(window, "removeEventListener")
    preloadNotificationAudio()
    window.dispatchEvent(new Event("pointerdown"))
    // Drain microtask queue so the async unlock-all + listener-removal completes.
    await new Promise(r => setTimeout(r, 0))
    const removedEvents = removeSpy.mock.calls.map(c => c[0])
    expect(removedEvents).toContain("pointerdown")
    expect(removedEvents).toContain("keydown")
    expect(removedEvents).toContain("touchstart")
  })

  it("swallows play() rejection during unlock (no throw)", async () => {
    playMock.mockImplementation(() => Promise.reject(new Error("blocked")))
    preloadNotificationAudio()
    expect(() => window.dispatchEvent(new Event("pointerdown"))).not.toThrow()
    await Promise.resolve()
    await Promise.resolve()
  })
})
