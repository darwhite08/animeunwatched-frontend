"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

/**
 * Google AdSense in-content display unit (pub `ca-pub-7026816666510256`,
 * slot `6985178925`). The loader script (`adsbygoogle.js`) is injected once by
 * the blog layout — this component only renders the `<ins>` slot and asks
 * AdSense to fill it on mount. A ref guard stops React StrictMode's dev-mode
 * double-invoke from pushing the same slot twice ("already have ads" error).
 */
export function AdSlot({ className }: { className?: string }) {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      /* AdSense unavailable (blocked / not yet loaded) — fail silently. */
    }
  }, [])

  return (
    <ins
      className={`adsbygoogle block ${className ?? ""}`}
      style={{ display: "block" }}
      data-ad-client="ca-pub-7026816666510256"
      data-ad-slot="6985178925"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
