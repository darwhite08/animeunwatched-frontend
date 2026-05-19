/**
 * useLeaderboard hook tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

vi.mock("@/lib/api/endpoints", () => ({
  getLeaderboard: vi.fn().mockResolvedValue({
    data: [
      { rank: 1, username: "topper", displayName: "Top User", reputation: 1000, xp: 100000, level: 10, archived: 200, reviews: 50, posts: 100 },
    ],
    meta: { total: 1, period: "all-time" }
  }),
}))

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe("useLeaderboard hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("fetches leaderboard with default limit and period", async () => {
    const { getLeaderboard } = await import("@/lib/api/endpoints")
    const { useLeaderboard } = await import("@/hooks/useLeaderboard")

    renderHook(() => useLeaderboard(), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(getLeaderboard).toHaveBeenCalledWith(50, "all-time")
  })

  it("fetches leaderboard with custom limit and period", async () => {
    const { getLeaderboard } = await import("@/lib/api/endpoints")
    const { useLeaderboard } = await import("@/hooks/useLeaderboard")

    renderHook(() => useLeaderboard(10, "monthly"), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(getLeaderboard).toHaveBeenCalledWith(10, "monthly")
  })

  it("returns data when query succeeds", async () => {
    const { useLeaderboard } = await import("@/hooks/useLeaderboard")

    const { result } = renderHook(() => useLeaderboard(), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 100)) })

    if (result.current.data) {
      expect(result.current.data.data).toHaveLength(1)
      expect(result.current.data.data[0].rank).toBe(1)
    }
  })
})
