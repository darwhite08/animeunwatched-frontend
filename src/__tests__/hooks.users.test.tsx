/**
 * useUsers hooks tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

vi.mock("@/lib/api/endpoints", () => ({
  getUser: vi.fn().mockResolvedValue({ user: { id: "u1", username: "testuser", displayName: "Test User", reputation: 50 } }),
  updateMe: vi.fn().mockResolvedValue({ user: { id: "u1", displayName: "Updated" } }),
  follow: vi.fn().mockResolvedValue(undefined),
  unfollow: vi.fn().mockResolvedValue(undefined),
  getFollowers: vi.fn().mockResolvedValue({ data: [], meta: {} }),
  getFollowing: vi.fn().mockResolvedValue({ data: [], meta: {} }),
}))

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe("useUserProfile hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("is disabled when username is empty", async () => {
    const { getUser } = await import("@/lib/api/endpoints")
    const { useUserProfile } = await import("@/hooks/useUsers")

    renderHook(() => useUserProfile(""), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(getUser).not.toHaveBeenCalled()
  })

  it("fetches profile when username is provided", async () => {
    const { getUser } = await import("@/lib/api/endpoints")
    const { useUserProfile } = await import("@/hooks/useUsers")

    renderHook(() => useUserProfile("testuser"), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(getUser).toHaveBeenCalledWith("testuser")
  })
})

describe("useUpdateMe hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls updateMe endpoint with PATCH body", async () => {
    const { updateMe } = await import("@/lib/api/endpoints")
    const { useUpdateMe } = await import("@/hooks/useUsers")

    const { result } = renderHook(() => useUpdateMe(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ displayName: "New Name", bio: "New bio" })
    })

    // TanStack Query passes (variables, context) to mutationFn
    expect(updateMe).toHaveBeenCalled()
    expect((updateMe as ReturnType<typeof vi.fn>).mock.calls[0][0]).toMatchObject({ displayName: "New Name" })
  })
})

describe("useFollow hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls follow endpoint when follow=true", async () => {
    const { follow } = await import("@/lib/api/endpoints")
    const { useFollow } = await import("@/hooks/useUsers")

    const { result } = renderHook(() => useFollow("targetuser"), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ follow: true })
    })

    expect(follow).toHaveBeenCalledWith("targetuser")
  })

  it("calls unfollow endpoint when follow=false", async () => {
    const { unfollow } = await import("@/lib/api/endpoints")
    const { useFollow } = await import("@/hooks/useUsers")

    const { result } = renderHook(() => useFollow("targetuser"), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ follow: false })
    })

    expect(unfollow).toHaveBeenCalledWith("targetuser")
  })
})

describe("useFollowers hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("fetches followers for a username", async () => {
    const { getFollowers } = await import("@/lib/api/endpoints")
    const { useFollowers } = await import("@/hooks/useUsers")

    renderHook(() => useFollowers("testuser"), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(getFollowers).toHaveBeenCalledWith("testuser")
  })

  it("is disabled for empty username", async () => {
    const { getFollowers } = await import("@/lib/api/endpoints")
    const { useFollowers } = await import("@/hooks/useUsers")

    renderHook(() => useFollowers(""), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(getFollowers).not.toHaveBeenCalled()
  })
})
