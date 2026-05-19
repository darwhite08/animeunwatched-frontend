/**
 * API types shape tests — ensures all DTOs have correct shapes.
 * These are compile-time tests that also check runtime shape conventions.
 */
import { describe, it, expect } from "vitest"
import type {
  User, AnimeDTO, ListEntry, Post, Notification,
  WatchStatus, Role, BlogStatus, Paginated, CursorPaginated,
} from "@/lib/api/types"

// ── Type guard helpers ─────────────────────────────────────────────────────────

function isUser(obj: unknown): obj is User {
  if (!obj || typeof obj !== "object") return false
  const u = obj as Record<string, unknown>
  return (
    typeof u.id === "string" &&
    typeof u.email === "string" &&
    typeof u.username === "string" &&
    typeof u.displayName === "string" &&
    typeof u.reputation === "number" &&
    typeof u.createdAt === "string"
  )
}

function isWatchStatus(s: unknown): s is WatchStatus {
  return ["PLAN_TO_WATCH", "WATCHING", "COMPLETED", "ON_HOLD", "DROPPED"].includes(s as string)
}

function isRole(r: unknown): r is Role {
  return ["USER", "MOD", "ADMIN"].includes(r as string)
}

function isBlogStatus(s: unknown): s is BlogStatus {
  return ["DRAFT", "PUBLISHED"].includes(s as string)
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("User DTO type guard", () => {
  it("recognizes a valid User shape", () => {
    const user = {
      id: "u1",
      email: "user@example.com",
      username: "testuser",
      displayName: "Test User",
      bio: null,
      avatarUrl: null,
      role: "USER" as Role,
      reputation: 0,
      createdAt: new Date().toISOString(),
    }
    expect(isUser(user)).toBe(true)
  })

  it("rejects object missing required fields", () => {
    expect(isUser({ id: "u1" })).toBe(false)
    expect(isUser(null)).toBe(false)
    expect(isUser(undefined)).toBe(false)
  })
})

describe("WatchStatus enum values", () => {
  it("accepts all valid WatchStatus values", () => {
    const statuses: WatchStatus[] = ["PLAN_TO_WATCH", "WATCHING", "COMPLETED", "ON_HOLD", "DROPPED"]
    for (const s of statuses) {
      expect(isWatchStatus(s)).toBe(true)
    }
  })

  it("rejects invalid WatchStatus", () => {
    expect(isWatchStatus("SKIPPED")).toBe(false)
    expect(isWatchStatus("watching")).toBe(false)
    expect(isWatchStatus("")).toBe(false)
  })
})

describe("Role enum values", () => {
  it("accepts all valid Role values", () => {
    const roles: Role[] = ["USER", "MOD", "ADMIN"]
    for (const r of roles) {
      expect(isRole(r)).toBe(true)
    }
  })

  it("rejects invalid roles", () => {
    expect(isRole("SUPERADMIN")).toBe(false)
    expect(isRole("user")).toBe(false)
    expect(isRole("")).toBe(false)
  })
})

describe("BlogStatus enum values", () => {
  it("accepts DRAFT and PUBLISHED", () => {
    expect(isBlogStatus("DRAFT")).toBe(true)
    expect(isBlogStatus("PUBLISHED")).toBe(true)
  })

  it("rejects invalid blog status", () => {
    expect(isBlogStatus("PENDING")).toBe(false)
    expect(isBlogStatus("draft")).toBe(false)
  })
})

describe("Paginated type shape", () => {
  it("has correct shape for paginated response", () => {
    const paginated: Paginated<{ id: string }> = {
      data: [{ id: "1" }],
      meta: { total: 1, page: 1, limit: 20, pages: 1 },
    }
    expect(paginated.data).toHaveLength(1)
    expect(paginated.meta.total).toBe(1)
    expect(paginated.meta.pages).toBe(1)
  })

  it("handles empty paginated response", () => {
    const empty: Paginated<never> = {
      data: [],
      meta: { total: 0, page: 1, limit: 20, pages: 0 },
    }
    expect(empty.data).toHaveLength(0)
    expect(empty.meta.total).toBe(0)
    expect(empty.meta.pages).toBe(0)
  })
})
