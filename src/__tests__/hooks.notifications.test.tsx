/**
 * Notifications hooks tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode } from "react"
import { useAuthStore } from "@/stores/auth.store"

vi.mock("@/lib/api/endpoints", () => ({
  listNotifications: vi.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20, pages: 0 } }),
  getUnreadCount: vi.fn().mockResolvedValue({ count: 3 }),
  markRead: vi.fn().mockResolvedValue(undefined),
  markAllRead: vi.fn().mockResolvedValue({ updated: 0 }),
}))

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } }
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe("useUnreadCount hook", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: "tok", user: null, isAuthenticated: true })
    vi.clearAllMocks()
  })

  it("fetches unread count when authenticated", async () => {
    const { useUnreadCount } = await import("@/hooks/useNotificationsQuery")
    const { result } = renderHook(() => useUnreadCount(), { wrapper: createWrapper() })

    // Wait for query to settle
    await act(async () => {
      await new Promise(r => setTimeout(r, 50))
    })

    // Query should have been enabled (user is authenticated)
    expect(result.current.isFetching || result.current.isSuccess || result.current.isError).toBe(true)
  })

  it("does not fetch when not authenticated", async () => {
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false })
    const { getUnreadCount } = await import("@/lib/api/endpoints")
    const { useUnreadCount } = await import("@/hooks/useNotificationsQuery")

    renderHook(() => useUnreadCount(), { wrapper: createWrapper() })

    await act(async () => {
      await new Promise(r => setTimeout(r, 50))
    })

    expect(getUnreadCount).not.toHaveBeenCalled()
  })
})

describe("useMarkAllRead hook", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: "tok", user: null, isAuthenticated: true })
    vi.clearAllMocks()
  })

  it("calls markAllRead endpoint on mutate", async () => {
    const { markAllRead } = await import("@/lib/api/endpoints")
    const { useMarkAllRead } = await import("@/hooks/useNotificationsQuery")
    const { result } = renderHook(() => useMarkAllRead(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync()
    })

    expect(markAllRead).toHaveBeenCalledOnce()
  })
})
