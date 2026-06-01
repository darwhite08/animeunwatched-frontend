"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"

// Auth layout — completely bare: no Navbar, no Footer, no Banner.
// Waits for SessionProvider bootstrap (sessionReady) before deciding
// whether to show the auth form or redirect to the user's dashboard.
// This prevents the redirect loop where:
//   1. Bootstrap finds no session  → sessionReady=true, isAuthenticated=false
//   2. User logs in               → isAuthenticated=true
//   3. Auth layout sees isAuthenticated=true → redirects to /dashboard
//   4. Dashboard layout sees no slug yet → redirects away → loop
// By waiting for sessionReady we guarantee the full bootstrap has run
// before we make any redirect decision.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router          = useRouter()
  const sessionReady    = useAuthStore(s => s.sessionReady)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const user            = useAuthStore(s => s.user)

  useEffect(() => {
    // Wait until bootstrap finishes — don't redirect on stale isAuthenticated=false
    if (!sessionReady) return

    if (isAuthenticated) {
      // Redirect to user-scoped dashboard if we have a slug, otherwise bare dashboard
      const dest = user?.slug ? `/user/${user.slug}/dashboard` : "/dashboard"
      router.replace(dest)
    }
  }, [sessionReady, isAuthenticated, user, router])

  // While bootstrap is in progress, show nothing (no flash of login form)
  if (!sessionReady) return null

  // Bootstrap done: authenticated → redirect is firing above, render nothing
  if (isAuthenticated) return null

  // Bootstrap done: not authenticated → show the login/register page
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
