/**
 * useAuth hooks tests
 * Tests that login/logout mutations update the auth store correctly.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode } from "react"
import { useAuthStore } from "@/stores/auth.store"
import type { User } from "@/lib/api/types"

// Mock the endpoints module
vi.mock("@/lib/api/endpoints", () => ({
  login:  vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  me: vi.fn(),
}))

// Mock socket so we don't actually connect
vi.mock("@/lib/socket", () => ({
  connectSocket: vi.fn(),
  disconnectSocket: vi.fn(),
}))

const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  username: "testuser",
  displayName: "Test User",
  bio: null,
  avatarUrl: null,
  role: "USER",
  reputation: 0,
  createdAt: new Date().toISOString(),
}

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe("useLogin hook", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false })
    vi.clearAllMocks()
  })

  it("sets auth state on successful login", async () => {
    const { login } = await import("@/lib/api/endpoints")
    ;(login as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      accessToken: "mock-token-123",
      user: mockUser,
    })

    const { useLogin } = await import("@/hooks/useAuth")
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ email: "test@example.com", password: "Password1!" })
    })

    const state = useAuthStore.getState()
    expect(state.accessToken).toBe("mock-token-123")
    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.email).toBe("test@example.com")
  })

  it("does not set auth state when login fails", async () => {
    const { login } = await import("@/lib/api/endpoints")
    ;(login as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Invalid credentials"))

    const { useLogin } = await import("@/hooks/useAuth")
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })

    await act(async () => {
      try {
        await result.current.mutateAsync({ email: "bad@example.com", password: "wrong" })
      } catch {
        // expected
      }
    })

    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})

describe("useLogout hook", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: "existing-token", user: mockUser, isAuthenticated: true })
    vi.clearAllMocks()
  })

  it("clears auth state on successful logout", async () => {
    const { logout } = await import("@/lib/api/endpoints")
    ;(logout as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined)

    const { useLogout } = await import("@/hooks/useAuth")
    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync()
    })

    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
  })
})
