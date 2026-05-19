/**
 * Format utility tests — number formatting, score display, etc.
 */
import { describe, it, expect } from "vitest"

// ── Number formatting ─────────────────────────────────────────────────────────

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

describe("formatCompact", () => {
  it("formats millions with M suffix", () => {
    expect(formatCompact(1_500_000)).toBe("1.5M")
    expect(formatCompact(10_000_000)).toBe("10.0M")
  })

  it("formats thousands with K suffix", () => {
    expect(formatCompact(1_500)).toBe("1.5K")
    expect(formatCompact(10_000)).toBe("10.0K")
  })

  it("returns plain number under 1000", () => {
    expect(formatCompact(999)).toBe("999")
    expect(formatCompact(0)).toBe("0")
    expect(formatCompact(42)).toBe("42")
  })

  it("handles boundary values", () => {
    expect(formatCompact(1_000)).toBe("1.0K")
    expect(formatCompact(1_000_000)).toBe("1.0M")
  })
})

// ── Score formatting ───────────────────────────────────────────────────────────

function formatScore(score: number | null): string {
  if (score === null || score === 0) return "N/A"
  return score.toFixed(1)
}

describe("formatScore", () => {
  it("formats valid scores with 1 decimal", () => {
    expect(formatScore(8.9)).toBe("8.9")
    expect(formatScore(10)).toBe("10.0")
    expect(formatScore(7)).toBe("7.0")
  })

  it("returns N/A for null score", () => {
    expect(formatScore(null)).toBe("N/A")
  })

  it("returns N/A for zero score", () => {
    expect(formatScore(0)).toBe("N/A")
  })

  it("handles decimal precision", () => {
    // Note: 8.95 rounds to 8.9 due to IEEE 754 floating point
    expect(formatScore(8.94)).toBe("8.9")
    expect(formatScore(9.05)).toBe("9.1") // 9.05 rounds to 9.1
  })
})

// ── Episode progress formatting ───────────────────────────────────────────────

function formatEpisodeProgress(seen: number, total: number | null): string {
  if (total === null) return `${seen}/?`
  return `${seen}/${total}`
}

describe("formatEpisodeProgress", () => {
  it("shows seen/total", () => {
    expect(formatEpisodeProgress(5, 24)).toBe("5/24")
    expect(formatEpisodeProgress(0, 12)).toBe("0/12")
  })

  it("shows seen/? when total is null (ongoing)", () => {
    expect(formatEpisodeProgress(5, null)).toBe("5/?")
  })

  it("handles completed anime", () => {
    expect(formatEpisodeProgress(24, 24)).toBe("24/24")
  })
})

// ── Reputation level calculation ─────────────────────────────────────────────

function calcReputationLevel(rep: number): { level: number; progress: number } {
  const thresholds = [0, 50, 150, 300, 500, 750, 1000, 1500, 2000, 3000, 5000]
  let level = 1
  for (let i = 1; i < thresholds.length; i++) {
    if (rep >= thresholds[i]) level = i + 1
    else {
      const progress = (rep - thresholds[i - 1]) / (thresholds[i] - thresholds[i - 1]) * 100
      return { level, progress: Math.min(100, Math.max(0, progress)) }
    }
  }
  return { level, progress: 100 }
}

describe("calcReputationLevel", () => {
  it("returns level 1 for 0 reputation", () => {
    expect(calcReputationLevel(0).level).toBe(1)
  })

  it("levels up at reputation thresholds", () => {
    expect(calcReputationLevel(50).level).toBe(2)
    expect(calcReputationLevel(150).level).toBe(3)
    expect(calcReputationLevel(300).level).toBe(4)
  })

  it("calculates progress within current level", () => {
    const { level, progress } = calcReputationLevel(100)
    expect(level).toBe(2) // between 50 and 150
    expect(progress).toBeGreaterThan(0)
    expect(progress).toBeLessThan(100)
  })

  it("handles high reputation", () => {
    const { level } = calcReputationLevel(10000)
    expect(level).toBe(11) // max threshold level
  })
})
