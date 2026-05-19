/**
 * Pagination utility tests.
 * Tests the math used in frontend pagination displays.
 */
import { describe, it, expect } from "vitest"

// ── Pagination page range calculation ─────────────────────────────────────────

function getPageRange(currentPage: number, totalPages: number, windowSize = 5): number[] {
  const half = Math.floor(windowSize / 2)
  let start = Math.max(1, currentPage - half)
  const end = Math.min(totalPages, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

describe("getPageRange", () => {
  it("returns pages 1-5 for page 1 of 10", () => {
    expect(getPageRange(1, 10)).toEqual([1, 2, 3, 4, 5])
  })

  it("returns pages 1-5 for page 3 of 10 (5-window)", () => {
    expect(getPageRange(3, 10)).toEqual([1, 2, 3, 4, 5])
  })

  it("returns pages 6-10 for page 10 of 10", () => {
    expect(getPageRange(10, 10)).toEqual([6, 7, 8, 9, 10])
  })

  it("returns centered range for middle page", () => {
    expect(getPageRange(5, 10)).toEqual([3, 4, 5, 6, 7])
  })

  it("returns all pages when total < windowSize", () => {
    expect(getPageRange(1, 3)).toEqual([1, 2, 3])
  })

  it("returns single page when totalPages is 1", () => {
    expect(getPageRange(1, 1)).toEqual([1])
  })
})

// ── hasNextPage helper ────────────────────────────────────────────────────────

function hasNextPage(page: number, totalPages: number): boolean {
  return page < totalPages
}

function hasPrevPage(page: number): boolean {
  return page > 1
}

describe("pagination navigation helpers", () => {
  it("hasNextPage is true when not on last page", () => {
    expect(hasNextPage(1, 5)).toBe(true)
    expect(hasNextPage(4, 5)).toBe(true)
  })

  it("hasNextPage is false on last page", () => {
    expect(hasNextPage(5, 5)).toBe(false)
  })

  it("hasPrevPage is true when not on first page", () => {
    expect(hasPrevPage(2)).toBe(true)
    expect(hasPrevPage(5)).toBe(true)
  })

  it("hasPrevPage is false on first page", () => {
    expect(hasPrevPage(1)).toBe(false)
  })
})

// ── Total pages calculation ───────────────────────────────────────────────────

function totalPages(total: number, limit: number): number {
  return Math.ceil(total / limit)
}

describe("totalPages calculation", () => {
  it("calculates correct page count for even division", () => {
    expect(totalPages(100, 20)).toBe(5)
  })

  it("rounds up for incomplete last page", () => {
    expect(totalPages(101, 20)).toBe(6)
  })

  it("returns 0 for 0 total items", () => {
    expect(totalPages(0, 20)).toBe(0)
  })

  it("returns 1 for 1 item", () => {
    expect(totalPages(1, 20)).toBe(1)
  })

  it("returns 1 for exactly limit items", () => {
    expect(totalPages(20, 20)).toBe(1)
  })

  it("handles limit of 1", () => {
    expect(totalPages(5, 1)).toBe(5)
  })
})

// ── First and last item of page ───────────────────────────────────────────────

function getPageItemRange(page: number, limit: number, total: number): { from: number; to: number } {
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  return { from, to }
}

describe("getPageItemRange", () => {
  it("returns 1-20 for first page with 20 limit", () => {
    expect(getPageItemRange(1, 20, 100)).toEqual({ from: 1, to: 20 })
  })

  it("returns 21-40 for second page with 20 limit", () => {
    expect(getPageItemRange(2, 20, 100)).toEqual({ from: 21, to: 40 })
  })

  it("caps to on last page", () => {
    expect(getPageItemRange(5, 20, 95)).toEqual({ from: 81, to: 95 })
  })

  it("handles single item", () => {
    expect(getPageItemRange(1, 20, 1)).toEqual({ from: 1, to: 1 })
  })
})
