"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"

/**
 * The "/" landing is marketing chrome (topbar + hero). Logged-in users should
 * land in the app, not the marketing page — so once the session has resolved,
 * redirect them into their app home (which renders the AppShell sidebar). The
 * marketing landing is hidden during the redirect to avoid a flash.
 */
export function LandingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const sessionReady = useAuthStore((s) => s.sessionReady)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!sessionReady || !isAuthenticated || !user) return
    router.replace("/community")
  }, [sessionReady, isAuthenticated, user, router])

  // Hide the marketing landing for authenticated users while the redirect fires.
  if (sessionReady && isAuthenticated && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
      </div>
    )
  }

  return <>{children}</>
}
