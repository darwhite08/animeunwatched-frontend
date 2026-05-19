/**
 * Time utility tests.
 * Tests time-ago formatting and date manipulation helpers.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// ── Time ago implementation (matches notifications page) ──────────────────────

function timeAgo(iso: string): string {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 60000) return "just now"
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`
  return `${Math.floor(d / 86400000)}d ago`
}

describe("timeAgo utility", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("returns 'just now' for very recent timestamps", () => {
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"))
    const iso = new Date("2024-01-01T11:59:30Z").toISOString() // 30 seconds ago
    expect(timeAgo(iso)).toBe("just now")
  })

  it("returns minutes for timestamps 1-59 min ago", () => {
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"))
    const iso = new Date("2024-01-01T11:45:00Z").toISOString() // 15 min ago
    expect(timeAgo(iso)).toBe("15m ago")
  })

  it("returns 1m ago for exactly 1 minute", () => {
    vi.setSystemTime(new Date("2024-01-01T12:01:00Z"))
    const iso = new Date("2024-01-01T12:00:00Z").toISOString()
    expect(timeAgo(iso)).toBe("1m ago")
  })

  it("returns hours for timestamps 1-23 hours ago", () => {
    vi.setSystemTime(new Date("2024-01-01T15:00:00Z"))
    const iso = new Date("2024-01-01T12:00:00Z").toISOString() // 3 hours ago
    expect(timeAgo(iso)).toBe("3h ago")
  })

  it("returns days for timestamps 24+ hours ago", () => {
    vi.setSystemTime(new Date("2024-01-05T12:00:00Z"))
    const iso = new Date("2024-01-01T12:00:00Z").toISOString() // 4 days ago
    expect(timeAgo(iso)).toBe("4d ago")
  })

  it("returns 1d ago for exactly 24 hours", () => {
    vi.setSystemTime(new Date("2024-01-02T12:00:00Z"))
    const iso = new Date("2024-01-01T12:00:00Z").toISOString()
    expect(timeAgo(iso)).toBe("1d ago")
  })

  it("handles future timestamps as 'just now'", () => {
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"))
    const iso = new Date("2024-01-01T12:01:00Z").toISOString() // 1 min in future
    // Future date gives negative diff which is < 60000 (in absolute terms)
    // The function will return "just now" since d < 0 < 60000
    const result = timeAgo(iso)
    expect(result).toBe("just now")
  })
})

// ── Date formatting helpers ───────────────────────────────────────────────────

function formatPublishedDate(iso: string | null): string {
  if (!iso) return "Unpublished"
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

describe("formatPublishedDate", () => {
  it("formats a valid ISO date string", () => {
    const result = formatPublishedDate("2024-01-15T00:00:00Z")
    expect(result).toContain("January")
    expect(result).toContain("2024")
  })

  it("returns 'Unpublished' for null", () => {
    expect(formatPublishedDate(null)).toBe("Unpublished")
  })
})

// ── Read time calculation ─────────────────────────────────────────────────────

function calcReadTime(body: string): number {
  return Math.max(1, Math.ceil(body.split(" ").length / 200))
}

describe("calcReadTime", () => {
  it("returns 1 for short content", () => {
    expect(calcReadTime("Short article")).toBe(1)
  })

  it("returns 1 for empty content", () => {
    expect(calcReadTime("")).toBe(1)
  })

  it("returns 2 for 201 words", () => {
    const text = "word ".repeat(201).trim()
    expect(calcReadTime(text)).toBe(2)
  })

  it("returns 5 for 1000 words", () => {
    const text = "word ".repeat(1000).trim()
    expect(calcReadTime(text)).toBe(5)
  })
})
