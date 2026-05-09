"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { getMockUser } from "@/lib/mockAuth"

export function useSession() {
  const { isAuthenticated, setUser, setAccess } = useAuthStore()

  // Subscribe to the real auth store so consumers re-render when real auth happens
  const storeUser = useAuthStore(s => s.user)

  useEffect(() => {
    // If real auth is already set (e.g. user just logged in via email form), skip mock hydration
    if (isAuthenticated) return

    // Hydrate from the existing mock auth while real backend is being wired
    const stored = getMockUser()
    if (stored) {
      // Convert the mock user shape to the auth store shape
      setUser({
        id: "mock-user-id",
        email: "chandrapriyanshu10@gmail.com",
        username: "darwhite08",
        displayName: stored.name ?? "Priyanshu",
        bio: null,
        avatarUrl: null,
        role: "USER",
        reputation: 840,
        createdAt: new Date().toISOString(),
      })
      // No real access token in mock mode — just mark authenticated
      setAccess("mock-token")
    }
  }, [isAuthenticated, setUser, setAccess])

  // Prefer real store user (set by useLogin / useRegister) over mock
  return { user: storeUser, isAuthenticated }
}
