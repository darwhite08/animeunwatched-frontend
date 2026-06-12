"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { setLastPath } from "@/lib/lastPath"

/**
 * Records the current route so the user can resume here after logging back in.
 * Renders nothing; mounted once at the app root.
 */
export function LastVisitTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if (pathname) setLastPath(pathname)
  }, [pathname])
  return null
}
