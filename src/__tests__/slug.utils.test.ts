/**
 * Slug and URL utility tests.
 */
import { describe, it, expect } from "vitest"

// ── Slug generation ───────────────────────────────────────────────────────────

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

describe("toSlug", () => {
  it("converts title to lowercase slug", () => {
    expect(toSlug("My Amazing Blog Post")).toBe("my-amazing-blog-post")
  })

  it("replaces spaces with hyphens", () => {
    expect(toSlug("one piece")).toBe("one-piece")
  })

  it("removes special characters", () => {
    expect(toSlug("Attack on Titan! (2013)")).toBe("attack-on-titan-2013")
  })

  it("collapses multiple hyphens", () => {
    expect(toSlug("test  --  multiple")).toBe("test-multiple")
  })

  it("trims leading/trailing hyphens", () => {
    expect(toSlug("!anime!")).toBe("anime")
  })

  it("handles Japanese title (strips non-ASCII)", () => {
    expect(toSlug("ワンピース")).toBe("")  // all non-ASCII stripped
  })

  it("preserves numbers", () => {
    expect(toSlug("Season 2 Episode 24")).toBe("season-2-episode-24")
  })

  it("handles empty string", () => {
    expect(toSlug("")).toBe("")
  })

  it("handles already-hyphenated slug", () => {
    expect(toSlug("attack-on-titan")).toBe("attack-on-titan")
  })
})

// ── Username validation ───────────────────────────────────────────────────────

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(username)
}

describe("isValidUsername", () => {
  it("accepts valid username", () => {
    expect(isValidUsername("naruto_uzumaki")).toBe(true)
    expect(isValidUsername("User123")).toBe(true)
    expect(isValidUsername("abc")).toBe(true)
  })

  it("rejects username with special chars", () => {
    expect(isValidUsername("user-name")).toBe(false)
    expect(isValidUsername("user.name")).toBe(false)
    expect(isValidUsername("user@name")).toBe(false)
  })

  it("rejects too short usernames", () => {
    expect(isValidUsername("ab")).toBe(false)
    expect(isValidUsername("a")).toBe(false)
    expect(isValidUsername("")).toBe(false)
  })

  it("rejects too long usernames", () => {
    expect(isValidUsername("a".repeat(31))).toBe(false)
  })

  it("accepts exactly 3 and 30 char usernames", () => {
    expect(isValidUsername("abc")).toBe(true)
    expect(isValidUsername("a".repeat(30))).toBe(true)
  })
})

// ── URL sanitization ──────────────────────────────────────────────────────────

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === "https:" || parsed.protocol === "http:"
  } catch {
    return false
  }
}

describe("isValidHttpUrl", () => {
  it("accepts https URLs", () => {
    expect(isValidHttpUrl("https://example.com/image.jpg")).toBe(true)
    expect(isValidHttpUrl("https://cdn.myanimelist.net/img.jpg")).toBe(true)
  })

  it("accepts http URLs", () => {
    expect(isValidHttpUrl("http://localhost:3000")).toBe(true)
  })

  it("rejects relative paths", () => {
    expect(isValidHttpUrl("/relative/path")).toBe(false)
  })

  it("rejects non-URL strings", () => {
    expect(isValidHttpUrl("not a url")).toBe(false)
    expect(isValidHttpUrl("")).toBe(false)
  })

  it("rejects javascript protocol", () => {
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false)
  })
})
