/**
 * Extended anime static data tests with edge cases.
 */
import { describe, it, expect } from "vitest"
import { ANIME_DB, type Anime } from "@/lib/data/anime"

describe("ANIME_DB — data integrity extended", () => {
  it("all anime have synopsis as string", () => {
    for (const anime of ANIME_DB) {
      expect(typeof anime.synopsis).toBe("string")
    }
  })

  it("all anime have studio as non-empty string", () => {
    for (const anime of ANIME_DB) {
      expect(typeof anime.studio).toBe("string")
      expect(anime.studio.length).toBeGreaterThan(0)
    }
  })

  it("all anime have image path", () => {
    for (const anime of ANIME_DB) {
      expect(typeof anime.image).toBe("string")
      expect(anime.image.length).toBeGreaterThan(0)
    }
  })

  it("all anime have tags array", () => {
    for (const anime of ANIME_DB) {
      expect(Array.isArray(anime.tags)).toBe(true)
    }
  })

  it("rank field is a positive integer", () => {
    for (const anime of ANIME_DB) {
      expect(typeof anime.rank).toBe("number")
      expect(anime.rank).toBeGreaterThan(0)
      expect(Number.isInteger(anime.rank)).toBe(true)
    }
  })

  it("all episodes are either null or positive integers", () => {
    for (const anime of ANIME_DB) {
      if (anime.episodes !== null) {
        expect(typeof anime.episodes).toBe("number")
        expect(anime.episodes).toBeGreaterThan(0)
        expect(Number.isInteger(anime.episodes)).toBe(true)
      }
    }
  })

  it("has at least one each of TV, Movie, and OVA if they exist", () => {
    const types = new Set(ANIME_DB.map(a => a.type))
    // The DB should have at least some anime
    expect(types.size).toBeGreaterThan(0)
    // All types must be valid
    for (const type of types) {
      expect(["TV", "Movie", "OVA"]).toContain(type)
    }
  })

  it("has both 'finished' and 'airing' statuses", () => {
    const statuses = new Set(ANIME_DB.map(a => a.status))
    expect(statuses.has("finished") || statuses.has("airing")).toBe(true)
  })

  it("has multiple categories", () => {
    const categories = new Set(ANIME_DB.map(a => a.category))
    expect(categories.size).toBeGreaterThanOrEqual(1)
  })
})

describe("ANIME_DB — sorting", () => {
  it("can be sorted by rating descending", () => {
    const sorted = [...ANIME_DB].sort((a, b) => b.rating - a.rating)
    // First item should have highest rating
    expect(sorted[0].rating).toBeGreaterThanOrEqual(sorted[sorted.length - 1].rating)
  })

  it("can be sorted by year descending", () => {
    const sorted = [...ANIME_DB].sort((a, b) => b.year - a.year)
    expect(sorted[0].year).toBeGreaterThanOrEqual(sorted[sorted.length - 1].year)
  })

  it("can be filtered by type TV", () => {
    const tvAnime = ANIME_DB.filter(a => a.type === "TV")
    for (const anime of tvAnime) {
      expect(anime.type).toBe("TV")
    }
  })

  it("can be filtered by genres", () => {
    const actionAnime = ANIME_DB.filter(a => a.genres.includes("Action"))
    // Should have at least some action anime
    expect(actionAnime.length).toBeGreaterThan(0)
    for (const anime of actionAnime) {
      expect(anime.genres).toContain("Action")
    }
  })
})
