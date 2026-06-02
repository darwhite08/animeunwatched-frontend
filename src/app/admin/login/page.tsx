"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useSession } from "@/lib/auth/useSession"
import { useAuthStore } from "@/stores/auth.store"

/**
 * Admin login is the same as the regular login — we just gate by role after
 * SessionProvider rehydrates from the refresh cookie. The cookie is set on
 * `.kaiveron.com` (parent domain) so it's already valid across both
 * kaiveron.com and admin-dashboard.kaiveron.com.
 *
 * If there's no session, we send the user to https://kaiveron.com/login
 * (absolute URL — relative /login would get rewritten back to /admin/login
 * by middleware and infinite-loop). After login, the main /login page
 * honours the returnTo param and ships them back here.
 */

const ADMIN_URL = "https://admin-dashboard.kaiveron.com"
const MAIN_LOGIN = "https://kaiveron.com/login"

export default function AdminLoginPage() {
  const router       = useRouter()
  const params       = useSearchParams()
  const { user, isAuthenticated } = useSession()
  const sessionReady = useAuthStore((s) => s.sessionReady)
  const returnTo     = params.get("returnTo") ?? "/admin"
  const [showManualLink, setShowManualLink] = useState(false)

  // If we sit in the "redirecting…" state for more than 2s without anything
  // happening, surface the manual link so the user can click through.
  useEffect(() => {
    const t = setTimeout(() => setShowManualLink(true), 2000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!sessionReady) return

    if (!isAuthenticated) {
      // Absolute URL on the main host. After login the main site sees
      // returnTo, validates it's a kaiveron.com URL, and redirects here.
      const target = ADMIN_URL + (returnTo.startsWith("/") ? returnTo : "/admin")
      window.location.href = `${MAIN_LOGIN}?returnTo=${encodeURIComponent(target)}`
      return
    }

    if (user?.role !== "ADMIN") {
      router.replace("/admin/403")
      return
    }

    // Same-origin returnTo is safe to use as-is
    router.replace(returnTo.startsWith("/") ? returnTo : "/admin")
  }, [sessionReady, isAuthenticated, user?.role, returnTo, router])

  const manualLoginHref = `${MAIN_LOGIN}?returnTo=${encodeURIComponent(
    ADMIN_URL + (returnTo.startsWith("/") ? returnTo : "/admin")
  )}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="text-center max-w-sm">
        <div className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-2">
          Kaiveron
        </div>
        <div className="text-xl font-black uppercase tracking-tight">
          Admin Console
        </div>
        <div className="text-xs text-subtle mt-4 font-mono uppercase tracking-[0.3em]">
          {sessionReady && !isAuthenticated ? "Redirecting to sign in…" : "Checking credentials…"}
        </div>
        {showManualLink && (
          <div className="mt-8 text-xs text-subtle">
            Not redirecting?{" "}
            <Link href={manualLoginHref} className="text-accent-bright hover:underline">
              Sign in on kaiveron.com →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
