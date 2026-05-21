"use client"

import { useEffect, useState } from "react"

/**
 * Auto-updating relative timestamp.
 *
 *   const label = useLiveTime("2026-05-22T01:00:00Z")
 *   // → "just now" → "1m ago" → "2m ago" → "1h ago" → "2d ago"
 *
 * Re-renders the consuming component every 30s for fresh-looking timestamps
 * without any backend round-trip. Stops updating after 24h since labels at
 * that scale don't change meaningfully on a 30s tick.
 */
export function useLiveTime(iso: string | null | undefined): string {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!iso) return
    const age = Date.now() - new Date(iso).getTime()
    if (age > 24 * 3600_000) return // older than a day — no need to tick

    const id = setInterval(() => setTick(t => t + 1), 30_000)
    return () => clearInterval(id)
  }, [iso])

  // tick is read in the dependency for the re-render trigger
  void tick
  return iso ? formatRelative(iso) : ""
}

function formatRelative(iso: string): string {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 0)        return "just now"
  if (d < 60_000)   return "just now"
  if (d < 3600_000) return `${Math.floor(d / 60_000)}m ago`
  if (d < 86400_000) return `${Math.floor(d / 3600_000)}h ago`
  if (d < 604800_000) return `${Math.floor(d / 86400_000)}d ago`
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
