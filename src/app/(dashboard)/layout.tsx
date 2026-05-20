"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "@/components/dashboard/Sidebar"

/**
 * Legacy (dashboard) layout — handles two cases:
 *   1. /chat/* routes: render bare (chat has its own full-screen layout)
 *   2. All other /(dashboard)/* routes: redirect to /user/[slug]/[path] so the
 *      browser URL shows the user-scoped version.
 *      e.g. /dashboard → /user/hemant-sharma/dashboard
 *           /watchlist → /user/hemant-sharma/watchlist
 *
 * The /me/settings/* pages are kept here directly (not redirected) because they are
 * sub-pages of the settings layout and work correctly at their current path.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router    = useRouter()
  const pathname  = usePathname()
  const [ready, setReady] = useState(false)

  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const user            = useAuthStore(s => s.user)

  useEffect(() => { setReady(true) }, [])

  useEffect(() => {
    if (!ready) return

    // Guard: not authenticated
    if (!isAuthenticated || !user) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`)
      return
    }

    // Chat has its own full layout — don't redirect
    if (pathname.startsWith("/chat")) return

    // /me/settings/* and /admin/* pages stay at their current paths
    if (pathname.startsWith("/me/") || pathname.startsWith("/admin/")) return

    // All other /(dashboard) pages: redirect to /user/[slug]/[sub-path]
    if (user.slug) {
      // Strip leading slash, compose user-scoped URL
      const subPath = pathname.startsWith("/") ? pathname.slice(1) : pathname
      const target  = `/user/${user.slug}/${subPath}`
      router.replace(target)
    }
  }, [ready, isAuthenticated, user, pathname, router])

  if (!ready || !isAuthenticated || !user) return null

  // Chat: bare layout (no sidebar)
  if (pathname.startsWith("/chat")) return <>{children}</>

  // /me/settings and /admin pages stay in the dashboard shell (with sidebar)
  if (pathname.startsWith("/me/") || pathname.startsWith("/admin/")) {
    return (
      <div className="flex min-h-screen bg-[#020202] text-white">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen">
          {children}
        </main>
      </div>
    )
  }

  // All other legacy paths: show nothing while the redirect fires
  return null
}
