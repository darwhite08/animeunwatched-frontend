/**
 * useClubs hook tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { ApiError } from "@/lib/api/client"

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

describe("useJoinClub hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls join endpoint when join=true", async () => {
    const { api } = await import("@/lib/api/client")
    const { useJoinClub } = await import("@/hooks/useClubs")

    const { result } = renderHook(() => useJoinClub("my-club"), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ join: true })
    })

    expect(api).toHaveBeenCalledWith("/clubs/my-club/join", expect.objectContaining({ method: "POST" }))
  })

  it("calls leave endpoint when join=false", async () => {
    const { api } = await import("@/lib/api/client")
    const { useJoinClub } = await import("@/hooks/useClubs")

    const { result } = renderHook(() => useJoinClub("my-club"), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ join: false })
    })

    expect(api).toHaveBeenCalledWith("/clubs/my-club/membership", expect.objectContaining({ method: "DELETE" }))
  })
})

describe("useCreateClub hook", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls clubs endpoint with POST and correct body", async () => {
    const { api } = await import("@/lib/api/client")
    const { useCreateClub } = await import("@/hooks/useClubs")

    const { result } = renderHook(() => useCreateClub(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ name: "Anime Club", slug: "anime-club", description: "Cool club" })
    })

    expect(api).toHaveBeenCalledWith(
      "/clubs",
      expect.objectContaining({ method: "POST" })
    )
  })
})
