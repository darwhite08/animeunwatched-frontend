/**
 * Watch list management utility tests.
 */
import { describe, it, expect, beforeEach } from "vitest"
import { useWatchlist } from "@/stores/watchlist.store"
import type { Anime } from "@/lib/data/anime"

function makeAnime(id: string, overrides: Partial<Anime> = {}): Anime {
  return {
    id, title: `Anime ${id}`, titleJapanese: "",
    rating: 8.0, year: 2024, episodes: 24,
    type: "TV", status: "finished", studio: "Studio",
    genres: ["Action"], synopsis: "", image: "/img.jpg",
    tags: ["action"], category: "all", rank: 1,
    ...overrides,
  }
}

// ── Watchlist filtering ────────────────────────────────────────────────────────

describe("watchlist filtering utilities", () => {
  beforeEach(() => useWatchlist.setState({ items: [], count: 0 }))

  it("can filter by type TV", () => {
    useWatchlist.getState().add(makeAnime("tv-1", { type: "TV" }))
    useWatchlist.getState().add(makeAnime("movie-1", { type: "Movie" }))
    useWatchlist.getState().add(makeAnime("tv-2", { type: "TV" }))

    const tvAnime = useWatchlist.getState().items.filter(a => a.type === "TV")
    expect(tvAnime).toHaveLength(2)
  })

  it("can filter by status 'airing'", () => {
    useWatchlist.getState().add(makeAnime("air-1", { status: "airing" }))
    useWatchlist.getState().add(makeAnime("fin-1", { status: "finished" }))
    useWatchlist.getState().add(makeAnime("air-2", { status: "airing" }))

    const airing = useWatchlist.getState().items.filter(a => a.status === "airing")
    expect(airing).toHaveLength(2)
  })

  it("can sort by rating descending", () => {
    useWatchlist.getState().add(makeAnime("low", { rating: 6.5 }))
    useWatchlist.getState().add(makeAnime("high", { rating: 9.2 }))
    useWatchlist.getState().add(makeAnime("mid", { rating: 7.8 }))

    const sorted = [...useWatchlist.getState().items].sort((a, b) => b.rating - a.rating)
    expect(sorted[0].id).toBe("high")
    expect(sorted[sorted.length - 1].id).toBe("low")
  })

  it("can sort by year descending (newest first)", () => {
    useWatchlist.getState().add(makeAnime("old", { year: 2010 }))
    useWatchlist.getState().add(makeAnime("new", { year: 2024 }))
    useWatchlist.getState().add(makeAnime("mid", { year: 2018 }))

    const sorted = [...useWatchlist.getState().items].sort((a, b) => b.year - a.year)
    expect(sorted[0].id).toBe("new")
    expect(sorted[sorted.length - 1].id).toBe("old")
  })

  it("can filter by genre", () => {
    useWatchlist.getState().add(makeAnime("isekai", { genres: ["Isekai", "Fantasy"] }))
    useWatchlist.getState().add(makeAnime("mecha", { genres: ["Mecha", "Action"] }))
    useWatchlist.getState().add(makeAnime("shonen", { genres: ["Action", "Adventure"] }))

    const action = useWatchlist.getState().items.filter(a => a.genres.includes("Action"))
    expect(action).toHaveLength(2)
  })

  it("count remains consistent after batch operations", () => {
    const animes = Array.from({ length: 10 }, (_, i) => makeAnime(String(i)))
    animes.forEach(a => useWatchlist.getState().add(a))

    expect(useWatchlist.getState().count).toBe(10)
    expect(useWatchlist.getState().items).toHaveLength(10)

    // Remove half
    animes.slice(0, 5).forEach(a => useWatchlist.getState().remove(a.id))

    expect(useWatchlist.getState().count).toBe(5)
    expect(useWatchlist.getState().items).toHaveLength(5)
  })
})
