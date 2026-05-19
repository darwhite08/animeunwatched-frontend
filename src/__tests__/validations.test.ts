/**
 * Form validation tests — email, password, username validation logic.
 */
import { describe, it, expect } from "vitest"

// ── Email validation ──────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

describe("isValidEmail", () => {
  it("accepts valid emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true)
    expect(isValidEmail("user+tag@sub.domain.com")).toBe(true)
    expect(isValidEmail("123@abc.io")).toBe(true)
  })

  it("rejects emails without @", () => {
    expect(isValidEmail("notanemail")).toBe(false)
    expect(isValidEmail("user.example.com")).toBe(false)
  })

  it("rejects emails without domain", () => {
    expect(isValidEmail("user@")).toBe(false)
  })

  it("rejects emails with spaces", () => {
    expect(isValidEmail("user @example.com")).toBe(false)
    expect(isValidEmail("user@ example.com")).toBe(false)
  })

  it("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false)
  })
})

// ── Password strength ─────────────────────────────────────────────────────────

function isStrongPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) return { valid: false, message: "At least 8 characters" }
  if (password.length > 128) return { valid: false, message: "Max 128 characters" }
  return { valid: true }
}

describe("isStrongPassword", () => {
  it("accepts 8+ character password", () => {
    expect(isStrongPassword("Password1!").valid).toBe(true)
  })

  it("rejects password under 8 chars", () => {
    const result = isStrongPassword("short")
    expect(result.valid).toBe(false)
    expect(result.message).toContain("8")
  })

  it("rejects password over 128 chars", () => {
    const result = isStrongPassword("a".repeat(129))
    expect(result.valid).toBe(false)
    expect(result.message).toContain("128")
  })

  it("accepts exactly 8 and 128 char passwords", () => {
    expect(isStrongPassword("a".repeat(8)).valid).toBe(true)
    expect(isStrongPassword("a".repeat(128)).valid).toBe(true)
  })
})

// ── Score validation ──────────────────────────────────────────────────────────

function isValidScore(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 10
}

describe("isValidScore", () => {
  it("accepts 1-10 integer scores", () => {
    for (let i = 1; i <= 10; i++) {
      expect(isValidScore(i)).toBe(true)
    }
  })

  it("rejects 0", () => {
    expect(isValidScore(0)).toBe(false)
  })

  it("rejects 11", () => {
    expect(isValidScore(11)).toBe(false)
  })

  it("rejects decimal scores", () => {
    expect(isValidScore(8.5)).toBe(false)
    expect(isValidScore(1.1)).toBe(false)
  })

  it("rejects negative scores", () => {
    expect(isValidScore(-1)).toBe(false)
  })
})

// ── Club slug validation ──────────────────────────────────────────────────────

function isValidClubSlug(slug: string): boolean {
  return /^[a-z0-9-]{3,30}$/.test(slug)
}

describe("isValidClubSlug", () => {
  it("accepts valid lowercase slugs", () => {
    expect(isValidClubSlug("my-club")).toBe(true)
    expect(isValidClubSlug("anime-lovers-123")).toBe(true)
    expect(isValidClubSlug("abc")).toBe(true)
  })

  it("rejects uppercase", () => {
    expect(isValidClubSlug("MyClub")).toBe(false)
  })

  it("rejects underscores", () => {
    expect(isValidClubSlug("my_club")).toBe(false)
  })

  it("rejects too short", () => {
    expect(isValidClubSlug("ab")).toBe(false)
  })

  it("rejects too long", () => {
    expect(isValidClubSlug("a".repeat(31))).toBe(false)
  })

  it("rejects spaces", () => {
    expect(isValidClubSlug("my club")).toBe(false)
  })
})
