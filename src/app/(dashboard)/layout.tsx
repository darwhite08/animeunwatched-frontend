"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/dashboard/Sidebar"
import { useAuthStore } from "@/stores/auth.store"
import { useRouter, usePathname } from "next/navigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const isChat   = pathname.startsWith("/chat")
  // Hydration guard: don't redirect until Zustand has hydrated
  const [hydrated, setHydrated] = useState(false)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) {
      const next = typeof window !== "undefined" ? window.location.pathname : "/dashboard"
      router.replace(`/login?next=${encodeURIComponent(next)}`)
    }
  }, [hydrated, isAuthenticated, router])

  // Show nothing until hydration is complete to avoid flash of unauthenticated content
  if (!hydrated) return null
  if (!isAuthenticated) return null

  // Chat has its own full-screen layout — render bare with no sidebar or margin
  if (isChat) return <>{children}</>

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen relative">
        <div className="fixed inset-0 bg-noise pointer-events-none" />
        {children}
      </main>
    </div>
  )
}
