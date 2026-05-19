/**
 * useAnime hooks tests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

vi.mock("@/lib/api/endpoints", () => ({
  getAnime: vi.fn().mockResolvedValue({ anime: { malId: 21, title: "One Piece" }, listEntry: null }),
  browseAnime: vi.fn().mockResolvedValue({ data: [], meta: {} }),
  searchAnimeApi: vi.fn().mockResolvedValue({ data: [] }),
  getSeasonal: vi.fn().mockResolvedValue({ data: [], meta: {} }),
  upsertListEntry: vi.fn().mockResolvedValue({ entry: { status: "WATCHING" } }),
  removeListEntry: vi.fn().mockResolvedValue(undefined),
}))

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe("useAnime hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("is disabled when malId is 0", async () => {
    const { getAnime } = await import("@/lib/api/endpoints")
    const { useAnime } = await import("@/hooks/useAnime")

    renderHook(() => useAnime(0), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(getAnime).not.toHaveBeenCalled()
  })

  it("fetches anime for valid malId", async () => {
    const { getAnime } = await import("@/lib/api/endpoints")
    const { useAnime } = await import("@/hooks/useAnime")

    renderHook(() => useAnime(21), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(getAnime).toHaveBeenCalledWith(21)
  })
})

describe("useBrowseAnime hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("fetches browse results", async () => {
    const { browseAnime } = await import("@/lib/api/endpoints")
    const { useBrowseAnime } = await import("@/hooks/useAnime")

    renderHook(() => useBrowseAnime({ page: 1, limit: 20 }), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(browseAnime).toHaveBeenCalledWith({ page: 1, limit: 20 })
  })

  it("passes search query", async () => {
    const { browseAnime } = await import("@/lib/api/endpoints")
    const { useBrowseAnime } = await import("@/hooks/useAnime")

    renderHook(() => useBrowseAnime({ q: "naruto", page: 1, limit: 20 }), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(browseAnime).toHaveBeenCalledWith({ q: "naruto", page: 1, limit: 20 })
  })
})

describe("useSearchAnimeApi hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("is disabled for queries under 2 chars", async () => {
    const { searchAnimeApi } = await import("@/lib/api/endpoints")
    const { useSearchAnimeApi } = await import("@/hooks/useAnime")

    renderHook(() => useSearchAnimeApi("a"), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(searchAnimeApi).not.toHaveBeenCalled()
  })

  it("fires for 2+ char queries", async () => {
    const { searchAnimeApi } = await import("@/lib/api/endpoints")
    const { useSearchAnimeApi } = await import("@/hooks/useAnime")

    renderHook(() => useSearchAnimeApi("na"), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(searchAnimeApi).toHaveBeenCalledWith("na")
  })
})

describe("useUpsertListEntry hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls upsert with status", async () => {
    const { upsertListEntry } = await import("@/lib/api/endpoints")
    const { useUpsertListEntry } = await import("@/hooks/useAnime")

    const { result } = renderHook(() => useUpsertListEntry(21), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ status: "WATCHING" })
    })

    expect(upsertListEntry).toHaveBeenCalled()
    expect((upsertListEntry as ReturnType<typeof vi.fn>).mock.calls[0][1]).toMatchObject({ status: "WATCHING" })
  })
})
