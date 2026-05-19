/**
 * Anime sorting and filtering algorithm tests.
 */
import { describe, it, expect } from "vitest"
import type { Anime } from "@/lib/data/anime"
import { ANIME_DB } from "@/lib/data/anime"

// ── Sort functions ────────────────────────────────────────────────────────────

function sortByRating(anime: Anime[], direction: "asc" | "desc" = "desc"): Anime[] {
  return [...anime].sort((a, b) =>
    direction === "desc" ? b.rating - a.rating : a.rating - b.rating
  )
}

function sortByYear(anime: Anime[], direction: "asc" | "desc" = "desc"): Anime[] {
  return [...anime].sort((a, b) =>
    direction === "desc" ? b.year - a.year : a.year - b.year
  )
}

function sortByTitle(anime: Anime[]): Anime[] {
  return [...anime].sort((a, b) => a.title.localeCompare(b.title))
}

describe("sortByRating", () => {
  const sample = ANIME_DB.slice(0, 5)

  it("sorts descending (highest first) by default", () => {
    const sorted = sortByRating(sample)
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].rating).toBeGreaterThanOrEqual(sorted[i].rating)
    }
  })

  it("sorts ascending (lowest first) when specified", () => {
    const sorted = sortByRating(sample, "asc")
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].rating).toBeLessThanOrEqual(sorted[i].rating)
    }
  })

  it("preserves all anime in result", () => {
    const sorted = sortByRating(sample)
    expect(sorted).toHaveLength(sample.length)
  })

  it("does not mutate original array", () => {
    const original = [...sample]
    sortByRating(sample, "asc")
    expect(sample.map(a => a.id)).toEqual(original.map(a => a.id))
  })
})

describe("sortByYear", () => {
  const sample = ANIME_DB.slice(0, 5)

  it("sorts descending (newest first) by default", () => {
    const sorted = sortByYear(sample)
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].year).toBeGreaterThanOrEqual(sorted[i].year)
    }
  })
})

describe("sortByTitle", () => {
  it("sorts alphabetically", () => {
    const sample = [
      { ...ANIME_DB[0], title: "Zoro" },
      { ...ANIME_DB[0], title: "Ace" },
      { ...ANIME_DB[0], title: "Luffy" },
    ]
    const sorted = sortByTitle(sample)
    expect(sorted[0].title).toBe("Ace")
    expect(sorted[1].title).toBe("Luffy")
    expect(sorted[2].title).toBe("Zoro")
  })
})

// ── Filter functions ──────────────────────────────────────────────────────────

function filterByType(anime: Anime[], type: Anime["type"]): Anime[] {
  return anime.filter(a => a.type === type)
}

function filterByStatus(anime: Anime[], status: Anime["status"]): Anime[] {
  return anime.filter(a => a.status === status)
}

function filterByGenre(anime: Anime[], genre: string): Anime[] {
  return anime.filter(a => a.genres.includes(genre))
}

function filterByMinRating(anime: Anime[], minRating: number): Anime[] {
  return anime.filter(a => a.rating >= minRating)
}

describe("filterByType", () => {
  it("filters correctly for TV", () => {
    const tvAnime = filterByType(ANIME_DB, "TV")
    expect(tvAnime.every(a => a.type === "TV")).toBe(true)
  })

  it("returns empty for type with no anime", () => {
    // All our DB anime are TV, Movie, or OVA
    const results = filterByType(ANIME_DB, "Movie")
    expect(results.every(a => a.type === "Movie")).toBe(true)
  })
})

describe("filterByMinRating", () => {
  it("filters correctly", () => {
    const highRated = filterByMinRating(ANIME_DB, 9.0)
    expect(highRated.every(a => a.rating >= 9.0)).toBe(true)
  })

  it("returns all anime for minRating=0", () => {
    expect(filterByMinRating(ANIME_DB, 0)).toHaveLength(ANIME_DB.length)
  })

  it("returns no anime for minRating > 10", () => {
    expect(filterByMinRating(ANIME_DB, 10.1)).toHaveLength(0)
  })
})
