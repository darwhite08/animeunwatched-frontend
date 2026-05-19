/**
 * usePosts hooks tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

vi.mock("@/lib/api/endpoints", () => ({
  getFeed: vi.fn().mockResolvedValue({ data: [], meta: { nextCursor: null } }),
  getDiscover: vi.fn().mockResolvedValue({ data: [], meta: { nextCursor: null } }),
  createPost: vi.fn().mockResolvedValue({ post: { id: "p1", content: "Hello world" } }),
  deletePost: vi.fn().mockResolvedValue(undefined),
  likePost: vi.fn().mockResolvedValue(undefined),
  unlikePost: vi.fn().mockResolvedValue(undefined),
  getPost: vi.fn().mockResolvedValue({ post: { id: "p1" }, liked: false }),
  getComments: vi.fn().mockResolvedValue({ data: [], meta: {} }),
  createComment: vi.fn().mockResolvedValue({ comment: { id: "c1" } }),
}))

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe("useCreatePost hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls createPost with content", async () => {
    const { createPost } = await import("@/lib/api/endpoints")
    const { useCreatePost } = await import("@/hooks/usePosts")

    const { result } = renderHook(() => useCreatePost(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ content: "Hello world" })
    })

    // TanStack Query calls mutationFn(variables, context) — check first arg
    expect(createPost).toHaveBeenCalled()
    expect((createPost as ReturnType<typeof vi.fn>).mock.calls[0][0]).toEqual({ content: "Hello world" })
  })
})

describe("useLikePost hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls likePost for like=true", async () => {
    const { likePost } = await import("@/lib/api/endpoints")
    const { useLikePost } = await import("@/hooks/usePosts")

    const { result } = renderHook(() => useLikePost("post-1"), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ like: true })
    })

    expect(likePost).toHaveBeenCalledWith("post-1")
  })

  it("calls unlikePost for like=false", async () => {
    const { unlikePost } = await import("@/lib/api/endpoints")
    const { useLikePost } = await import("@/hooks/usePosts")

    const { result } = renderHook(() => useLikePost("post-1"), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ like: false })
    })

    expect(unlikePost).toHaveBeenCalledWith("post-1")
  })
})

describe("useDeletePost hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls deletePost with correct postId", async () => {
    const { deletePost } = await import("@/lib/api/endpoints")
    const { useDeletePost } = await import("@/hooks/usePosts")

    const { result } = renderHook(() => useDeletePost("post-1"), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(deletePost).toHaveBeenCalledWith("post-1")
  })
})
