/**
 * useThreads hooks tests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

vi.mock("@/lib/api/client", () => ({
  api: vi.fn().mockResolvedValue({ thread: { id: "t1" }, data: [], meta: {} }),
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

describe("useThread hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("fetches thread when id is provided", async () => {
    const { api } = await import("@/lib/api/client")
    const { useThread } = await import("@/hooks/useThreads")

    renderHook(() => useThread("thread-1"), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(api).toHaveBeenCalledWith(expect.stringContaining("/threads/thread-1"))
  })

  it("is disabled when id is empty", async () => {
    const { api } = await import("@/lib/api/client")
    const { useThread } = await import("@/hooks/useThreads")

    renderHook(() => useThread(""), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(api).not.toHaveBeenCalled()
  })
})

describe("useCreateClubThread hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls correct endpoint for club thread creation", async () => {
    const { api } = await import("@/lib/api/client")
    const { useCreateClubThread } = await import("@/hooks/useThreads")

    const { result } = renderHook(() => useCreateClubThread("my-club"), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ title: "New Thread", content: "Content here" })
    })

    expect(api).toHaveBeenCalledWith(
      "/clubs/my-club/threads",
      expect.objectContaining({ method: "POST" })
    )
  })
})

describe("useCreateAnimeThread hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls correct endpoint for anime thread creation", async () => {
    const { api } = await import("@/lib/api/client")
    const { useCreateAnimeThread } = await import("@/hooks/useThreads")

    const { result } = renderHook(() => useCreateAnimeThread(21), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ title: "Episode Discussion", content: "Content" })
    })

    expect(api).toHaveBeenCalledWith(
      "/anime/21/threads",
      expect.objectContaining({ method: "POST" })
    )
  })
})

describe("useReplies hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("fetches replies for a thread", async () => {
    const { api } = await import("@/lib/api/client")
    const { useReplies } = await import("@/hooks/useThreads")

    renderHook(() => useReplies("thread-1"), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(api).toHaveBeenCalledWith(expect.stringContaining("/threads/thread-1/replies"))
  })
})
