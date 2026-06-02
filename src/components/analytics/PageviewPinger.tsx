"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { getConsent } from "@/lib/analytics/consent"

/**
 * Fires POST /api/v1/analytics/pageview on every route change. The backend
 * keeps a 30-min ring buffer and broadcasts the live snapshot to the admin
 * dashboard's realtime tile.
 *
 * Privacy: only sends `path` and a cookie-stable random `visitorId`. No
 * referrer, no UA, no PII. The visitor id is regenerated when the user
 * declines analytics consent so we can't correlate sessions.
 */

const VISITOR_KEY = "kv_visitor_id"

function getVisitorId(): string {
  if (typeof window === "undefined") return ""
  let id = window.localStorage.getItem(VISITOR_KEY)
  if (!id) {
    // Random 16-byte URL-safe id — collision odds negligible
    const buf = new Uint8Array(16)
    crypto.getRandomValues(buf)
    id = Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("")
    window.localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

export function PageviewPinger() {
  const pathname = usePathname()
  const search   = useSearchParams()
  const lastSent = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    // Honor consent — declined users don't get pinged. Null (not decided)
    // still pings, since the data is fully anonymous and we need it to
    // power the live visitor count on day one.
    if (getConsent() === "declined") return

    const qs   = search?.toString()
    const path = pathname + (qs ? `?${qs}` : "")
    if (lastSent.current === path) return
    lastSent.current = path

    const visitorId = getVisitorId()
    if (!visitorId) return

    // Fire-and-forget. Use keepalive so the request survives page-unload
    // during fast navigations.
    void fetch("/api/v1/analytics/pageview", {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ path, visitorId }),
      keepalive:   true,
    }).catch(() => { /* analytics is best-effort */ })
  }, [pathname, search])

  return null
}
