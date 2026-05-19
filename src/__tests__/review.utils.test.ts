/**
 * Review utility tests — score display, sorting, body preview.
 */
import { describe, it, expect } from "vitest"

// ── Review score display ──────────────────────────────────────────────────────

function reviewScoreLabel(score: number): string {
  if (score === 10) return "Masterpiece"
  if (score >= 9) return "Excellent"
  if (score >= 8) return "Very Good"
  if (score >= 7) return "Good"
  if (score >= 6) return "Fine"
  if (score >= 5) return "Average"
  if (score >= 4) return "Bad"
  if (score >= 3) return "Very Bad"
  if (score >= 2) return "Horrible"
  return "Appalling"
}

describe("reviewScoreLabel", () => {
  it("returns Masterpiece for 10", () => {
    expect(reviewScoreLabel(10)).toBe("Masterpiece")
  })

  it("returns Excellent for 9", () => {
    expect(reviewScoreLabel(9)).toBe("Excellent")
  })

  it("returns Very Good for 8", () => {
    expect(reviewScoreLabel(8)).toBe("Very Good")
  })

  it("returns Good for 7", () => {
    expect(reviewScoreLabel(7)).toBe("Good")
  })

  it("returns Fine for 6", () => {
    expect(reviewScoreLabel(6)).toBe("Fine")
  })

  it("returns Average for 5", () => {
    expect(reviewScoreLabel(5)).toBe("Average")
  })

  it("returns Bad for 4", () => {
    expect(reviewScoreLabel(4)).toBe("Bad")
  })

  it("returns Appalling for 1", () => {
    expect(reviewScoreLabel(1)).toBe("Appalling")
  })
})

// ── Review body preview ───────────────────────────────────────────────────────

function getReviewPreview(body: string, maxLen = 200): string {
  if (body.length <= maxLen) return body
  return body.slice(0, maxLen).trimEnd() + "..."
}

describe("getReviewPreview", () => {
  it("returns full body when short", () => {
    const body = "This anime is great!"
    expect(getReviewPreview(body)).toBe(body)
  })

  it("truncates long body with ellipsis", () => {
    const body = "a".repeat(300)
    const preview = getReviewPreview(body, 200)
    expect(preview.length).toBe(203) // 200 + "..."
    expect(preview.endsWith("...")).toBe(true)
  })

  it("handles custom maxLen", () => {
    const body = "Hello World!"
    expect(getReviewPreview(body, 5)).toBe("Hello...")
  })
})

// ── Review sorting ────────────────────────────────────────────────────────────

interface Review { id: string; score: number; likes: number; createdAt: string }

function sortReviews(reviews: Review[], sort: "helpful" | "recent" | "highest" | "lowest"): Review[] {
  return [...reviews].sort((a, b) => {
    switch (sort) {
      case "helpful": return b.likes - a.likes
      case "recent":  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "highest": return b.score - a.score
      case "lowest":  return a.score - b.score
    }
  })
}

const reviews: Review[] = [
  { id: "r1", score: 6, likes: 5,  createdAt: "2024-01-01T00:00:00Z" },
  { id: "r2", score: 9, likes: 50, createdAt: "2024-06-01T00:00:00Z" },
  { id: "r3", score: 7, likes: 20, createdAt: "2024-03-01T00:00:00Z" },
]

describe("sortReviews", () => {
  it("sorts by likes descending for helpful", () => {
    const sorted = sortReviews(reviews, "helpful")
    expect(sorted[0].id).toBe("r2") // 50 likes
    expect(sorted[2].id).toBe("r1") // 5 likes
  })

  it("sorts by date descending for recent", () => {
    const sorted = sortReviews(reviews, "recent")
    expect(sorted[0].id).toBe("r2") // June
    expect(sorted[2].id).toBe("r1") // January
  })

  it("sorts by score descending for highest", () => {
    const sorted = sortReviews(reviews, "highest")
    expect(sorted[0].id).toBe("r2") // score 9
    expect(sorted[2].id).toBe("r1") // score 6
  })

  it("sorts by score ascending for lowest", () => {
    const sorted = sortReviews(reviews, "lowest")
    expect(sorted[0].id).toBe("r1") // score 6
    expect(sorted[2].id).toBe("r2") // score 9
  })
})
