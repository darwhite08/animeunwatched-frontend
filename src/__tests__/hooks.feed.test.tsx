/**
 * Feed hooks tests — useFeed, useDiscover, useCreatePost.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

vi.mock("@/lib/api/endpoints", () => ({
  getFeed: vi.fn().mockResolvedValue({ data: [], meta: { nextCursor: null } }),
  getDiscover: vi.fn().mockResolvedValue({ data: [], meta: { nextCursor: null } }),
  createPost: vi.fn().mockResolvedValue({ post: { id: "p1", content: "Test" } }),
  deletePost: vi.fn().mockResolvedValue(undefined),
  getPost: vi.fn().mockResolvedValue({ post: { id: "p1" }, liked: false }),
  likePost: vi.fn().mockResolvedValue(undefined),
  unlikePost: vi.fn().mockResolvedValue(undefined),
  getComments: vi.fn().mockResolvedValue({ data: [], meta: {} }),
  createComment: vi.fn().mockResolvedValue({ comment: { id: "c1" } }),
}))

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe("useFeed hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("fetches initial feed page", async () => {
    const { getFeed } = await import("@/lib/api/endpoints")
    const { useFeed } = await import("@/hooks/usePosts")

    renderHook(() => useFeed(), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(getFeed).toHaveBeenCalledWith(undefined)
  })
})

describe("useDiscover hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("fetches discover feed", async () => {
    const { getDiscover } = await import("@/lib/api/endpoints")
    const { useDiscover } = await import("@/hooks/usePosts")

    renderHook(() => useDiscover(), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(getDiscover).toHaveBeenCalledWith(undefined)
  })
})

describe("usePost hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("fetches single post when id provided", async () => {
    const { getPost } = await import("@/lib/api/endpoints")
    const { usePost } = await import("@/hooks/usePosts")

    renderHook(() => usePost("post-1"), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(getPost).toHaveBeenCalledWith("post-1")
  })

  it("is disabled when id is empty", async () => {
    const { getPost } = await import("@/lib/api/endpoints")
    const { usePost } = await import("@/hooks/usePosts")

    renderHook(() => usePost(""), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(getPost).not.toHaveBeenCalled()
  })
})

describe("useComments hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("fetches comments for a post", async () => {
    const { getComments } = await import("@/lib/api/endpoints")
    const { useComments } = await import("@/hooks/usePosts")

    renderHook(() => useComments("post-1"), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    // useComments calls ep.getComments(postId) - no page param since it's a fixed query
    expect(getComments).toHaveBeenCalledWith("post-1")
  })
})

describe("useCreateComment hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("creates a comment for the post", async () => {
    const { createComment } = await import("@/lib/api/endpoints")
    const { useCreateComment } = await import("@/hooks/usePosts")

    const { result } = renderHook(() => useCreateComment("post-1"), { wrapper: createWrapper() })

    await act(async () => {
      // useCreateComment mutationFn takes content as string directly
      await result.current.mutateAsync("Great post!")
    })

    expect(createComment).toHaveBeenCalled()
    // TanStack passes (variables, context) — check first arg
    expect((createComment as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe("post-1")
    expect((createComment as ReturnType<typeof vi.fn>).mock.calls[0][1]).toBe("Great post!")
  })
})
