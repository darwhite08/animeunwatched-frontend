/**
 * Club utility tests — membership checks, role hierarchy.
 */
import { describe, it, expect } from "vitest"

// ── Club role hierarchy ───────────────────────────────────────────────────────

type ClubRole = "USER" | "MOD" | "ADMIN"

function canModerate(role: ClubRole): boolean {
  return role === "MOD" || role === "ADMIN"
}

function canAdminister(role: ClubRole): boolean {
  return role === "ADMIN"
}

function getRoleLevel(role: ClubRole): number {
  const levels: Record<ClubRole, number> = { USER: 1, MOD: 2, ADMIN: 3 }
  return levels[role]
}

describe("club role hierarchy", () => {
  it("USER cannot moderate", () => {
    expect(canModerate("USER")).toBe(false)
  })

  it("MOD can moderate", () => {
    expect(canModerate("MOD")).toBe(true)
  })

  it("ADMIN can moderate", () => {
    expect(canModerate("ADMIN")).toBe(true)
  })

  it("only ADMIN can administer", () => {
    expect(canAdminister("ADMIN")).toBe(true)
    expect(canAdminister("MOD")).toBe(false)
    expect(canAdminister("USER")).toBe(false)
  })

  it("role levels are strictly ordered", () => {
    expect(getRoleLevel("ADMIN")).toBeGreaterThan(getRoleLevel("MOD"))
    expect(getRoleLevel("MOD")).toBeGreaterThan(getRoleLevel("USER"))
  })
})

// ── Member count display ──────────────────────────────────────────────────────

function formatMemberCount(count: number): string {
  if (count === 1) return "1 member"
  return `${count.toLocaleString()} members`
}

describe("formatMemberCount", () => {
  it("uses singular for 1 member", () => {
    expect(formatMemberCount(1)).toBe("1 member")
  })

  it("uses plural for 0 members", () => {
    expect(formatMemberCount(0)).toBe("0 members")
  })

  it("uses plural for 2+ members", () => {
    expect(formatMemberCount(5)).toBe("5 members")
    expect(formatMemberCount(100)).toBe("100 members")
  })
})

// ── Club slug normalization ───────────────────────────────────────────────────

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")   // collapse consecutive hyphens
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
}

describe("normalizeSlug", () => {
  it("lowercases input", () => {
    expect(normalizeSlug("My Club")).toContain("my")
    expect(normalizeSlug("My Club")).toContain("club")
  })

  it("replaces spaces with hyphens", () => {
    expect(normalizeSlug("one piece")).toBe("one-piece")
  })

  it("collapses multiple special chars", () => {
    expect(normalizeSlug("one  --  piece")).toBe("one-piece")
  })

  it("trims leading/trailing hyphens", () => {
    expect(normalizeSlug("!club!")).toBe("club")
  })

  it("caps at 30 chars", () => {
    const long = "a".repeat(50)
    expect(normalizeSlug(long).length).toBeLessThanOrEqual(30)
  })
})

// ── Thread count display ──────────────────────────────────────────────────────

function getThreadsLabel(count: number): string {
  if (count === 0) return "No threads yet"
  if (count === 1) return "1 thread"
  return `${count} threads`
}

describe("getThreadsLabel", () => {
  it("returns 'No threads yet' for 0", () => {
    expect(getThreadsLabel(0)).toBe("No threads yet")
  })

  it("returns singular for 1", () => {
    expect(getThreadsLabel(1)).toBe("1 thread")
  })

  it("returns plural for 2+", () => {
    expect(getThreadsLabel(5)).toBe("5 threads")
    expect(getThreadsLabel(100)).toBe("100 threads")
  })
})
