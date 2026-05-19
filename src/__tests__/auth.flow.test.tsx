/**
 * Auth flow integration tests.
 * Tests the full auth flow: login → store update → logout → store clear.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { useAuthStore } from "@/stores/auth.store"
import type { User } from "@/lib/api/types"

const mockUser: User = {
  id: "test-user-1",
  email: "naruto@konoha.com",
  username: "naruto_uzumaki",
  displayName: "Naruto Uzumaki",
  bio: "Believe it!",
  avatarUrl: null,
  role: "USER",
  reputation: 420,
  createdAt: "2024-01-01T00:00:00Z",
}

vi.mock("@/lib/api/endpoints", () => ({
  login:  vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  me:     vi.fn(),
  register: vi.fn(),
}))

vi.mock("@/lib/socket", () => ({
  connectSocket: vi.fn(),
  disconnectSocket: vi.fn(),
}))

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe("Full auth flow", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false })
    vi.clearAllMocks()
  })

  it("login flow: sets token, user, and marks authenticated", async () => {
    const { login } = await import("@/lib/api/endpoints")
    ;(login as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      accessToken: "access-token-xyz",
      user: mockUser,
    })

    const { useLogin } = await import("@/hooks/useAuth")
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ email: "naruto@konoha.com", password: "Believe1t!" })
    })

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.accessToken).toBe("access-token-xyz")
    expect(state.user?.username).toBe("naruto_uzumaki")
    expect(state.user?.email).toBe("naruto@konoha.com")
  })

  it("logout flow: clears token, user, and marks unauthenticated", async () => {
    // Start logged in
    useAuthStore.setState({ accessToken: "some-token", user: mockUser, isAuthenticated: true })

    const { logout } = await import("@/lib/api/endpoints")
    const { useLogout } = await import("@/hooks/useAuth")
    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync()
    })

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.accessToken).toBeNull()
    expect(state.user).toBeNull()
    expect(logout).toHaveBeenCalled()
  })

  it("register flow: sets token and user", async () => {
    const { register } = await import("@/lib/api/endpoints")
    ;(register as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      accessToken: "new-user-token",
      user: mockUser,
    })

    const { useRegister } = await import("@/hooks/useAuth")
    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({
        email: "naruto@konoha.com",
        username: "naruto_uzumaki",
        displayName: "Naruto Uzumaki",
        password: "Password1!",
      })
    })

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.accessToken).toBe("new-user-token")
  })

  it("auth store state is independent across tests (no bleed)", () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.accessToken).toBeNull()
    expect(state.user).toBeNull()
  })
})
