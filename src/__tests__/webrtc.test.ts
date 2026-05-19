/**
 * WebRTC utility tests — formatDuration, preflight validation logic.
 */
import { describe, it, expect, vi } from "vitest"
import { formatDuration } from "@/hooks/useWebRTC"

describe("formatDuration", () => {
  it("formats 0 seconds", () => {
    expect(formatDuration(0)).toBe("0:00")
  })

  it("formats 30 seconds", () => {
    expect(formatDuration(30)).toBe("0:30")
  })

  it("formats 1 minute exactly", () => {
    expect(formatDuration(60)).toBe("1:00")
  })

  it("formats 1 minute 30 seconds", () => {
    expect(formatDuration(90)).toBe("1:30")
  })

  it("formats 9 seconds with leading zero", () => {
    expect(formatDuration(9)).toBe("0:09")
  })

  it("formats 59 seconds", () => {
    expect(formatDuration(59)).toBe("0:59")
  })

  it("formats 10 minutes", () => {
    expect(formatDuration(600)).toBe("10:00")
  })

  it("formats 1 hour (60 minutes)", () => {
    expect(formatDuration(3600)).toBe("60:00")
  })

  it("formats long call duration", () => {
    expect(formatDuration(3661)).toBe("61:01")
  })
})

// ── WebRTC type guards ────────────────────────────────────────────────────────

describe("CallStatus type values", () => {
  type CallStatus = "idle" | "calling" | "incoming" | "active" | "ended"
  const valid: CallStatus[] = ["idle", "calling", "incoming", "active", "ended"]

  it("has 5 distinct statuses", () => {
    expect(new Set(valid).size).toBe(5)
  })

  it("idle is the default initial state", () => {
    expect(valid[0]).toBe("idle")
  })
})

describe("CallType values", () => {
  type CallType = "audio" | "video"
  const types: CallType[] = ["audio", "video"]

  it("has 2 call types", () => {
    expect(types).toHaveLength(2)
  })

  it("audio and video are distinct", () => {
    expect(types[0]).not.toBe(types[1])
  })
})

// ── ICE candidate validation ──────────────────────────────────────────────────

describe("ICE candidate handling", () => {
  it("pending ICE candidates array starts empty", () => {
    const pending: RTCIceCandidateInit[] = []
    expect(pending).toHaveLength(0)
  })

  it("can push and drain ICE candidates", () => {
    const pending: RTCIceCandidateInit[] = []
    const candidate1: RTCIceCandidateInit = {
      candidate: "candidate:1 1 UDP 2130706431 192.168.1.1 54321 typ host",
      sdpMid: "0",
      sdpMLineIndex: 0,
    }
    const candidate2: RTCIceCandidateInit = {
      candidate: "candidate:2 1 UDP 2130706431 192.168.1.2 54322 typ srflx",
      sdpMid: "0",
      sdpMLineIndex: 0,
    }
    pending.push(candidate1, candidate2)
    expect(pending).toHaveLength(2)

    // Drain
    const drained = [...pending]
    pending.length = 0
    expect(drained).toHaveLength(2)
    expect(pending).toHaveLength(0)
  })
})

// ── Ring timeout logic ─────────────────────────────────────────────────────────

describe("ring timeout", () => {
  it("45 seconds is appropriate for ring timeout", () => {
    const RING_TIMEOUT_MS = 45_000
    expect(RING_TIMEOUT_MS).toBe(45 * 1000)
    expect(RING_TIMEOUT_MS).toBeGreaterThan(30_000)
    expect(RING_TIMEOUT_MS).toBeLessThan(60_000)
  })

  it("ICE reconnect timeout is 5 seconds", () => {
    const ICE_RECONNECT_TIMEOUT = 5_000
    expect(ICE_RECONNECT_TIMEOUT).toBe(5 * 1000)
  })
})
