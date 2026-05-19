/**
 * Data integrity tests — ensures all data contracts are met.
 */
import { describe, it, expect } from "vitest"
import { ANIME_DB } from "@/lib/data/anime"

describe("ANIME_DB — complete data integrity", () => {
  it("has more than 5 anime entries", () => {
    expect(ANIME_DB.length).toBeGreaterThan(5)
  })

  it("no anime has the same rank as another", () => {
    const ranks = ANIME_DB.map(a => a.rank)
    const uniqueRanks = new Set(ranks)
    expect(uniqueRanks.size).toBe(ranks.length)
  })

  it("all anime have valid type enum values", () => {
    const valid = ["TV", "Movie", "OVA"]
    for (const anime of ANIME_DB) {
      expect(valid).toContain(anime.type)
    }
  })

  it("all anime have valid status enum values", () => {
    const valid = ["finished", "airing"]
    for (const anime of ANIME_DB) {
      expect(valid).toContain(anime.status)
    }
  })

  it("all anime have valid category enum values", () => {
    const valid = ["trending", "top-rated", "new", "all"]
    for (const anime of ANIME_DB) {
      expect(valid).toContain(anime.category)
    }
  })

  it("all ratings are within 0-10 range", () => {
    for (const anime of ANIME_DB) {
      expect(anime.rating).toBeGreaterThanOrEqual(0)
      expect(anime.rating).toBeLessThanOrEqual(10)
    }
  })

  it("all years are reasonable (after 1963 — first anime)", () => {
    for (const anime of ANIME_DB) {
      expect(anime.year).toBeGreaterThanOrEqual(1963)
      expect(anime.year).toBeLessThanOrEqual(new Date().getFullYear() + 2)
    }
  })

  it("all titles are non-empty strings", () => {
    for (const anime of ANIME_DB) {
      expect(typeof anime.title).toBe("string")
      expect(anime.title.length).toBeGreaterThan(0)
    }
  })

  it("all IDs are unique strings", () => {
    const ids = ANIME_DB.map(a => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) {
      expect(typeof id).toBe("string")
      expect(id.length).toBeGreaterThan(0)
    }
  })

  it("all genres arrays are non-empty", () => {
    for (const anime of ANIME_DB) {
      expect(anime.genres.length).toBeGreaterThan(0)
    }
  })

  it("all tags are non-empty strings", () => {
    for (const anime of ANIME_DB) {
      for (const tag of anime.tags) {
        expect(typeof tag).toBe("string")
        expect(tag.length).toBeGreaterThan(0)
      }
    }
  })

  it("can find anime by id", () => {
    if (ANIME_DB.length === 0) return
    const first = ANIME_DB[0]
    const found = ANIME_DB.find(a => a.id === first.id)
    expect(found).toBeDefined()
    expect(found?.id).toBe(first.id)
  })

  it("episodes are either null (ongoing) or positive integers", () => {
    for (const anime of ANIME_DB) {
      if (anime.episodes !== null) {
        expect(typeof anime.episodes).toBe("number")
        expect(Number.isInteger(anime.episodes)).toBe(true)
        expect(anime.episodes).toBeGreaterThan(0)
      }
    }
  })
})
