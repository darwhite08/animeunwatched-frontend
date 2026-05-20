"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "@/components/dashboard/Sidebar"
import { motion } from "framer-motion"

/**
 * Legacy (dashboard) layout.
 *
 * When user HAS a slug:
 *   Redirects /dashboard → /user/[slug]/dashboard, etc.
 *
 * When user has NO slug (edge case — account created before slug column):
 *   Serves the page directly at /profile, /watchlist etc. with the sidebar.
 *   The page still works, just without the user-scoped URL.
 *
 * /chat/* → bare layout (no sidebar)
 * /me/settings/* and /admin/* → stay at their paths with sidebar
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const user            = useAuthStore(s => s.user)

  useEffect(() => { setReady(true) }, [])

  useEffect(() => {
    if (!ready) return

    // Not logged in → redirect to login
    if (!isAuthenticated || !user) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`)
      return
    }

    // Chat, settings, admin → no redirect needed
    if (pathname.startsWith("/chat")) return
    if (pathname.startsWith("/me/") || pathname.startsWith("/admin/")) return

    // Has slug → redirect to user-scoped URL
    if (user.slug) {
      const subPath = pathname.startsWith("/") ? pathname.slice(1) : pathname
      router.replace(`/user/${user.slug}/${subPath}`)
    }
    // No slug → stay at legacy path (sidebar will render below)
  }, [ready, isAuthenticated, user, pathname, router])

  // Still hydrating
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <KLoader />
      </div>
    )
  }

  // Not authenticated (redirect fired, show nothing)
  if (!isAuthenticated || !user) return null

  // Chat → bare layout
  if (pathname.startsWith("/chat")) return <>{children}</>

  // Settings + admin → sidebar layout at current path
  if (pathname.startsWith("/me/") || pathname.startsWith("/admin/")) {
    return <DashShell>{children}</DashShell>
  }

  // User has a slug → show spinner while redirect fires
  if (user.slug) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
      </div>
    )
  }

  // No slug → serve at legacy path with full sidebar (fallback)
  return <DashShell>{children}</DashShell>
}

/* ── Sub-components ── */

function DashShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#020202] text-white">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}

function KLoader() {
  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="56" height="56">
          <defs>
            <linearGradient id="loaderKGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="22" fill="#0A0F1E" />
          <path d="M 30 28 L 40 28 L 40 46 L 47 46 L 54 28 L 64 28 L 53 50 L 50 50 L 60 72 L 50 72 L 44 60 L 40 60 L 40 72 L 30 72 Z"
            fill="url(#loaderKGold)" />
        </svg>
      </motion.div>
      <div className="w-6 h-6 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
    </div>
  )
}
