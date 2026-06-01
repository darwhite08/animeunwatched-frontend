"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "@/lib/auth/useSession"
import { useAuthStore } from "@/stores/auth.store"

/**
 * Admin login is the same as user login — we just gate by role after the
 * SessionProvider rehydrates. Rather than duplicate the entire login form
 * we redirect to /login with returnTo pointing back here, then this page's
 * effect handles the role check once they come back.
 */
export default function AdminLoginPage() {
  const router       = useRouter()
  const params       = useSearchParams()
  const { user, isAuthenticated } = useSession()
  const sessionReady = useAuthStore((s) => s.sessionReady)
  const returnTo     = params.get("returnTo") ?? "/admin"

  useEffect(() => {
    if (!sessionReady) return
    if (!isAuthenticated) {
      // Send them to the main login flow; bring them back to admin afterwards
      const loginUrl = "/login?returnTo=" + encodeURIComponent(`/admin/login?returnTo=${encodeURIComponent(returnTo)}`)
      window.location.href = loginUrl
      return
    }
    if (user?.role !== "ADMIN") {
      router.replace("/admin/403")
      return
    }
    router.replace(returnTo)
  }, [sessionReady, isAuthenticated, user?.role, returnTo, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <div className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-2">
          Kaiveron
        </div>
        <div className="text-xl font-black uppercase tracking-tight">
          Admin Console
        </div>
        <div className="text-xs text-subtle mt-4 font-mono uppercase tracking-[0.3em]">
          Checking credentials…
        </div>
      </div>
    </div>
  )
}
