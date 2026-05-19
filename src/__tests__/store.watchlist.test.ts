/**
 * Watchlist store unit tests.
 */
import { describe, it, expect, beforeEach } from "vitest"
import { useWatchlist } from "@/stores/watchlist.store"
import type { Anime } from "@/lib/data/anime"

const mockAnime: Anime = {
  id: "one-piece",
  title: "One Piece",
  titleJapanese: "ワンピース",
  rating: 8.9,
  year: 1999,
  episodes: null,
  type: "TV",
  status: "airing",
  studio: "Toei Animation",
  genres: ["Action", "Adventure"],
  synopsis: "Pirate adventure",
  image: "/img.jpg",
  tags: ["action", "adventure"],
  category: "all",
  rank: 1,
}

const mockAnime2: Anime = {
  ...mockAnime,
  id: "naruto",
  title: "Naruto",
}

describe("useWatchlist store", () => {
  beforeEach(() => {
    useWatchlist.setState({ items: [], count: 0 })
  })

  it("starts empty", () => {
    const state = useWatchlist.getState()
    expect(state.items).toHaveLength(0)
    expect(state.count).toBe(0)
  })

  it("add() adds anime to watchlist", () => {
    useWatchlist.getState().add(mockAnime)
    const state = useWatchlist.getState()
    expect(state.items).toHaveLength(1)
    expect(state.count).toBe(1)
    expect(state.items[0].title).toBe("One Piece")
  })

  it("add() does not duplicate already-added anime", () => {
    useWatchlist.getState().add(mockAnime)
    useWatchlist.getState().add(mockAnime)
    expect(useWatchlist.getState().items).toHaveLength(1)
    expect(useWatchlist.getState().count).toBe(1)
  })

  it("remove() removes anime from watchlist", () => {
    useWatchlist.getState().add(mockAnime)
    useWatchlist.getState().add(mockAnime2)
    useWatchlist.getState().remove("one-piece")

    const state = useWatchlist.getState()
    expect(state.items).toHaveLength(1)
    expect(state.count).toBe(1)
    expect(state.items[0].id).toBe("naruto")
  })

  it("remove() does nothing if anime not in list", () => {
    useWatchlist.getState().add(mockAnime)
    useWatchlist.getState().remove("non-existent")
    expect(useWatchlist.getState().items).toHaveLength(1)
  })

  it("has() returns true for added anime", () => {
    useWatchlist.getState().add(mockAnime)
    expect(useWatchlist.getState().has("one-piece")).toBe(true)
  })

  it("has() returns false for non-added anime", () => {
    expect(useWatchlist.getState().has("one-piece")).toBe(false)
  })

  it("count never goes below 0", () => {
    useWatchlist.getState().remove("non-existent")
    expect(useWatchlist.getState().count).toBe(0)
  })

  it("count tracks correctly after multiple operations", () => {
    useWatchlist.getState().add(mockAnime)
    useWatchlist.getState().add(mockAnime2)
    expect(useWatchlist.getState().count).toBe(2)
    useWatchlist.getState().remove("one-piece")
    expect(useWatchlist.getState().count).toBe(1)
    useWatchlist.getState().remove("naruto")
    expect(useWatchlist.getState().count).toBe(0)
  })
})
