"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"

/**
 * Auth layout — completely bare: no Navbar, no Footer, no Banner.
 * Waits for SessionProvider bootstrap (sessionReady) before deciding
 * whether to show the auth form or redirect.
 *
 * Redirect priority for an already-authenticated visitor:
 *   1. `?returnTo=` if it points to a safe URL (relative path or any
 *      kaiveron.com subdomain — e.g. admin-dashboard.kaiveron.com
 *      bounces here when its own bootstrap fails)
 *   2. `/user/<slug>/dashboard` if the session has a slug
 *   3. `/dashboard` as a last resort
 *
 * Without (1) the admin subdomain handoff broke: admin bounces to
 * /login?returnTo=... → user is already authenticated → this layout
 * sent them to /dashboard instead of back to admin.
 */
function safeReturnTo(raw: string | null): string | null {
  if (!raw) return null
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw
  try {
    const u = new URL(raw)
    if (u.hostname === "kaiveron.com" || u.hostname.endsWith(".kaiveron.com")) {
      return u.toString()
    }
  } catch { /* malformed → reject */ }
  return null
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router          = useRouter()
  const params          = useSearchParams()
  const sessionReady    = useAuthStore(s => s.sessionReady)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const user            = useAuthStore(s => s.user)

  useEffect(() => {
    if (!sessionReady) return
    if (!isAuthenticated) return

    // returnTo is the most-trustworthy signal — honor it even if user
    // hasn't finished loading. The destination doesn't depend on slug.
    const returnTo = safeReturnTo(params.get("returnTo") ?? params.get("next"))
    if (returnTo) {
      if (returnTo.startsWith("http")) {
        // Cross-subdomain handoff (e.g. admin-dashboard.kaiveron.com) — must
        // be a full-page navigation so the cookie + middleware fire fresh.
        window.location.href = returnTo
      } else {
        router.replace(returnTo)
      }
      return
    }

    // Wait for the user object before falling back so we don't accidentally
    // redirect to /dashboard when the user actually has a slug — /auth/me
    // is a separate request after /auth/refresh, and `user` may still be null
    // on the first tick where `sessionReady` flips true.
    if (!user) return

    // Instagram-style: drop users into the Community feed first, not the dashboard.
    router.replace("/community")
  }, [sessionReady, isAuthenticated, user, params, router])

  if (!sessionReady) return null
  if (isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
