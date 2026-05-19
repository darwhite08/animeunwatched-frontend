/**
 * Blog utility tests — reading time, categorization, SEO.
 */
import { describe, it, expect } from "vitest"

// ── Reading time ──────────────────────────────────────────────────────────────

function calcReadingTime(text: string, wpm = 200): number {
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length
  return Math.max(1, Math.ceil(wordCount / wpm))
}

describe("calcReadingTime", () => {
  it("returns 1 for very short text", () => {
    expect(calcReadingTime("Short text")).toBe(1)
    expect(calcReadingTime("")).toBe(1)
  })

  it("calculates correctly for 200 words (exactly 1 min)", () => {
    const text = "word ".repeat(200).trim()
    expect(calcReadingTime(text)).toBe(1)
  })

  it("calculates correctly for 201 words (2 min)", () => {
    const text = "word ".repeat(201).trim()
    expect(calcReadingTime(text)).toBe(2)
  })

  it("handles custom wpm", () => {
    const text = "word ".repeat(400).trim()
    expect(calcReadingTime(text, 400)).toBe(1) // 400 words / 400 wpm = 1 min
    expect(calcReadingTime(text, 100)).toBe(4) // 400 words / 100 wpm = 4 min
  })

  it("handles text with multiple spaces", () => {
    const text = "one  two   three" // multiple spaces
    expect(calcReadingTime(text)).toBe(1) // 3 words
  })
})

// ── Blog status display ───────────────────────────────────────────────────────

type BlogStatus = "DRAFT" | "PUBLISHED"

function getBlogStatusBadge(status: BlogStatus): { label: string; color: string } {
  return status === "PUBLISHED"
    ? { label: "Published", color: "text-green-400" }
    : { label: "Draft", color: "text-yellow-400" }
}

describe("getBlogStatusBadge", () => {
  it("returns Published badge for PUBLISHED status", () => {
    const badge = getBlogStatusBadge("PUBLISHED")
    expect(badge.label).toBe("Published")
    expect(badge.color).toContain("green")
  })

  it("returns Draft badge for DRAFT status", () => {
    const badge = getBlogStatusBadge("DRAFT")
    expect(badge.label).toBe("Draft")
    expect(badge.color).toContain("yellow")
  })
})

// ── Blog slug uniqueness ──────────────────────────────────────────────────────

function generateBlogSlug(title: string, suffix?: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
  return suffix ? `${base}-${suffix}` : base
}

describe("generateBlogSlug", () => {
  it("generates slug from title", () => {
    expect(generateBlogSlug("My Amazing Blog Post")).toBe("my-amazing-blog-post")
  })

  it("handles numbers in title", () => {
    expect(generateBlogSlug("Top 10 Anime of 2024")).toBe("top-10-anime-of-2024")
  })

  it("removes special characters", () => {
    expect(generateBlogSlug("Anime: A Deep Dive!")).toBe("anime-a-deep-dive")
  })

  it("appends suffix for uniqueness", () => {
    const slug = generateBlogSlug("My Blog", "abc123")
    expect(slug).toBe("my-blog-abc123")
  })

  it("caps at 50 chars", () => {
    const long = "a".repeat(100) + " title"
    expect(generateBlogSlug(long).length).toBeLessThanOrEqual(50)
  })
})

// ── Blog word count ───────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

describe("countWords", () => {
  it("returns 0 for empty string", () => {
    expect(countWords("")).toBe(0)
    expect(countWords("   ")).toBe(0)
  })

  it("counts single word", () => {
    expect(countWords("hello")).toBe(1)
  })

  it("counts multiple words", () => {
    expect(countWords("one two three four five")).toBe(5)
  })

  it("handles multiple spaces between words", () => {
    expect(countWords("one  two   three")).toBe(3)
  })

  it("handles newlines", () => {
    expect(countWords("one\ntwo\nthree")).toBe(3)
  })
})
