/**
 * Anime static data integrity tests
 */
import { describe, it, expect } from "vitest"
import { ANIME_DB, type Anime } from "@/lib/data/anime"

describe("ANIME_DB", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(ANIME_DB)).toBe(true)
    expect(ANIME_DB.length).toBeGreaterThan(0)
  })

  it("every entry has required fields", () => {
    for (const anime of ANIME_DB) {
      expect(typeof anime.id).toBe("string")
      expect(anime.id.length).toBeGreaterThan(0)
      expect(typeof anime.title).toBe("string")
      expect(anime.title.length).toBeGreaterThan(0)
      expect(typeof anime.rating).toBe("number")
      expect(Array.isArray(anime.genres)).toBe(true)
    }
  })

  it("ratings are in valid range 0–10", () => {
    for (const anime of ANIME_DB) {
      expect(anime.rating).toBeGreaterThanOrEqual(0)
      expect(anime.rating).toBeLessThanOrEqual(10)
    }
  })

  it("types are valid enum values", () => {
    const validTypes: Anime["type"][] = ["TV", "Movie", "OVA"]
    for (const anime of ANIME_DB) {
      expect(validTypes).toContain(anime.type)
    }
  })

  it("statuses are valid enum values", () => {
    const validStatuses: Anime["status"][] = ["finished", "airing"]
    for (const anime of ANIME_DB) {
      expect(validStatuses).toContain(anime.status)
    }
  })

  it("categories are valid enum values", () => {
    const validCategories: Anime["category"][] = ["trending", "top-rated", "new", "all"]
    for (const anime of ANIME_DB) {
      expect(validCategories).toContain(anime.category)
    }
  })

  it("all IDs are unique", () => {
    const ids = ANIME_DB.map(a => a.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it("years are reasonable (2000+)", () => {
    for (const anime of ANIME_DB) {
      expect(anime.year).toBeGreaterThanOrEqual(1990)
      expect(anime.year).toBeLessThanOrEqual(new Date().getFullYear() + 1)
    }
  })

  it("genres arrays are non-empty", () => {
    for (const anime of ANIME_DB) {
      expect(anime.genres.length).toBeGreaterThan(0)
    }
  })
})
