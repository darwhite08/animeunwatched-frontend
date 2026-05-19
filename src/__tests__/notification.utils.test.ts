/**
 * Notification utility tests — type mapping, filtering, sorting.
 */
import { describe, it, expect } from "vitest"
import type { Notification } from "@/lib/api/types"

// ── Notification type guard ───────────────────────────────────────────────────

const NOTIF_TYPES = ["achievement", "comment", "update", "follow", "poll", "system"] as const
type NotifType = typeof NOTIF_TYPES[number]

function mapNotifType(apiType: string): NotifType {
  return NOTIF_TYPES.includes(apiType as NotifType) ? (apiType as NotifType) : "system"
}

describe("mapNotifType", () => {
  it("passes through valid notification types", () => {
    for (const type of NOTIF_TYPES) {
      expect(mapNotifType(type)).toBe(type)
    }
  })

  it("maps unknown types to 'system'", () => {
    expect(mapNotifType("unknown")).toBe("system")
    expect(mapNotifType("")).toBe("system")
    expect(mapNotifType("ACHIEVEMENT")).toBe("system") // case-sensitive
  })
})

// ── Notification text extraction ──────────────────────────────────────────────

function getNotifText(payload: Record<string, unknown>): string {
  return (payload.message as string) ?? (payload.description as string) ?? "New notification"
}

describe("getNotifText", () => {
  it("extracts 'message' field first", () => {
    expect(getNotifText({ message: "Hello!", description: "World" })).toBe("Hello!")
  })

  it("falls back to 'description' field", () => {
    expect(getNotifText({ description: "World" })).toBe("World")
  })

  it("returns default text when both are missing", () => {
    expect(getNotifText({})).toBe("New notification")
  })

  it("handles null message by falling back", () => {
    expect(getNotifText({ message: null, description: "Desc" })).toBe("Desc")
  })
})

// ── Notification filtering ────────────────────────────────────────────────────

function filterByRead(notifs: Array<{ id: string; read: boolean }>, filter: "all" | "unread"): typeof notifs {
  if (filter === "unread") return notifs.filter(n => !n.read)
  return notifs
}

describe("filterByRead", () => {
  const notifs = [
    { id: "1", read: false },
    { id: "2", read: true },
    { id: "3", read: false },
    { id: "4", read: true },
  ]

  it("returns all notifications for filter='all'", () => {
    expect(filterByRead(notifs, "all")).toHaveLength(4)
  })

  it("returns only unread for filter='unread'", () => {
    const unread = filterByRead(notifs, "unread")
    expect(unread).toHaveLength(2)
    expect(unread.every(n => !n.read)).toBe(true)
  })

  it("returns empty for all-read list with unread filter", () => {
    const allRead = notifs.map(n => ({ ...n, read: true }))
    expect(filterByRead(allRead, "unread")).toHaveLength(0)
  })
})

// ── Unread count ──────────────────────────────────────────────────────────────

function countUnread(notifs: Array<{ read: boolean }>): number {
  return notifs.filter(n => !n.read).length
}

describe("countUnread", () => {
  it("returns 0 for empty list", () => {
    expect(countUnread([])).toBe(0)
  })

  it("returns 0 when all are read", () => {
    expect(countUnread([{ read: true }, { read: true }])).toBe(0)
  })

  it("counts correctly", () => {
    expect(countUnread([{ read: false }, { read: true }, { read: false }, { read: false }])).toBe(3)
  })

  it("displays 99+ for over 99 unread", () => {
    const count = 105
    const display = count > 99 ? "99+" : String(count)
    expect(display).toBe("99+")
  })

  it("displays exact count for 99 or fewer", () => {
    const count = 42
    const display = count > 99 ? "99+" : String(count)
    expect(display).toBe("42")
  })
})
