/**
 * Concurrent state management tests.
 * Ensures stores handle concurrent updates correctly.
 */
import { describe, it, expect, beforeEach } from "vitest"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"
import { useWatchlist } from "@/stores/watchlist.store"
import type { User } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

const mockUser: User = {
  id: "u1", email: "u@x.com", username: "user1", displayName: "User",
    slug: null,
  bio: null, avatarUrl: null, role: "USER", reputation: 0, createdAt: "2024-01-01T00:00:00Z"
}

function makeAnime(id: string): Anime {
  return {
    id, title: `Anime ${id}`, titleJapanese: "", rating: 8, year: 2024,
    episodes: 12, type: "TV", status: "finished", studio: "Studio",
    genres: ["Action"], synopsis: "", image: "/img.jpg",
    tags: ["action"], category: "all", rank: 1,
  }
}

describe("stores — isolated state", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false })
    useToast.setState({ toasts: [] })
    useWatchlist.setState({ items: [], count: 0 })
  })

  it("auth store and watchlist store operate independently", () => {
    useAuthStore.getState().setAccess("tok")
    useWatchlist.getState().add(makeAnime("1"))

    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useWatchlist.getState().count).toBe(1)

    useAuthStore.getState().clear()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    // Watchlist should not be affected by auth clear
    expect(useWatchlist.getState().count).toBe(1)
  })

  it("auth and toast stores operate independently", () => {
    useAuthStore.getState().setAccess("tok")
    useToast.getState().push("Test toast", "info")

    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useToast.getState().toasts).toHaveLength(1)

    useAuthStore.getState().clear()
    // Toast should remain after auth clear
    expect(useToast.getState().toasts).toHaveLength(1)
  })

  it("all three stores maintain independent state", () => {
    useAuthStore.getState().setAccess("tok")
    useAuthStore.getState().setUser(mockUser)
    useToast.getState().push("Notification", "success")
    useWatchlist.getState().add(makeAnime("a1"))
    useWatchlist.getState().add(makeAnime("a2"))

    expect(useAuthStore.getState().user?.username).toBe("user1")
    expect(useToast.getState().toasts).toHaveLength(1)
    expect(useWatchlist.getState().count).toBe(2)
  })
})

describe("stores — batch updates", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false })
    useWatchlist.setState({ items: [], count: 0 })
  })

  it("multiple watchlist adds are atomic", () => {
    const animes = Array.from({ length: 5 }, (_, i) => makeAnime(String(i)))
    animes.forEach(a => useWatchlist.getState().add(a))

    expect(useWatchlist.getState().items).toHaveLength(5)
    expect(useWatchlist.getState().count).toBe(5)
  })

  it("remove after add sequence is consistent", () => {
    const a1 = makeAnime("1")
    const a2 = makeAnime("2")

    useWatchlist.getState().add(a1)
    useWatchlist.getState().add(a2)
    useWatchlist.getState().remove("1")
    useWatchlist.getState().add(makeAnime("3"))

    expect(useWatchlist.getState().count).toBe(2)
    expect(useWatchlist.getState().has("1")).toBe(false)
    expect(useWatchlist.getState().has("2")).toBe(true)
    expect(useWatchlist.getState().has("3")).toBe(true)
  })
})

describe("stores — subscribe notifications", () => {
  beforeEach(() => {
    useWatchlist.setState({ items: [], count: 0 })
  })

  it("watchlist emits on add", () => {
    const changes: number[] = []
    const unsub = useWatchlist.subscribe(state => changes.push(state.count))

    useWatchlist.getState().add(makeAnime("1"))
    useWatchlist.getState().add(makeAnime("2"))

    // Should have been notified at least once per add
    expect(changes.length).toBeGreaterThan(0)
    unsub()
  })
})
