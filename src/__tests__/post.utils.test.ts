/**
 * Post utility tests — mention parsing, content extraction, formatting.
 */
import { describe, it, expect } from "vitest"

// ── @mention extraction ───────────────────────────────────────────────────────

function extractMentions(content: string): string[] {
  const mentionRegex = /\B@(\w+)/g
  const mentions: string[] = []
  let match: RegExpExecArray | null
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1])
  }
  return [...new Set(mentions)] // deduplicate
}

describe("extractMentions", () => {
  it("extracts single mention", () => {
    expect(extractMentions("Hey @naruto what's up?")).toEqual(["naruto"])
  })

  it("extracts multiple mentions", () => {
    expect(extractMentions("@naruto and @sasuke are rivals")).toEqual(["naruto", "sasuke"])
  })

  it("deduplicates repeated mentions", () => {
    expect(extractMentions("Hey @naruto and @naruto again")).toEqual(["naruto"])
  })

  it("returns empty for no mentions", () => {
    expect(extractMentions("No mentions here")).toEqual([])
  })

  it("does not extract email addresses as mentions", () => {
    // The @ in email is not preceded by \B (word boundary)
    // Actually \B matches non-word boundaries, so user@example.com won't match
    const mentions = extractMentions("Contact user@example.com for help")
    expect(mentions).not.toContain("example")
  })

  it("extracts mention at start of post", () => {
    expect(extractMentions("@luffy is the best!")).toContain("luffy")
  })
})

// ── Post content truncation ───────────────────────────────────────────────────

function truncatePost(content: string, maxLen = 280): string {
  if (content.length <= maxLen) return content
  return content.slice(0, maxLen - 3).trimEnd() + "..."
}

describe("truncatePost", () => {
  it("returns full content when under 280 chars", () => {
    const content = "Short post"
    expect(truncatePost(content)).toBe(content)
  })

  it("truncates to 280 chars with ellipsis", () => {
    const content = "a".repeat(300)
    const truncated = truncatePost(content)
    expect(truncated.length).toBe(280)
    expect(truncated.endsWith("...")).toBe(true)
  })

  it("handles custom maxLen", () => {
    const content = "Hello World!"
    expect(truncatePost(content, 7)).toBe("Hell...")
  })

  it("does not truncate exactly at maxLen", () => {
    const content = "a".repeat(280)
    expect(truncatePost(content)).toBe(content)
  })
})

// ── Like count display ────────────────────────────────────────────────────────

function formatLikeCount(count: number): string {
  if (count === 0) return "Like"
  if (count === 1) return "1 Like"
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k Likes`
  return `${count} Likes`
}

describe("formatLikeCount", () => {
  it("shows 'Like' for 0", () => {
    expect(formatLikeCount(0)).toBe("Like")
  })

  it("shows '1 Like' (singular)", () => {
    expect(formatLikeCount(1)).toBe("1 Like")
  })

  it("shows count for 2-999", () => {
    expect(formatLikeCount(5)).toBe("5 Likes")
    expect(formatLikeCount(999)).toBe("999 Likes")
  })

  it("shows k notation for 1000+", () => {
    expect(formatLikeCount(1000)).toBe("1.0k Likes")
    expect(formatLikeCount(1500)).toBe("1.5k Likes")
  })
})

// ── Post type check ───────────────────────────────────────────────────────────

function isLongPost(content: string): boolean {
  return content.length > 280
}

describe("isLongPost", () => {
  it("returns false for short posts", () => {
    expect(isLongPost("Short")).toBe(false)
    expect(isLongPost("a".repeat(280))).toBe(false)
  })

  it("returns true for posts over 280 chars", () => {
    expect(isLongPost("a".repeat(281))).toBe(true)
    expect(isLongPost("a".repeat(5000))).toBe(true)
  })
})
