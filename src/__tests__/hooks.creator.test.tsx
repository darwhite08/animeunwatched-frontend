/**
 * Creator hooks tests.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { useAuthStore } from "@/stores/auth.store"

vi.mock("@/lib/api/client", () => ({
  api: vi.fn().mockResolvedValue({ data: [], meta: {} }),
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

describe("useCreatorStats hook", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ accessToken: "tok", user: null, isAuthenticated: true })
  })

  afterEach(() => {
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false })
  })

  it("fetches creator stats when authenticated", async () => {
    const { api } = await import("@/lib/api/client")
    const { useCreatorStats } = await import("@/hooks/useCreator")

    renderHook(() => useCreatorStats(), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(api).toHaveBeenCalledWith(expect.stringContaining("/creator/stats"))
  })

  it("is disabled when not authenticated", async () => {
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false })
    const { api } = await import("@/lib/api/client")
    const { useCreatorStats } = await import("@/hooks/useCreator")

    renderHook(() => useCreatorStats(), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(api).not.toHaveBeenCalled()
  })
})

describe("useCreatorContent hook", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ accessToken: "tok", user: null, isAuthenticated: true })
  })

  afterEach(() => {
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false })
  })

  it("fetches content when authenticated", async () => {
    const { api } = await import("@/lib/api/client")
    const { useCreatorContent } = await import("@/hooks/useCreator")

    renderHook(() => useCreatorContent(), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(api).toHaveBeenCalledWith(expect.stringContaining("/creator/content"))
  })
})
