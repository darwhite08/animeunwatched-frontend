/**
 * User profile utility tests.
 */
import { describe, it, expect } from "vitest"
import type { User } from "@/lib/api/types"

// ── Avatar URL helpers ────────────────────────────────────────────────────────

function getAvatarFallback(user: Pick<User, "displayName" | "username">): string {
  const name = user.displayName || user.username
  return name[0]?.toUpperCase() ?? "?"
}

describe("getAvatarFallback", () => {
  it("returns first letter of displayName", () => {
    expect(getAvatarFallback({ displayName: "Naruto Uzumaki", username: "naruto" })).toBe("N")
  })

  it("returns first letter of username when displayName is empty", () => {
    expect(getAvatarFallback({ displayName: "", username: "naruto" })).toBe("N")
  })

  it("returns uppercase", () => {
    expect(getAvatarFallback({ displayName: "luffy", username: "luffy" })).toBe("L")
  })

  it("returns ? for empty name", () => {
    expect(getAvatarFallback({ displayName: "", username: "" })).toBe("?")
  })
})

// ── Profile bio truncation ────────────────────────────────────────────────────

function truncateBio(bio: string | null, maxLen = 150): string {
  if (!bio) return ""
  if (bio.length <= maxLen) return bio
  return bio.slice(0, maxLen - 3) + "..."
}

describe("truncateBio", () => {
  it("returns empty string for null bio", () => {
    expect(truncateBio(null)).toBe("")
  })

  it("returns bio unchanged if short enough", () => {
    const bio = "I love anime!"
    expect(truncateBio(bio)).toBe(bio)
  })

  it("truncates with ellipsis when over maxLen", () => {
    const bio = "a".repeat(200)
    const result = truncateBio(bio, 100)
    expect(result.length).toBe(100)
    expect(result.endsWith("...")).toBe(true)
  })

  it("handles custom maxLen", () => {
    const bio = "Short bio"
    expect(truncateBio(bio, 5)).toBe("Sh...")
  })
})

// ── Reputation badge ──────────────────────────────────────────────────────────

function getReputationBadge(rep: number): "bronze" | "silver" | "gold" | "platinum" | "diamond" {
  if (rep >= 5000) return "diamond"
  if (rep >= 1000) return "platinum"
  if (rep >= 500)  return "gold"
  if (rep >= 100)  return "silver"
  return "bronze"
}

describe("getReputationBadge", () => {
  it("returns bronze for low reputation", () => {
    expect(getReputationBadge(0)).toBe("bronze")
    expect(getReputationBadge(99)).toBe("bronze")
  })

  it("returns silver for 100-499 rep", () => {
    expect(getReputationBadge(100)).toBe("silver")
    expect(getReputationBadge(499)).toBe("silver")
  })

  it("returns gold for 500-999 rep", () => {
    expect(getReputationBadge(500)).toBe("gold")
    expect(getReputationBadge(999)).toBe("gold")
  })

  it("returns platinum for 1000-4999 rep", () => {
    expect(getReputationBadge(1000)).toBe("platinum")
    expect(getReputationBadge(4999)).toBe("platinum")
  })

  it("returns diamond for 5000+ rep", () => {
    expect(getReputationBadge(5000)).toBe("diamond")
    expect(getReputationBadge(99999)).toBe("diamond")
  })

  it("thresholds are exclusive to the next level", () => {
    expect(getReputationBadge(100)).not.toBe("bronze")
    expect(getReputationBadge(500)).not.toBe("silver")
    expect(getReputationBadge(1000)).not.toBe("gold")
    expect(getReputationBadge(5000)).not.toBe("platinum")
  })
})

// ── Profile stats display ─────────────────────────────────────────────────────

function formatStatValue(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(value)
}

describe("formatStatValue", () => {
  it("formats small numbers as-is", () => {
    expect(formatStatValue(42)).toBe("42")
    expect(formatStatValue(999)).toBe("999")
    expect(formatStatValue(0)).toBe("0")
  })

  it("formats thousands with k suffix", () => {
    expect(formatStatValue(1000)).toBe("1.0k")
    expect(formatStatValue(1500)).toBe("1.5k")
    expect(formatStatValue(10000)).toBe("10.0k")
  })
})
