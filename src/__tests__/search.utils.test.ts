/**
 * Search utility tests — debounce logic, query validation, result mapping.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// ── Query validation ──────────────────────────────────────────────────────────

function isValidSearchQuery(q: string): boolean {
  return q.trim().length >= 2
}

describe("isValidSearchQuery", () => {
  it("accepts 2+ character queries", () => {
    expect(isValidSearchQuery("ab")).toBe(true)
    expect(isValidSearchQuery("naruto")).toBe(true)
    expect(isValidSearchQuery("one piece")).toBe(true)
  })

  it("rejects empty string", () => {
    expect(isValidSearchQuery("")).toBe(false)
  })

  it("rejects single character", () => {
    expect(isValidSearchQuery("a")).toBe(false)
    expect(isValidSearchQuery("n")).toBe(false)
  })

  it("rejects whitespace-only strings", () => {
    expect(isValidSearchQuery("  ")).toBe(false)
    expect(isValidSearchQuery(" a")).toBe(false) // 1 non-space char after trim
  })

  it("accepts exactly 2 non-space characters", () => {
    expect(isValidSearchQuery("ab")).toBe(true)
    expect(isValidSearchQuery(" ab ")).toBe(true) // trims to "ab"
  })
})

// ── Search result ranking ─────────────────────────────────────────────────────

type SearchAnime = { title: string; score: number | null; rank: number }

function sortSearchResults(results: SearchAnime[], query: string): SearchAnime[] {
  const lq = query.toLowerCase()
  return [...results].sort((a, b) => {
    // Exact title matches first
    const aExact = a.title.toLowerCase() === lq ? 1 : 0
    const bExact = b.title.toLowerCase() === lq ? 1 : 0
    if (aExact !== bExact) return bExact - aExact
    // Then by score
    return (b.score ?? 0) - (a.score ?? 0)
  })
}

describe("sortSearchResults", () => {
  const results: SearchAnime[] = [
    { title: "Naruto",          score: 7.9, rank: 100 },
    { title: "Naruto Shippuden", score: 8.2, rank: 50 },
    { title: "Boruto",          score: 5.5, rank: 200 },
  ]

  it("puts exact match first", () => {
    const sorted = sortSearchResults(results, "naruto")
    expect(sorted[0].title).toBe("Naruto")
  })

  it("sorts by score within non-exact matches", () => {
    const sorted = sortSearchResults(results, "anime")
    // All are non-exact — should be sorted by score
    expect(sorted[0].score).toBeGreaterThanOrEqual(sorted[1].score ?? 0)
  })

  it("handles null scores (treated as 0)", () => {
    const withNull: SearchAnime[] = [
      { title: "A", score: null, rank: 1 },
      { title: "B", score: 8.0, rank: 2 },
    ]
    const sorted = sortSearchResults(withNull, "x")
    expect(sorted[0].title).toBe("B") // higher score first
  })
})

// ── Debounce logic ─────────────────────────────────────────────────────────────

function debounce<T extends unknown[]>(fn: (...args: T) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: T) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

describe("debounce", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("delays execution", () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledOnce()
  })

  it("only calls once for rapid invocations", () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    debounced()
    debounced()
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledOnce()
  })

  it("passes arguments correctly", () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced("search query", 1, 2)
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledWith("search query", 1, 2)
  })

  it("resets timer on each call", () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    vi.advanceTimersByTime(200)
    debounced() // reset timer
    vi.advanceTimersByTime(200)

    expect(fn).not.toHaveBeenCalled() // still waiting

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledOnce()
  })
})
