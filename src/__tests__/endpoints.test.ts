/**
 * API endpoints function signatures tests — verifies endpoint functions exist
 * and have correct call signatures. Does NOT make real HTTP calls.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the api client so no real network calls happen
vi.mock("@/lib/api/client", () => ({
  api: vi.fn().mockResolvedValue({}),
  ApiError: class ApiError extends Error {
    name = "ApiError" as const
    constructor(public status: number, public code: string, message: string) {
      super(message)
    }
  }
}))

describe("API endpoints", () => {
  beforeEach(() => vi.clearAllMocks())

  it("register calls api with correct path and method", async () => {
    const { api } = await import("@/lib/api/client")
    const { register } = await import("@/lib/api/endpoints")

    await register({ email: "a@b.com", username: "user", displayName: "User", password: "pass" })

    expect(api).toHaveBeenCalledWith(
      "/auth/register",
      expect.objectContaining({ method: "POST" })
    )
  })

  it("login calls api with correct path", async () => {
    const { api } = await import("@/lib/api/client")
    const { login } = await import("@/lib/api/endpoints")

    await login({ email: "a@b.com", password: "pass" })

    expect(api).toHaveBeenCalledWith(
      "/auth/login",
      expect.objectContaining({ method: "POST" })
    )
  })

  it("logout calls api with correct path", async () => {
    const { api } = await import("@/lib/api/client")
    const { logout } = await import("@/lib/api/endpoints")

    await logout()
    expect(api).toHaveBeenCalledWith("/auth/logout", expect.objectContaining({ method: "POST" }))
  })

  it("getAnime builds correct URL", async () => {
    const { api } = await import("@/lib/api/client")
    const { getAnime } = await import("@/lib/api/endpoints")

    await getAnime(21)
    expect(api).toHaveBeenCalledWith("/anime/21")
  })

  it("upsertListEntry builds correct URL", async () => {
    const { api } = await import("@/lib/api/client")
    const { upsertListEntry } = await import("@/lib/api/endpoints")

    await upsertListEntry("anime-123", { status: "WATCHING" })
    expect(api).toHaveBeenCalledWith(
      "/lists/me/anime-123",
      expect.objectContaining({ method: "PUT" })
    )
  })

  it("getList builds correct URL with optional status", async () => {
    const { api } = await import("@/lib/api/client")
    const { getList } = await import("@/lib/api/endpoints")

    await getList("myuser", "WATCHING")
    expect(api).toHaveBeenCalledWith("/lists/myuser?status=WATCHING")
  })

  it("getList builds URL without status when not provided", async () => {
    const { api } = await import("@/lib/api/client")
    const { getList } = await import("@/lib/api/endpoints")

    await getList("myuser")
    expect(api).toHaveBeenCalledWith("/lists/myuser")
  })

  it("markRead calls correct path", async () => {
    const { api } = await import("@/lib/api/client")
    const { markRead } = await import("@/lib/api/endpoints")

    await markRead("notif-id-123")
    expect(api).toHaveBeenCalledWith(
      "/notifications/notif-id-123/read",
      expect.objectContaining({ method: "PATCH" })
    )
  })

  it("follow uses POST method", async () => {
    const { api } = await import("@/lib/api/client")
    const { follow } = await import("@/lib/api/endpoints")

    await follow("someuser")
    expect(api).toHaveBeenCalledWith("/users/someuser/follow", expect.objectContaining({ method: "POST" }))
  })

  it("unfollow uses DELETE method", async () => {
    const { api } = await import("@/lib/api/client")
    const { unfollow } = await import("@/lib/api/endpoints")

    await unfollow("someuser")
    expect(api).toHaveBeenCalledWith("/users/someuser/follow", expect.objectContaining({ method: "DELETE" }))
  })

  it("search encodes query parameter", async () => {
    const { api } = await import("@/lib/api/client")
    const { search } = await import("@/lib/api/endpoints")

    await search("attack on titan", "anime", 1)
    expect(api).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("attack on titan"))
    )
  })
})
