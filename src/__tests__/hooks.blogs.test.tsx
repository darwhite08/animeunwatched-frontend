/**
 * useBlogs hook tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

vi.mock("@/lib/api/client", () => ({
  api: vi.fn().mockResolvedValue({ blog: { id: "b1", slug: "test", title: "Test Blog", status: "PUBLISHED" } }),
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

describe("useCreateBlog hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls /blogs with POST and blog data", async () => {
    const { api } = await import("@/lib/api/client")
    const { useCreateBlog } = await import("@/hooks/useBlogs")

    const { result } = renderHook(() => useCreateBlog(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ title: "My Blog", body: "Content here", status: "DRAFT" })
    })

    expect(api).toHaveBeenCalledWith("/blogs", expect.objectContaining({ method: "POST" }))
  })
})

describe("useUpdateBlog hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls /blogs/:slug with PATCH", async () => {
    const { api } = await import("@/lib/api/client")
    const { useUpdateBlog } = await import("@/hooks/useBlogs")

    const { result } = renderHook(() => useUpdateBlog("my-blog"), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ title: "Updated Title" })
    })

    expect(api).toHaveBeenCalledWith("/blogs/my-blog", expect.objectContaining({ method: "PATCH" }))
  })
})

describe("useDeleteBlog hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls /blogs/:slug with DELETE", async () => {
    const { api } = await import("@/lib/api/client")
    ;(api as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined)
    const { useDeleteBlog } = await import("@/hooks/useBlogs")

    const { result } = renderHook(() => useDeleteBlog("my-blog"), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(api).toHaveBeenCalledWith("/blogs/my-blog", expect.objectContaining({ method: "DELETE" }))
  })
})

describe("useBlog hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("is disabled when slug is empty", async () => {
    const { api } = await import("@/lib/api/client")
    const { useBlog } = await import("@/hooks/useBlogs")

    const { result } = renderHook(() => useBlog(""), { wrapper: createWrapper() })

    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(api).not.toHaveBeenCalled()
    expect(result.current.isFetching).toBe(false)
  })
})
