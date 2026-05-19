/**
 * Extended watchlist tests — edge cases, performance, filtering.
 */
import { describe, it, expect, beforeEach } from "vitest"
import { useWatchlist } from "@/stores/watchlist.store"
import type { Anime } from "@/lib/data/anime"

function makeAnime(id: string, overrides: Partial<Anime> = {}): Anime {
  return {
    id,
    title: `Anime ${id}`,
    titleJapanese: `アニメ ${id}`,
    rating: 8.0,
    year: 2024,
    episodes: 24,
    type: "TV",
    status: "finished",
    studio: "Test Studio",
    genres: ["Action"],
    synopsis: "Test synopsis",
    image: "/img.jpg",
    tags: ["action"],
    category: "all",
    rank: 1,
    ...overrides,
  }
}

describe("useWatchlist — edge cases", () => {
  beforeEach(() => {
    useWatchlist.setState({ items: [], count: 0 })
  })

  it("handles adding 50 anime without performance issues", () => {
    const start = performance.now()
    for (let i = 0; i < 50; i++) {
      useWatchlist.getState().add(makeAnime(String(i)))
    }
    const duration = performance.now() - start
    expect(duration).toBeLessThan(100) // Should complete in < 100ms
    expect(useWatchlist.getState().count).toBe(50)
  })

  it("has() returns correct result after multiple operations", () => {
    useWatchlist.getState().add(makeAnime("a1"))
    useWatchlist.getState().add(makeAnime("a2"))
    useWatchlist.getState().remove("a1")
    useWatchlist.getState().add(makeAnime("a3"))

    expect(useWatchlist.getState().has("a1")).toBe(false) // removed
    expect(useWatchlist.getState().has("a2")).toBe(true)  // still there
    expect(useWatchlist.getState().has("a3")).toBe(true)  // newly added
  })

  it("count stays in sync with items.length", () => {
    for (let i = 0; i < 10; i++) {
      useWatchlist.getState().add(makeAnime(String(i)))
    }
    expect(useWatchlist.getState().count).toBe(useWatchlist.getState().items.length)

    for (let i = 0; i < 5; i++) {
      useWatchlist.getState().remove(String(i))
    }
    expect(useWatchlist.getState().count).toBe(useWatchlist.getState().items.length)
  })

  it("preserves anime data correctly", () => {
    const anime = makeAnime("test", { rating: 9.5, year: 2023, type: "Movie" })
    useWatchlist.getState().add(anime)

    const stored = useWatchlist.getState().items[0]
    expect(stored.rating).toBe(9.5)
    expect(stored.year).toBe(2023)
    expect(stored.type).toBe("Movie")
  })

  it("items array preserves insertion order", () => {
    useWatchlist.getState().add(makeAnime("first"))
    useWatchlist.getState().add(makeAnime("second"))
    useWatchlist.getState().add(makeAnime("third"))

    const items = useWatchlist.getState().items
    expect(items[0].id).toBe("first")
    expect(items[1].id).toBe("second")
    expect(items[2].id).toBe("third")
  })

  it("can filter items by genre", () => {
    useWatchlist.getState().add(makeAnime("a1", { genres: ["Action", "Adventure"] }))
    useWatchlist.getState().add(makeAnime("a2", { genres: ["Romance", "Drama"] }))
    useWatchlist.getState().add(makeAnime("a3", { genres: ["Action", "Comedy"] }))

    const actionAnime = useWatchlist.getState().items.filter(a => a.genres.includes("Action"))
    expect(actionAnime).toHaveLength(2)
    expect(actionAnime.map(a => a.id)).toContain("a1")
    expect(actionAnime.map(a => a.id)).toContain("a3")
  })
})
