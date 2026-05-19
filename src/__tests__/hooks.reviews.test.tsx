/**
 * useReviews hook tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

vi.mock("@/lib/api/client", () => ({
  api: vi.fn().mockResolvedValue({}),
  ApiError: class ApiError extends Error {
    name = "ApiError" as const
    constructor(public status: number, public code: string, message: string) {
      super(message)
      Object.setPrototypeOf(this, new.target.prototype)
    }
  }
}))

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe("useAnimeReviews hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("is disabled when animeId is empty", async () => {
    const { api } = await import("@/lib/api/client")
    const { useAnimeReviews } = await import("@/hooks/useReviews")

    const { result } = renderHook(() => useAnimeReviews(""), { wrapper: createWrapper() })

    // Give query time to potentially fire
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(api).not.toHaveBeenCalled()
    expect(result.current.isFetching).toBe(false)
  })

  it("fetches when animeId is provided", async () => {
    const { api } = await import("@/lib/api/client")
    const { useAnimeReviews } = await import("@/hooks/useReviews")

    renderHook(() => useAnimeReviews("anime-1"), { wrapper: createWrapper() })

    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(api).toHaveBeenCalledWith(expect.stringContaining("/anime/anime-1/reviews"))
  })
})

describe("useCreateReview hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls /reviews with POST and review body", async () => {
    const { api } = await import("@/lib/api/client")
    const { useCreateReview } = await import("@/hooks/useReviews")

    const { result } = renderHook(() => useCreateReview(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({
        animeId: "anime-1",
        score: 9,
        body: "This anime is incredible and everyone should watch it",
        hasSpoilers: false,
      })
    })

    expect(api).toHaveBeenCalledWith("/reviews", expect.objectContaining({ method: "POST" }))
  })
})

describe("useLikeReview hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls like endpoint with POST for like=true", async () => {
    const { api } = await import("@/lib/api/client")
    const { useLikeReview } = await import("@/hooks/useReviews")

    const { result } = renderHook(() => useLikeReview("review-1", "anime-1"), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ like: true })
    })

    expect(api).toHaveBeenCalledWith("/reviews/review-1/like", expect.objectContaining({ method: "POST" }))
  })

  it("calls unlike endpoint with DELETE for like=false", async () => {
    const { api } = await import("@/lib/api/client")
    const { useLikeReview } = await import("@/hooks/useReviews")

    const { result } = renderHook(() => useLikeReview("review-1", "anime-1"), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ like: false })
    })

    expect(api).toHaveBeenCalledWith("/reviews/review-1/like", expect.objectContaining({ method: "DELETE" }))
  })
})
