/**
 * Status utility tests — watch status labels, colors, icons.
 */
import { describe, it, expect } from "vitest"
import type { WatchStatus } from "@/lib/api/types"

// ── Watch status display label ────────────────────────────────────────────────

function getStatusLabel(status: WatchStatus): string {
  const labels: Record<WatchStatus, string> = {
    PLAN_TO_WATCH: "Plan to Watch",
    WATCHING:      "Watching",
    COMPLETED:     "Completed",
    ON_HOLD:       "On Hold",
    DROPPED:       "Dropped",
  }
  return labels[status]
}

describe("getStatusLabel", () => {
  it("returns human-readable label for PLAN_TO_WATCH", () => {
    expect(getStatusLabel("PLAN_TO_WATCH")).toBe("Plan to Watch")
  })

  it("returns human-readable label for WATCHING", () => {
    expect(getStatusLabel("WATCHING")).toBe("Watching")
  })

  it("returns human-readable label for COMPLETED", () => {
    expect(getStatusLabel("COMPLETED")).toBe("Completed")
  })

  it("returns human-readable label for ON_HOLD", () => {
    expect(getStatusLabel("ON_HOLD")).toBe("On Hold")
  })

  it("returns human-readable label for DROPPED", () => {
    expect(getStatusLabel("DROPPED")).toBe("Dropped")
  })

  it("all statuses have labels", () => {
    const statuses: WatchStatus[] = ["PLAN_TO_WATCH", "WATCHING", "COMPLETED", "ON_HOLD", "DROPPED"]
    for (const status of statuses) {
      expect(getStatusLabel(status).length).toBeGreaterThan(0)
    }
  })
})

// ── Watch status color ────────────────────────────────────────────────────────

function getStatusColor(status: WatchStatus): string {
  const colors: Record<WatchStatus, string> = {
    PLAN_TO_WATCH: "text-blue-400",
    WATCHING:      "text-green-400",
    COMPLETED:     "text-emerald-400",
    ON_HOLD:       "text-yellow-400",
    DROPPED:       "text-red-400",
  }
  return colors[status]
}

describe("getStatusColor", () => {
  it("returns different colors for each status", () => {
    const statuses: WatchStatus[] = ["PLAN_TO_WATCH", "WATCHING", "COMPLETED", "ON_HOLD", "DROPPED"]
    const colors = statuses.map(getStatusColor)
    const uniqueColors = new Set(colors)
    expect(uniqueColors.size).toBe(colors.length)
  })

  it("Watching has green color", () => {
    expect(getStatusColor("WATCHING")).toContain("green")
  })

  it("Dropped has red color", () => {
    expect(getStatusColor("DROPPED")).toContain("red")
  })

  it("Completed has emerald color", () => {
    expect(getStatusColor("COMPLETED")).toContain("emerald")
  })
})

// ── Watch status ordering ─────────────────────────────────────────────────────

function getStatusOrder(status: WatchStatus): number {
  const order: Record<WatchStatus, number> = {
    WATCHING:      1,
    PLAN_TO_WATCH: 2,
    ON_HOLD:       3,
    DROPPED:       4,
    COMPLETED:     5,
  }
  return order[status]
}

describe("getStatusOrder (for list sorting)", () => {
  it("WATCHING comes first", () => {
    expect(getStatusOrder("WATCHING")).toBe(1)
  })

  it("COMPLETED comes last", () => {
    expect(getStatusOrder("COMPLETED")).toBe(5)
  })

  it("all statuses have unique orders", () => {
    const statuses: WatchStatus[] = ["PLAN_TO_WATCH", "WATCHING", "COMPLETED", "ON_HOLD", "DROPPED"]
    const orders = statuses.map(getStatusOrder)
    expect(new Set(orders).size).toBe(orders.length)
  })

  it("sorts correctly", () => {
    const statuses: WatchStatus[] = ["COMPLETED", "DROPPED", "WATCHING", "ON_HOLD", "PLAN_TO_WATCH"]
    const sorted = [...statuses].sort((a, b) => getStatusOrder(a) - getStatusOrder(b))
    expect(sorted[0]).toBe("WATCHING")
    expect(sorted[sorted.length - 1]).toBe("COMPLETED")
  })
})
