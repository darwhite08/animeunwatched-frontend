/**
 * Additional endpoint tests — covers more endpoints that were not in the original suite.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"

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

describe("leaderboard endpoint", () => {
  beforeEach(() => vi.clearAllMocks())

  it("builds correct leaderboard URL", async () => {
    const { api } = await import("@/lib/api/client")
    const { getLeaderboard } = await import("@/lib/api/endpoints")

    await getLeaderboard(50, "all-time")
    expect(api).toHaveBeenCalledWith(expect.stringContaining("leaderboard/top"))
    expect(api).toHaveBeenCalledWith(expect.stringContaining("limit=50"))
    expect(api).toHaveBeenCalledWith(expect.stringContaining("period=all-time"))
  })
})

describe("notification endpoints", () => {
  beforeEach(() => vi.clearAllMocks())

  it("listNotifications uses correct path", async () => {
    const { api } = await import("@/lib/api/client")
    const { listNotifications } = await import("@/lib/api/endpoints")

    await listNotifications(2)
    expect(api).toHaveBeenCalledWith("/notifications?page=2")
  })

  it("getUnreadCount calls correct path", async () => {
    const { api } = await import("@/lib/api/client")
    const { getUnreadCount } = await import("@/lib/api/endpoints")

    await getUnreadCount()
    expect(api).toHaveBeenCalledWith("/notifications/unread-count")
  })

  it("markAllRead uses PATCH", async () => {
    const { api } = await import("@/lib/api/client")
    const { markAllRead } = await import("@/lib/api/endpoints")

    await markAllRead()
    expect(api).toHaveBeenCalledWith("/notifications/read-all", expect.objectContaining({ method: "PATCH" }))
  })
})

describe("seasonal anime endpoint", () => {
  beforeEach(() => vi.clearAllMocks())

  it("builds correct URL with year and season", async () => {
    const { api } = await import("@/lib/api/client")
    const { getSeasonal } = await import("@/lib/api/endpoints")

    await getSeasonal(2024, "winter")
    expect(api).toHaveBeenCalledWith("/anime/season/2024/winter")
  })
})

describe("post comment endpoints", () => {
  beforeEach(() => vi.clearAllMocks())

  it("getComments fetches comments for a post", async () => {
    const { api } = await import("@/lib/api/client")
    const { getComments } = await import("@/lib/api/endpoints")

    await getComments("post-1")
    expect(api).toHaveBeenCalledWith(expect.stringContaining("/posts/post-1/comments"))
  })

  it("createComment posts to correct endpoint", async () => {
    const { api } = await import("@/lib/api/client")
    const { createComment } = await import("@/lib/api/endpoints")

    await createComment("post-1", "My comment")
    expect(api).toHaveBeenCalledWith(
      "/posts/post-1/comments",
      expect.objectContaining({ method: "POST" })
    )
  })
})

describe("user follow/unfollow endpoints", () => {
  beforeEach(() => vi.clearAllMocks())

  it("getFollowers builds correct URL", async () => {
    const { api } = await import("@/lib/api/client")
    const { getFollowers } = await import("@/lib/api/endpoints")

    await getFollowers("testuser", 1)
    expect(api).toHaveBeenCalledWith("/users/testuser/followers?page=1")
  })

  it("getFollowing builds correct URL", async () => {
    const { api } = await import("@/lib/api/client")
    const { getFollowing } = await import("@/lib/api/endpoints")

    await getFollowing("testuser", 2)
    expect(api).toHaveBeenCalledWith("/users/testuser/following?page=2")
  })

  it("removeListEntry uses DELETE method", async () => {
    const { api } = await import("@/lib/api/client")
    const { removeListEntry } = await import("@/lib/api/endpoints")

    await removeListEntry("anime-123")
    expect(api).toHaveBeenCalledWith("/lists/me/anime-123", expect.objectContaining({ method: "DELETE" }))
  })
})
