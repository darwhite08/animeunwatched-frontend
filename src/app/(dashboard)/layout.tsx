"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "@/components/dashboard/Sidebar"
import { motion } from "framer-motion"

/**
 * Legacy (dashboard) layout.
 *
 * Redirects all /(dashboard)/* paths to /user/[slug]/* so the
 * browser URL shows the user-scoped version.
 *   /dashboard  → /user/priyanshu-chandra/dashboard
 *   /watchlist  → /user/priyanshu-chandra/watchlist
 *
 * Shows a loading spinner (not blank) while Zustand hydrates.
 * /me/settings/* and /admin/* stay at their current paths (served with sidebar).
 * /chat/* renders bare (no sidebar).
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

    if (!isAuthenticated || !user) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`)
      return
    }

    if (pathname.startsWith("/chat")) return
    if (pathname.startsWith("/me/") || pathname.startsWith("/admin/")) return

    if (user.slug) {
      const subPath = pathname.startsWith("/") ? pathname.slice(1) : pathname
      router.replace(`/user/${user.slug}/${subPath}`)
    }
  }, [ready, isAuthenticated, user, pathname, router])

  // While Zustand hydrates — show the K loader instead of a blank page
  if (!ready || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          {/* Animated K mark */}
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
          {/* Spinner ring */}
          <div className="w-6 h-6 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
        </div>
      </div>
    )
  }

  // Chat: bare layout
  if (pathname.startsWith("/chat")) return <>{children}</>

  // /me/settings and /admin: full sidebar layout at their current paths
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

  // All other legacy paths: show loader while the slug redirect fires
  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
    </div>
  )
}
