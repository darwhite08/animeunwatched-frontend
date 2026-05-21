"use client"

import { useEffect, useRef } from "react"
import Lenis from "lenis"

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      // Skip elements that opt out via data-lenis-prevent — needed so the chat
      // message list and other inner scroll containers can scroll independently
      // with the trackpad / mouse wheel instead of bouncing the whole page.
      prevent: (node) =>
        !!node.closest("[data-lenis-prevent]"),
    })
    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    const id = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
