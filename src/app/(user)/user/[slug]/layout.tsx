"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"
import Sidebar from "@/components/dashboard/Sidebar"

/**
 * Layer-2 security guard for all /user/[slug]/* routes.
 *
 * Responsibilities (after edge middleware has confirmed cookie presence):
 *   1. Wait for Zustand to hydrate (prevents flash of wrong state)
 *   2. If unauthenticated → redirect to /login
 *   3. If slug in URL ≠ session user's slug → redirect to /user/<sessionSlug>/dashboard
 *      (never expose another user's slug mismatch as an error; just bounce them home)
 *   4. Render nothing until guards pass (no flash of protected content)
 *
 * Data fetching in all child pages MUST use session userId — never the URL slug.
 */
export default function UserScopedLayout({ children }: { children: React.ReactNode }) {
  const params   = useParams<{ slug: string }>()
  const router   = useRouter()
  const [ready, setReady] = useState(false)

  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const user            = useAuthStore(s => s.user)

  useEffect(() => {
    // Give Zustand one tick to hydrate from the session provider
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return

    // Guard 1: not logged in at all
    if (!isAuthenticated || !user) {
      const returnTo = encodeURIComponent(window.location.pathname)
      router.replace(`/login?returnTo=${returnTo}`)
      return
    }

    // Guard 2: slug in URL doesn't match the authenticated user
    // Bounce to their own dashboard — no 403, no error page leakage
    if (user.slug && params.slug !== user.slug) {
      router.replace(`/user/${user.slug}/dashboard`)
      return
    }
  }, [ready, isAuthenticated, user, params.slug, router])

  // Render nothing until all guards pass (prevents flash of protected content)
  if (!ready || !isAuthenticated || !user) return null
  if (user.slug && params.slug !== user.slug) return null

  const isChat = false // extend if needed for chat layout variant

  return (
    <div className="flex min-h-screen bg-[#020202]">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
