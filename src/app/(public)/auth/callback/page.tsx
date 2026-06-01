"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"
import { useQueryClient } from "@tanstack/react-query"
import { connectSocket } from "@/lib/socket"
import { api } from "@/lib/api/client"
import { Loader2, AlertTriangle } from "lucide-react"
import type { User } from "@/lib/api/types"

export default function AuthCallbackPage() {
  const router       = useRouter()
  const params       = useSearchParams()
  const setAccess      = useAuthStore(s => s.setAccess)
  const setUser        = useAuthStore(s => s.setUser)
  const setSessionReady = useAuthStore(s => s.setSessionReady)
  const qc             = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const accessToken = params.get("access_token")
    const errorParam  = params.get("error")

    if (errorParam) {
      const messages: Record<string, string> = {
        google_failed:  "Google sign-in failed. Please try again.",
        google_no_code: "Google did not return an authorization code.",
      }
      setError(messages[errorParam] ?? "Authentication failed.")
      return
    }

    if (!accessToken) {
      setError("No access token received.")
      return
    }

    async function finish() {
      try {
        // 1. Store access token
        setAccess(accessToken!)

        // 2. Fetch full user profile
        const { user } = await api<{ user: User }>("/auth/me")
        setUser(user)

        // 3. Session handoff — issue a refresh cookie ON the Vercel domain.
        // Google's callback set the cookie on the Render backend's domain,
        // which Vercel-proxied refresh calls cannot reach. We mint a new
        // refresh token here through the Vercel proxy so the Set-Cookie
        // response lands on animeunwatched-frontend-delta.vercel.app —
        // making the session persist across page refreshes.
        try {
          await api("/auth/oauth-handoff", { method: "POST" })
        } catch {
          // Non-fatal: user can still use this session, just won't persist on refresh
        }

        // 4. Connect real-time socket
        connectSocket(accessToken!)

        // 5. Mark session as ready BEFORE navigating so the dashboard
        //    layout doesn't see sessionReady=false and redirect to /login
        setSessionReady()

        // 6. Invalidate any stale auth queries
        await qc.invalidateQueries({ queryKey: ["auth/me"] })

        // 7. Navigate to home
        router.replace("/")
      } catch {
        setError("Failed to complete sign-in. Please try again.")
      }
    }

    finish()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
        </div>
        <p className="text-muted text-sm">{error}</p>
        <a href="/login" className="inline-block px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-bright text-black text-sm font-medium transition-colors">
          Back to login
        </a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-muted">
        <Loader2 size={28} className="animate-spin text-accent-bright" />
        <p className="text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
