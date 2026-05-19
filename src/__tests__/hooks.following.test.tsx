/**
 * Following/followers hooks tests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

vi.mock("@/lib/api/endpoints", () => ({
  getFollowers: vi.fn().mockResolvedValue({ data: [], meta: {} }),
  getFollowing: vi.fn().mockResolvedValue({ data: [], meta: {} }),
  follow: vi.fn().mockResolvedValue(undefined),
  unfollow: vi.fn().mockResolvedValue(undefined),
  getUser: vi.fn().mockResolvedValue({ user: { id: "u1", username: "testuser" } }),
  updateMe: vi.fn().mockResolvedValue({ user: { id: "u1" } }),
}))

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe("useFollowers hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("fetches followers list", async () => {
    const { getFollowers } = await import("@/lib/api/endpoints")
    const { useFollowers } = await import("@/hooks/useUsers")

    renderHook(() => useFollowers("testuser"), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(getFollowers).toHaveBeenCalledWith("testuser")
  })
})

describe("useFollowing hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("fetches following list", async () => {
    const { getFollowing } = await import("@/lib/api/endpoints")
    const { useFollowing } = await import("@/hooks/useUsers")

    renderHook(() => useFollowing("testuser"), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(getFollowing).toHaveBeenCalledWith("testuser")
  })
})

describe("useFollow hook — toggle behavior", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls follow when follow=true", async () => {
    const { follow } = await import("@/lib/api/endpoints")
    const { useFollow } = await import("@/hooks/useUsers")

    const { result } = renderHook(() => useFollow("targetuser"), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ follow: true })
    })

    expect(follow).toHaveBeenCalledWith("targetuser")
  })

  it("calls unfollow when follow=false", async () => {
    const { unfollow } = await import("@/lib/api/endpoints")
    const { useFollow } = await import("@/hooks/useUsers")

    const { result } = renderHook(() => useFollow("targetuser"), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ follow: false })
    })

    expect(unfollow).toHaveBeenCalledWith("targetuser")
  })
})

describe("useUserProfile hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("fetches user profile data", async () => {
    const { getUser } = await import("@/lib/api/endpoints")
    const { useUserProfile } = await import("@/hooks/useUsers")

    renderHook(() => useUserProfile("testuser"), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(getUser).toHaveBeenCalledWith("testuser")
  })
})
