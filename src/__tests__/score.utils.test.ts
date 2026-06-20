/**
 * Score and rating utility tests.
 */
import { describe, it, expect } from "vitest"

// ── Score color ───────────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 9) return "text-emerald-400"
  if (score >= 8) return "text-accent-bright"
  if (score >= 7) return "text-yellow-400"
  return "text-white/60"
}

describe("getScoreColor", () => {
  it("returns emerald for 9.0+", () => {
    expect(getScoreColor(9.0)).toBe("text-emerald-400")
    expect(getScoreColor(9.5)).toBe("text-emerald-400")
    expect(getScoreColor(10)).toBe("text-emerald-400")
  })

  it("returns amber for 8.0-8.9", () => {
    expect(getScoreColor(8.0)).toBe("text-accent-bright")
    expect(getScoreColor(8.9)).toBe("text-accent-bright")
  })

  it("returns yellow for 7.0-7.9", () => {
    expect(getScoreColor(7.0)).toBe("text-yellow-400")
    expect(getScoreColor(7.9)).toBe("text-yellow-400")
  })

  it("returns white for below 7", () => {
    expect(getScoreColor(6.9)).toBe("text-white/60")
    expect(getScoreColor(0)).toBe("text-white/60")
    expect(getScoreColor(5.5)).toBe("text-white/60")
  })
})

// ── Score grade ───────────────────────────────────────────────────────────────

function getScoreGrade(score: number): string {
  if (score >= 9) return "S"
  if (score >= 8) return "A"
  if (score >= 7) return "B"
  if (score >= 6) return "C"
  return "D"
}

describe("getScoreGrade", () => {
  it("S grade for 9+", () => {
    expect(getScoreGrade(9)).toBe("S")
    expect(getScoreGrade(10)).toBe("S")
  })

  it("A grade for 8-8.9", () => {
    expect(getScoreGrade(8)).toBe("A")
    expect(getScoreGrade(8.5)).toBe("A")
  })

  it("B grade for 7-7.9", () => {
    expect(getScoreGrade(7)).toBe("B")
    expect(getScoreGrade(7.5)).toBe("B")
  })

  it("C grade for 6-6.9", () => {
    expect(getScoreGrade(6)).toBe("C")
  })

  it("D grade for below 6", () => {
    expect(getScoreGrade(5.9)).toBe("D")
    expect(getScoreGrade(0)).toBe("D")
  })
})

// ── Score comparison ──────────────────────────────────────────────────────────

function compareScores(a: number, b: number): -1 | 0 | 1 {
  if (a > b) return -1  // higher score = first (descending)
  if (a < b) return 1   // lower score = last
  return 0
}

describe("compareScores (descending sort)", () => {
  it("returns -1 when a > b (a comes first)", () => {
    expect(compareScores(9.5, 8.0)).toBe(-1)
  })

  it("returns 1 when a < b (b comes first)", () => {
    expect(compareScores(7.0, 8.5)).toBe(1)
  })

  it("returns 0 when equal", () => {
    expect(compareScores(8.0, 8.0)).toBe(0)
  })

  it("sorts anime list correctly", () => {
    const scores = [7.5, 9.1, 8.3, 6.2, 9.5]
    const sorted = [...scores].sort(compareScores)
    expect(sorted[0]).toBe(9.5)
    expect(sorted[sorted.length - 1]).toBe(6.2)
  })
})

// ── Average score ─────────────────────────────────────────────────────────────

function average(scores: number[]): number {
  if (scores.length === 0) return 0
  return scores.reduce((sum, s) => sum + s, 0) / scores.length
}

describe("average score calculation", () => {
  it("returns 0 for empty array", () => {
    expect(average([])).toBe(0)
  })

  it("returns single value for one-element array", () => {
    expect(average([8.5])).toBe(8.5)
  })

  it("calculates average correctly", () => {
    expect(average([8, 9, 7, 10])).toBe(8.5)
    expect(average([1, 1, 1])).toBe(1)
  })

  it("handles decimal precision", () => {
    const result = average([8.1, 8.3, 8.2])
    expect(result).toBeCloseTo(8.2, 1)
  })
})
