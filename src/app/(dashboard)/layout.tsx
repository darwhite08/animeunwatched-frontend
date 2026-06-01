"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "@/components/dashboard/Sidebar"
import { motion } from "framer-motion"

/**
 * Legacy (dashboard) layout.
 *
 * Waits for SessionProvider to finish bootstrapping (sessionReady = true)
 * before making any auth or redirect decisions. This eliminates the race
 * condition where the redirect fired before user.slug was populated.
 *
 * /dashboard  → /user/priyanshu-chandra/dashboard
 * /watchlist  → /user/priyanshu-chandra/watchlist
 * /achievements → /user/priyanshu-chandra/achievements
 * etc.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()

  const sessionReady    = useAuthStore(s => s.sessionReady)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const user            = useAuthStore(s => s.user)

  useEffect(() => {
    // Don't act until SessionProvider has fully completed its bootstrap
    if (!sessionReady) return

    // Not authenticated → go to login
    if (!isAuthenticated || !user) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`)
      return
    }

    // Chat, settings, admin → no redirect from this layout
    if (pathname.startsWith("/chat")) return
    if (pathname.startsWith("/me/") || pathname.startsWith("/admin/")) return

    // Has slug → redirect to user-scoped URL
    if (user.slug) {
      const subPath = pathname.startsWith("/") ? pathname.slice(1) : pathname
      router.replace(`/user/${user.slug}/${subPath}`)
    }
    // No slug → fall through to render with sidebar below
  }, [sessionReady, isAuthenticated, user, pathname, router])

  // ── Render logic ──────────────────────────────────────────────────────

  // Still loading session — show the Kaiveron loader
  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <KLoader />
      </div>
    )
  }

  // Session loaded but not authenticated (redirect fired above)
  if (!isAuthenticated || !user) return null

  // Chat → bare layout (no sidebar)
  if (pathname.startsWith("/chat")) return <>{children}</>

  // Settings + admin → sidebar at current path
  if (pathname.startsWith("/me/") || pathname.startsWith("/admin/")) {
    return <DashShell>{children}</DashShell>
  }

  // Has slug → show spinner while the redirect fires
  if (user.slug) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
      </div>
    )
  }

  // No slug (edge case) → serve directly with sidebar
  return <DashShell>{children}</DashShell>
}

function DashShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
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
            <linearGradient id="loaderKGoldDash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--app-accent-bright)" />
              <stop offset="100%" stopColor="var(--app-accent)" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="22" fill="#0A0F1E" />
          <path d="M 30 28 L 40 28 L 40 46 L 47 46 L 54 28 L 64 28 L 53 50 L 50 50 L 60 72 L 50 72 L 44 60 L 40 60 L 40 72 L 30 72 Z"
            fill="url(#loaderKGoldDash)" />
        </svg>
      </motion.div>
      <div className="w-6 h-6 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
    </div>
  )
}
