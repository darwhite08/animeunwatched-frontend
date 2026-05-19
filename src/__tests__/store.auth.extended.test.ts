/**
 * Extended auth store tests — edge cases and subscriptions.
 */
import { describe, it, expect, beforeEach, vi } from "vitest"
import { useAuthStore } from "@/stores/auth.store"
import type { User } from "@/lib/api/types"

const mockUser1: User = {
  id: "u1", email: "u1@example.com", username: "user1", displayName: "User One",
  bio: "Bio 1", avatarUrl: null, role: "USER", reputation: 100, createdAt: "2024-01-01T00:00:00Z",
}

const mockUser2: User = {
  id: "u2", email: "u2@example.com", username: "user2", displayName: "User Two",
  bio: null, avatarUrl: "https://example.com/avatar.jpg", role: "MOD", reputation: 500, createdAt: "2024-01-02T00:00:00Z",
}

describe("auth store — state transitions", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false })
  })

  it("setAccess + setUser: full login flow", () => {
    useAuthStore.getState().setAccess("tok-1")
    useAuthStore.getState().setUser(mockUser1)

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.accessToken).toBe("tok-1")
    expect(state.user?.id).toBe("u1")
  })

  it("setAccess only: no user yet but authenticated", () => {
    useAuthStore.getState().setAccess("tok-1")
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().user).toBeNull()
  })

  it("setUser only: not authenticated", () => {
    useAuthStore.getState().setUser(mockUser1)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().user).not.toBeNull()
  })

  it("can update user without losing token", () => {
    useAuthStore.getState().setAccess("tok-1")
    useAuthStore.getState().setUser(mockUser1)
    useAuthStore.getState().setUser(mockUser2) // update to different user

    const state = useAuthStore.getState()
    expect(state.accessToken).toBe("tok-1")
    expect(state.user?.id).toBe("u2")
    expect(state.isAuthenticated).toBe(true)
  })

  it("can update token without losing user", () => {
    useAuthStore.getState().setUser(mockUser1)
    useAuthStore.getState().setAccess("old-tok")
    useAuthStore.getState().setAccess("new-tok") // token refresh

    const state = useAuthStore.getState()
    expect(state.accessToken).toBe("new-tok")
    expect(state.user?.id).toBe("u1")
  })

  it("clear resets to initial state", () => {
    useAuthStore.getState().setAccess("tok")
    useAuthStore.getState().setUser(mockUser1)
    useAuthStore.getState().clear()

    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it("multiple clear calls are idempotent", () => {
    useAuthStore.getState().clear()
    useAuthStore.getState().clear()
    useAuthStore.getState().clear()

    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})

describe("auth store — subscription", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false })
  })

  it("notifies subscribers on setAccess", () => {
    const cb = vi.fn()
    const unsub = useAuthStore.subscribe(cb)

    useAuthStore.getState().setAccess("tok")
    expect(cb).toHaveBeenCalled()

    unsub()
  })

  it("notifies subscribers on clear", () => {
    useAuthStore.getState().setAccess("tok")
    const cb = vi.fn()
    const unsub = useAuthStore.subscribe(cb)

    useAuthStore.getState().clear()
    expect(cb).toHaveBeenCalled()

    unsub()
  })
})
