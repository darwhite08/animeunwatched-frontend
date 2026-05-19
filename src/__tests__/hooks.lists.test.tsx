/**
 * useLists hook tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { useAuthStore } from "@/stores/auth.store"

vi.mock("@/lib/api/endpoints", () => ({
  getList: vi.fn().mockResolvedValue({
    data: [
      { id: "e1", animeId: "a1", status: "WATCHING", score: null, episodesSeen: 5 }
    ],
    meta: { total: 1, page: 1, limit: 20, pages: 1 }
  }),
  upsertListEntry: vi.fn().mockResolvedValue({ entry: { id: "e1", status: "COMPLETED" } }),
  removeListEntry: vi.fn().mockResolvedValue(undefined),
}))

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe("useUserList hook", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("is disabled when username is empty", async () => {
    const { useUserList } = await import("@/hooks/useLists")
    const { result } = renderHook(() => useUserList(""), { wrapper: createWrapper() })
    // When disabled, query is in idle state (not fetching)
    expect(result.current.isFetching).toBe(false)
  })

  it("fetches when username is provided", async () => {
    const { getList } = await import("@/lib/api/endpoints")
    const { useUserList } = await import("@/hooks/useLists")

    const { result } = renderHook(() => useUserList("testuser"), { wrapper: createWrapper() })

    await act(async () => {
      await new Promise(r => setTimeout(r, 50))
    })

    expect(getList).toHaveBeenCalledWith("testuser", undefined)
  })
})

describe("useUpsertEntry hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls upsertListEntry with correct arguments", async () => {
    const { upsertListEntry } = await import("@/lib/api/endpoints")
    const { useUpsertEntry } = await import("@/hooks/useLists")

    const { result } = renderHook(() => useUpsertEntry(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ animeId: "anime-1", status: "WATCHING" })
    })

    expect(upsertListEntry).toHaveBeenCalledWith("anime-1", { status: "WATCHING" })
  })
})

describe("useRemoveEntry hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls removeListEntry with the animeId", async () => {
    const { removeListEntry } = await import("@/lib/api/endpoints")
    const { useRemoveEntry } = await import("@/hooks/useLists")

    const { result } = renderHook(() => useRemoveEntry(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync("anime-1")
    })

    expect(removeListEntry).toHaveBeenCalledWith("anime-1")
  })
})
