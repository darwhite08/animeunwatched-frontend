/**
 * Auth store unit tests
 */
import { describe, it, expect, beforeEach } from "vitest"
import { useAuthStore } from "@/stores/auth.store"
import type { User } from "@/lib/api/types"

const mockUser: User = {
  id: "user-1",
  email: "ash@example.com",
  username: "ash_ketchum",
  displayName: "Ash Ketchum",
  bio: null,
  avatarUrl: null,
  role: "USER",
  reputation: 0,
  createdAt: new Date().toISOString(),
}

describe("useAuthStore", () => {
  beforeEach(() => {
    // Reset store between tests
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false })
  })

  it("starts with no auth state", () => {
    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it("setAccess sets token and marks authenticated", () => {
    useAuthStore.getState().setAccess("eyJhbGciOiJIUzI1NiJ9.test")
    const state = useAuthStore.getState()
    expect(state.accessToken).toBe("eyJhbGciOiJIUzI1NiJ9.test")
    expect(state.isAuthenticated).toBe(true)
  })

  it("setUser stores the user object", () => {
    useAuthStore.getState().setUser(mockUser)
    expect(useAuthStore.getState().user).toEqual(mockUser)
  })

  it("clear resets all auth state", () => {
    useAuthStore.getState().setAccess("some-token")
    useAuthStore.getState().setUser(mockUser)

    useAuthStore.getState().clear()

    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it("isAuthenticated is false after clear even if user was set", () => {
    useAuthStore.getState().setAccess("tok")
    useAuthStore.getState().setUser(mockUser)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    useAuthStore.getState().clear()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it("setUser does not change isAuthenticated by itself", () => {
    useAuthStore.getState().setUser(mockUser)
    // isAuthenticated should still be false — only setAccess flips it
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
