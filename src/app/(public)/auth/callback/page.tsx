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
  const setAccess    = useAuthStore(s => s.setAccess)
  const setUser      = useAuthStore(s => s.setUser)
  const qc           = useQueryClient()
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

        // 3. Connect real-time socket
        connectSocket(accessToken!)

        // 4. Invalidate any stale auth queries
        await qc.invalidateQueries({ queryKey: ["auth/me"] })

        // 5. Navigate to dashboard
        router.replace("/dashboard")
      } catch {
        setError("Failed to complete sign-in. Please try again.")
      }
    }

    finish()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
        </div>
        <p className="text-white/70 text-sm">{error}</p>
        <a href="/login" className="inline-block px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium transition-colors">
          Back to login
        </a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-white/40">
        <Loader2 size={28} className="animate-spin text-amber-400" />
        <p className="text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
