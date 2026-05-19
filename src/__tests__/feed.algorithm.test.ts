/**
 * Feed algorithm tests — post sorting, filtering, pagination logic.
 */
import { describe, it, expect } from "vitest"

// ── Feed post type ────────────────────────────────────────────────────────────

interface FeedPost {
  id: string
  authorId: string
  content: string
  createdAt: string
  likes: number
  comments: number
}

// ── Cursor pagination ─────────────────────────────────────────────────────────

function paginateCursor(
  posts: FeedPost[],
  cursor?: string,
  limit = 20
): { data: FeedPost[]; nextCursor: string | null } {
  // Sorted by createdAt DESC
  const sorted = [...posts].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const startIdx = cursor
    ? sorted.findIndex(p => p.createdAt === cursor) + 1
    : 0

  const page = sorted.slice(startIdx, startIdx + limit)
  const hasMore = startIdx + limit < sorted.length
  const nextCursor = hasMore ? page[page.length - 1]?.createdAt ?? null : null

  return { data: page, nextCursor }
}

function makePost(id: string, dateOffset: number, likes = 0): FeedPost {
  const date = new Date(Date.now() - dateOffset * 1000).toISOString()
  return { id, authorId: "u1", content: `Post ${id}`, createdAt: date, likes, comments: 0 }
}

describe("cursor pagination", () => {
  const posts = [
    makePost("p1", 100),  // oldest
    makePost("p2", 50),
    makePost("p3", 10),   // newest
  ]

  it("returns most recent posts first", () => {
    const { data } = paginateCursor(posts)
    expect(data[0].id).toBe("p3")
    expect(data[data.length - 1].id).toBe("p1")
  })

  it("returns null nextCursor when all posts fit in one page", () => {
    const { nextCursor } = paginateCursor(posts, undefined, 20)
    expect(nextCursor).toBeNull()
  })

  it("returns nextCursor when more posts exist", () => {
    const { nextCursor, data } = paginateCursor(posts, undefined, 1)
    expect(nextCursor).toBe(data[0].createdAt)
  })

  it("starts from cursor position", () => {
    const { data: page1 } = paginateCursor(posts, undefined, 1)
    const cursor = page1[0].createdAt
    const { data: page2 } = paginateCursor(posts, cursor, 1)
    expect(page2[0].id).not.toBe(page1[0].id)
  })
})

// ── Feed deduplication ────────────────────────────────────────────────────────

function deduplicatePosts(posts: FeedPost[]): FeedPost[] {
  const seen = new Set<string>()
  return posts.filter(p => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
}

describe("deduplicatePosts", () => {
  it("removes duplicate post IDs", () => {
    const posts = [
      makePost("p1", 0),
      makePost("p2", 1),
      makePost("p1", 2), // duplicate
    ]
    expect(deduplicatePosts(posts)).toHaveLength(2)
  })

  it("preserves order of first occurrence", () => {
    const posts = [makePost("p1", 0), makePost("p2", 1), makePost("p1", 2)]
    const deduped = deduplicatePosts(posts)
    expect(deduped[0].id).toBe("p1")
    expect(deduped[1].id).toBe("p2")
  })

  it("returns empty for empty input", () => {
    expect(deduplicatePosts([])).toHaveLength(0)
  })

  it("handles all unique posts", () => {
    const posts = [makePost("p1", 0), makePost("p2", 1), makePost("p3", 2)]
    expect(deduplicatePosts(posts)).toHaveLength(3)
  })
})

// ── Content filtering ─────────────────────────────────────────────────────────

function filterByAuthor(posts: FeedPost[], authorId: string): FeedPost[] {
  return posts.filter(p => p.authorId === authorId)
}

describe("filterByAuthor", () => {
  const posts = [
    { ...makePost("p1", 0), authorId: "u1" },
    { ...makePost("p2", 1), authorId: "u2" },
    { ...makePost("p3", 2), authorId: "u1" },
  ]

  it("returns only posts by specified author", () => {
    const filtered = filterByAuthor(posts, "u1")
    expect(filtered).toHaveLength(2)
    expect(filtered.every(p => p.authorId === "u1")).toBe(true)
  })

  it("returns empty for unknown author", () => {
    expect(filterByAuthor(posts, "unknown")).toHaveLength(0)
  })
})
