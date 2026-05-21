"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

const ROUTES: Record<string, string> = {
  // Navigation (g + key)
  "g h": "/",
  "g d": "/dashboard",
  "g w": "/watchlist",
  "g a": "/ai-discover",
  "g b": "/bestanimelist",
  "g c": "/community",
  "g l": "/leaderboard",
  "g s": "/streak",
  "g n": "/notifications",
  "g p": "/profile",
  "g m": "/mood",
  "g k": "/clubs",
  "g r": "/reviews",
  "g f": "/feed",
  "g i": "/me/import",
  "g e": "/calendar",
}

export function KeyboardShortcuts({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let buffer = ""
    let timer: ReturnType<typeof setTimeout>

    const onKey = (e: KeyboardEvent) => {
      // Ignore when typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      buffer += (buffer ? " " : "") + e.key.toLowerCase()

      clearTimeout(timer)
      timer = setTimeout(() => { buffer = "" }, 500)

      if (ROUTES[buffer]) {
        router.push(ROUTES[buffer])
        buffer = ""
        clearTimeout(timer)
      }

      // J/K scroll navigation
      if (e.key === "j") window.scrollBy({ top: 120, behavior: "smooth" })
      if (e.key === "k") window.scrollBy({ top: -120, behavior: "smooth" })

      // ? shows shortcut hints (future)
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [router])

  return <>{children}</>
}
