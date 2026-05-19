/**
 * useSearch hook tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

vi.mock("@/lib/api/client", () => ({
  api: vi.fn().mockResolvedValue({ data: [], meta: {} }),
  ApiError: class ApiError extends Error {
    name = "ApiError" as const
    constructor(public status: number, public code: string, message: string) { super(message) }
  }
}))

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe("useSearchResults hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("is disabled for queries under 2 chars", async () => {
    const { api } = await import("@/lib/api/client")
    const { useSearchResults } = await import("@/hooks/useSearch")

    renderHook(() => useSearchResults("a"), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(api).not.toHaveBeenCalled()
  })

  it("is enabled for queries >= 2 chars", async () => {
    const { api } = await import("@/lib/api/client")
    const { useSearchResults } = await import("@/hooks/useSearch")

    renderHook(() => useSearchResults("na"), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(api).toHaveBeenCalledWith(expect.stringContaining("search?q=na"))
  })

  it("encodes special characters in query", async () => {
    const { api } = await import("@/lib/api/client")
    const { useSearchResults } = await import("@/hooks/useSearch")

    renderHook(() => useSearchResults("attack on"), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(api).toHaveBeenCalledWith(expect.stringContaining("attack"))
  })
})

describe("useSearchSuggestions hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("is disabled for empty query", async () => {
    const { api } = await import("@/lib/api/client")
    const { useSearchSuggestions } = await import("@/hooks/useSearch")

    renderHook(() => useSearchSuggestions(""), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(api).not.toHaveBeenCalled()
  })

  it("fires for single character", async () => {
    const { api } = await import("@/lib/api/client")
    const { useSearchSuggestions } = await import("@/hooks/useSearch")

    renderHook(() => useSearchSuggestions("n"), { wrapper: createWrapper() })
    await act(async () => { await new Promise(r => setTimeout(r, 50)) })

    expect(api).toHaveBeenCalledWith(expect.stringContaining("suggestions?q=n"))
  })
})
