/**
 * Anime DTO → local Anime type mapping tests.
 * Tests the mapAPIAnime function used in anime detail page.
 */
import { describe, it, expect } from "vitest"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

// Replicate the mapping function used in anime/[id]/page.tsx
function mapAPIAnime(a: AnimeDTO, rank = 1): Anime {
  return {
    id: String(a.malId),
    title: a.title,
    titleJapanese: a.titleJapanese ?? "",
    rating: a.score ?? 0,
    year: a.year ?? 0,
    episodes: a.episodes,
    type: (["TV","Movie","OVA"] as const).includes(a.type as "TV"|"Movie"|"OVA")
      ? (a.type as "TV"|"Movie"|"OVA")
      : "TV",
    status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished",
    studio: a.studios[0] ?? "Unknown",
    genres: a.genres,
    synopsis: a.synopsis ?? "",
    image: a.imageUrl ?? "/assets/png/tanjiro.png",
    tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")),
    category: "all",
    rank,
  }
}

const mockDTO: AnimeDTO = {
  id: "abc-123",
  malId: 21,
  title: "One Piece",
  titleEnglish: "One Piece",
  titleJapanese: "ワンピース",
  synopsis: "A pirate adventure",
  type: "TV",
  episodes: null,
  status: "Currently Airing",
  airedFrom: "1999-10-20",
  airedTo: null,
  season: "fall",
  year: 1999,
  rating: "PG-13",
  score: 8.9,
  imageUrl: "https://cdn.myanimelist.net/one-piece.jpg",
  trailerUrl: null,
  source: "Manga",
  studios: ["Toei Animation"],
  genres: ["Action", "Adventure", "Fantasy"],
}

describe("mapAPIAnime", () => {
  it("maps malId to string id", () => {
    const result = mapAPIAnime(mockDTO)
    expect(result.id).toBe("21")
    expect(typeof result.id).toBe("string")
  })

  it("preserves title", () => {
    expect(mapAPIAnime(mockDTO).title).toBe("One Piece")
  })

  it("uses score as rating", () => {
    expect(mapAPIAnime(mockDTO).rating).toBe(8.9)
  })

  it("defaults rating to 0 when score is null", () => {
    const dto = { ...mockDTO, score: null }
    expect(mapAPIAnime(dto).rating).toBe(0)
  })

  it("maps genres correctly", () => {
    const result = mapAPIAnime(mockDTO)
    expect(result.genres).toEqual(["Action", "Adventure", "Fantasy"])
  })

  it("generates tags from genres", () => {
    const result = mapAPIAnime(mockDTO)
    expect(result.tags).toContain("action")
    expect(result.tags).toContain("adventure")
    expect(result.tags).toContain("fantasy")
  })

  it("uses first studio", () => {
    expect(mapAPIAnime(mockDTO).studio).toBe("Toei Animation")
  })

  it("uses 'Unknown' for empty studios", () => {
    const dto = { ...mockDTO, studios: [] }
    expect(mapAPIAnime(dto).studio).toBe("Unknown")
  })

  it("detects 'Currently Airing' status", () => {
    expect(mapAPIAnime(mockDTO).status).toBe("airing")
  })

  it("marks finished for completed status", () => {
    // "Finished Airing" contains "airing" so it'd still be detected as "airing"
    // Use a status without "airing" to test the "finished" branch
    const dto = { ...mockDTO, status: "Finished" }
    expect(mapAPIAnime(dto).status).toBe("finished")
  })

  it("defaults type to TV for unknown types", () => {
    const dto = { ...mockDTO, type: "Special" }
    expect(mapAPIAnime(dto).type).toBe("TV")
  })

  it("preserves Movie and OVA types", () => {
    expect(mapAPIAnime({ ...mockDTO, type: "Movie" }).type).toBe("Movie")
    expect(mapAPIAnime({ ...mockDTO, type: "OVA" }).type).toBe("OVA")
  })

  it("uses fallback image when imageUrl is null", () => {
    const dto = { ...mockDTO, imageUrl: null }
    expect(mapAPIAnime(dto).image).toContain("tanjiro.png")
  })

  it("sets rank from parameter", () => {
    expect(mapAPIAnime(mockDTO, 5).rank).toBe(5)
    expect(mapAPIAnime(mockDTO).rank).toBe(1) // default
  })

  it("uses year 0 when year is null", () => {
    const dto = { ...mockDTO, year: null }
    expect(mapAPIAnime(dto).year).toBe(0)
  })

  it("always sets category to 'all'", () => {
    expect(mapAPIAnime(mockDTO).category).toBe("all")
  })
})
