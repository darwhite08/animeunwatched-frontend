"use client"
import { useEffect, useRef, useState } from "react"

/**
 * Scroll-direction hook for chrome-stripping (hide on scroll-down, reveal on
 * scroll-up). Debounced by a px threshold; treats the top of the page as "up"
 * so chrome is always shown at rest. Window-scroll based (the app shell scrolls
 * the window, not an inner container, on normal pages like /community).
 */
export function useScrollDirection(threshold = 10) {
  const [dir, setDir] = useState<"up" | "down">("up")
  const [atTop, setAtTop] = useState(true)
  const last = useRef(0)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setAtTop(y <= 80)
      if (Math.abs(y - last.current) < threshold) return
      setDir(y > last.current && y > 80 ? "down" : "up")
      last.current = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])
  return { dir, atTop }
}
