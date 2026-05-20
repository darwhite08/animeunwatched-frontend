"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"
import Sidebar from "@/components/dashboard/Sidebar"

/**
 * Layer-2 security guard for all /user/[slug]/* routes.
 *
 * Uses sessionReady (set by SessionProvider after bootstrap completes) instead
 * of a local ready state tick to avoid acting on incomplete session data.
 *
 * Guards:
 *   1. Wait for SessionProvider to finish (sessionReady = true)
 *   2. If unauthenticated → redirect to /login
 *   3. If URL slug ≠ session user's slug → redirect to own dashboard
 *
 * Data fetching in child pages MUST use session userId — never the URL slug.
 */
export default function UserScopedLayout({ children }: { children: React.ReactNode }) {
  const params   = useParams<{ slug: string }>()
  const router   = useRouter()

  const sessionReady    = useAuthStore(s => s.sessionReady)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const user            = useAuthStore(s => s.user)

  useEffect(() => {
    if (!sessionReady) return

    // Guard 1: not authenticated
    if (!isAuthenticated || !user) {
      const returnTo = encodeURIComponent(window.location.pathname)
      router.replace(`/login?returnTo=${returnTo}`)
      return
    }

    // Guard 2: slug mismatch → bounce to own dashboard silently
    if (user.slug && params.slug !== user.slug) {
      router.replace(`/user/${user.slug}/dashboard`)
      return
    }
  }, [sessionReady, isAuthenticated, user, params.slug, router])

  // Show nothing until session is loaded
  if (!sessionReady || !isAuthenticated || !user) return null
  if (user.slug && params.slug !== user.slug) return null

  return (
    <div className="flex min-h-screen bg-[#020202]">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
