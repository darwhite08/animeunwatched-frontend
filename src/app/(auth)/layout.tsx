"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"

// Auth layout — completely bare: no Navbar, no Footer, no Banner.
// Redirects already-logged-in users away from login/register.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  // If already logged in, bounce to dashboard
  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard")
  }, [isAuthenticated, router])

  // Don't flash the form for authenticated users
  if (isAuthenticated) return null

  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  )
}
