/**
 * Genre utility tests.
 */
import { describe, it, expect } from "vitest"
import { ANIME_DB } from "@/lib/data/anime"

// ── Genre analysis ────────────────────────────────────────────────────────────

function getAllGenres(anime: typeof ANIME_DB): string[] {
  const genreSet = new Set<string>()
  for (const a of anime) {
    for (const g of a.genres) {
      genreSet.add(g)
    }
  }
  return [...genreSet].sort()
}

function getGenreCount(anime: typeof ANIME_DB): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const a of anime) {
    for (const g of a.genres) {
      counts[g] = (counts[g] ?? 0) + 1
    }
  }
  return counts
}

function getTopGenres(anime: typeof ANIME_DB, n: number): Array<{ genre: string; count: number }> {
  const counts = getGenreCount(anime)
  return Object.entries(counts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
}

describe("genre utilities", () => {
  it("getAllGenres returns non-empty sorted array", () => {
    const genres = getAllGenres(ANIME_DB)
    expect(genres.length).toBeGreaterThan(0)
    // Verify sorted
    for (let i = 1; i < genres.length; i++) {
      expect(genres[i] >= genres[i - 1]).toBe(true)
    }
  })

  it("getGenreCount returns counts for each genre", () => {
    const counts = getGenreCount(ANIME_DB)
    for (const [, count] of Object.entries(counts)) {
      expect(count).toBeGreaterThan(0)
    }
  })

  it("getTopGenres returns n genres sorted by count", () => {
    const top3 = getTopGenres(ANIME_DB, 3)
    expect(top3.length).toBeLessThanOrEqual(3)
    if (top3.length >= 2) {
      expect(top3[0].count).toBeGreaterThanOrEqual(top3[1].count)
    }
  })

  it("total genre assignments equals sum of all anime genres", () => {
    const counts = getGenreCount(ANIME_DB)
    const totalAssignments = Object.values(counts).reduce((sum, c) => sum + c, 0)
    const actualTotal = ANIME_DB.reduce((sum, a) => sum + a.genres.length, 0)
    expect(totalAssignments).toBe(actualTotal)
  })
})

// ── Genre DNA calculation ─────────────────────────────────────────────────────

function calcGenreDNA(animeList: Array<{ genres: string[] }>): Array<{ genre: string; percentage: number }> {
  if (animeList.length === 0) return []

  const counts: Record<string, number> = {}
  for (const a of animeList) {
    for (const g of a.genres) {
      counts[g] = (counts[g] ?? 0) + 1
    }
  }

  const total = Object.values(counts).reduce((s, c) => s + c, 0)
  return Object.entries(counts)
    .map(([genre, count]) => ({ genre, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.percentage - a.percentage)
}

describe("calcGenreDNA", () => {
  it("returns empty array for empty input", () => {
    expect(calcGenreDNA([])).toEqual([])
  })

  it("returns 100% for single genre single anime", () => {
    const result = calcGenreDNA([{ genres: ["Action"] }])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ genre: "Action", percentage: 100 })
  })

  it("splits evenly for equal genres", () => {
    const result = calcGenreDNA([
      { genres: ["Action"] },
      { genres: ["Romance"] },
      { genres: ["Action"] },
      { genres: ["Romance"] },
    ])
    expect(result).toHaveLength(2)
    expect(result[0].percentage).toBe(50)
    expect(result[1].percentage).toBe(50)
  })

  it("sorts by percentage descending", () => {
    const result = calcGenreDNA([
      { genres: ["Action", "Action", "Action"] },
      { genres: ["Romance"] },
    ])
    // Action appears 3x, Romance 1x → Action should be first
    expect(result[0].genre).toBe("Action")
  })

  it("calculates correctly for mixed genres", () => {
    const result = calcGenreDNA([
      { genres: ["Action", "Adventure"] },
      { genres: ["Action", "Drama"] },
      { genres: ["Adventure"] },
    ])
    // Action: 2, Adventure: 2, Drama: 1 → total: 5
    const actionItem = result.find(r => r.genre === "Action")
    expect(actionItem).toBeDefined()
    expect(actionItem!.percentage).toBe(Math.round(2 / 5 * 100)) // 40%
  })
})
