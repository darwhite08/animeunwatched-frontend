"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"

/**
 * Community is members-only. Universal (logged-out) access is turned OFF:
 * guests browsing /community (and its feed/anime/reviews/trending sub-routes)
 * are bounced to /login with a returnTo so they land back here after signing in.
 *
 * Gating is client-side because the refresh cookie (aw_refresh) is path-scoped
 * to /api/v1/auth, so neither middleware nor a Server Component can read auth —
 * we wait for SessionProvider to finish (sessionReady) before deciding, exactly
 * like the (dashboard) and (user) layout guards.
 */
export function CommunityGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const sessionReady = useAuthStore((s) => s.sessionReady)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!sessionReady) return
    if (!isAuthenticated || !user) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname || "/community")}`)
    }
  }, [sessionReady, isAuthenticated, user, pathname, router])

  // Still resolving the session, or about to redirect a guest — show a loader so
  // the members-only feed never flashes for logged-out visitors.
  if (!sessionReady || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
      </div>
    )
  }

  return <>{children}</>
}
