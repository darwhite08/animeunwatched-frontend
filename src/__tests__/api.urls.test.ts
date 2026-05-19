/**
 * API URL construction tests — ensures all API URLs are built correctly.
 * These are pure unit tests with no network calls.
 */
import { describe, it, expect } from "vitest"

const BASE = "http://localhost:4000"

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = `${BASE}/api/v1${path}`
  if (!params) return url
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString()
  return qs ? `${url}?${qs}` : url
}

describe("API URL construction", () => {
  it("anime browse URL with all params", () => {
    const url = buildUrl("/anime", { q: "naruto", year: 2024, season: "spring", page: 1, limit: 20 })
    expect(url).toContain("/anime")
    expect(url).toContain("q=naruto")
    expect(url).toContain("year=2024")
    expect(url).toContain("season=spring")
  })

  it("anime detail URL", () => {
    const url = buildUrl("/anime/21")
    expect(url).toContain("/anime/21")
    expect(url).not.toContain("?")
  })

  it("user profile URL", () => {
    const url = buildUrl("/users/naruto_uzumaki")
    expect(url).toContain("/users/naruto_uzumaki")
  })

  it("leaderboard URL with period", () => {
    const url = buildUrl("/users/leaderboard/top", { limit: 50, period: "all-time" })
    expect(url).toContain("/users/leaderboard/top")
    expect(url).toContain("limit=50")
    expect(url).toContain("period=all-time")
  })

  it("seasonal anime URL", () => {
    const url = buildUrl("/anime/season/2024/winter")
    expect(url).toContain("/anime/season/2024/winter")
    expect(url).not.toContain("?")
  })

  it("search URL with q and type", () => {
    const url = buildUrl("/search", { q: "one piece", type: "anime" })
    expect(url).toContain("/search")
    // URLSearchParams encodes spaces as + (not %20)
    expect(url).toContain("q=one+piece")
    expect(url).toContain("type=anime")
  })

  it("blog by slug URL", () => {
    const url = buildUrl("/blogs/my-blog-post")
    expect(url).toContain("/blogs/my-blog-post")
  })

  it("notifications with page param", () => {
    const url = buildUrl("/notifications", { page: 2 })
    expect(url).toContain("/notifications?page=2")
  })

  it("club by slug URL", () => {
    const url = buildUrl("/clubs/anime-lovers")
    expect(url).toContain("/clubs/anime-lovers")
  })

  it("thread replies URL", () => {
    const url = buildUrl("/threads/thread-123/replies")
    expect(url).toContain("/threads/thread-123/replies")
  })

  it("marks undefined params as filtered out", () => {
    const url = buildUrl("/anime", { q: undefined, year: 2024 })
    expect(url).not.toContain("q=")
    expect(url).toContain("year=2024")
  })

  it("handles spaces in search query (+ encoding)", () => {
    const q = "attack on titan"
    const url = buildUrl("/search", { q, type: "anime" })
    // URLSearchParams encodes spaces as +
    expect(url).toContain("attack+on+titan")
  })
})
