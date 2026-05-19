/**
 * Utility functions tests
 */
import { describe, it, expect } from "vitest"

// ── Time formatting helper (from notifications page) ─────────────────────────
function timeAgo(iso: string): string {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 60000) return "just now"
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`
  return `${Math.floor(d / 86400000)}d ago`
}

describe("timeAgo", () => {
  it("returns 'just now' for < 1 min ago", () => {
    const now = new Date().toISOString()
    expect(timeAgo(now)).toBe("just now")
  })

  it("returns minutes for 1–59 min ago", () => {
    const past = new Date(Date.now() - 5 * 60_000).toISOString()
    expect(timeAgo(past)).toBe("5m ago")
  })

  it("returns hours for 1–23 hours ago", () => {
    const past = new Date(Date.now() - 3 * 3600_000).toISOString()
    expect(timeAgo(past)).toBe("3h ago")
  })

  it("returns days for 24+ hours ago", () => {
    const past = new Date(Date.now() - 2 * 86400_000).toISOString()
    expect(timeAgo(past)).toBe("2d ago")
  })
})

// ── Score color logic (from anime detail page) ────────────────────────────────
function scoreColor(rating: number): string {
  if (rating >= 9) return "text-emerald-400"
  if (rating >= 8) return "text-amber-400"
  return "text-white/60"
}

describe("scoreColor", () => {
  it("returns emerald for 9+", () => {
    expect(scoreColor(9.1)).toBe("text-emerald-400")
    expect(scoreColor(10)).toBe("text-emerald-400")
  })

  it("returns amber for 8–8.9", () => {
    expect(scoreColor(8.0)).toBe("text-amber-400")
    expect(scoreColor(8.9)).toBe("text-amber-400")
  })

  it("returns white/60 for below 8", () => {
    expect(scoreColor(7.9)).toBe("text-white/60")
    expect(scoreColor(0)).toBe("text-white/60")
  })
})

// ── Anime type guard ──────────────────────────────────────────────────────────
function mapAnimeType(raw: string | null): "TV" | "Movie" | "OVA" {
  const validTypes = ["TV", "Movie", "OVA"] as const
  return validTypes.includes(raw as typeof validTypes[number])
    ? (raw as "TV" | "Movie" | "OVA")
    : "TV"
}

describe("mapAnimeType", () => {
  it("returns TV for 'TV'", () => expect(mapAnimeType("TV")).toBe("TV"))
  it("returns Movie for 'Movie'", () => expect(mapAnimeType("Movie")).toBe("Movie"))
  it("returns OVA for 'OVA'", () => expect(mapAnimeType("OVA")).toBe("OVA"))
  it("defaults to TV for unknown type", () => expect(mapAnimeType("Special")).toBe("TV"))
  it("defaults to TV for null", () => expect(mapAnimeType(null)).toBe("TV"))
})

// ── Level calculation (from dashboard) ───────────────────────────────────────
// reputation is always >= 0 in the DB, so we only test non-negative values
function calcLevel(reputation: number): number {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, reputation) * 100 / 1000)))
}

describe("calcLevel", () => {
  it("returns 1 for 0 reputation", () => {
    expect(calcLevel(0)).toBe(1)
  })

  it("increases as reputation grows", () => {
    expect(calcLevel(1000)).toBeGreaterThan(calcLevel(100))
  })

  it("returns 1 for small reputation", () => {
    expect(calcLevel(10)).toBe(1)
  })

  it("returns a reasonable level for high rep", () => {
    const level = calcLevel(10000)
    expect(level).toBeGreaterThan(1)
    expect(level).toBeLessThan(100)
  })
})
