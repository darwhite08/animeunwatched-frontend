"use client"

import Sidebar from "@/components/dashboard/Sidebar"
import { useAuthStore } from "@/stores/auth.store"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router    = useRouter()
  const pathname  = usePathname()
  const isChat    = pathname.startsWith("/chat")

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!useAuthStore.getState().isAuthenticated) {
        router.replace(`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/dashboard")}`)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [router])

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
