"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { getMockUser } from "@/lib/mockAuth"

export function useSession() {
  const { user, isAuthenticated, setUser, setAccess } = useAuthStore()

  useEffect(() => {
    // Hydrate from the existing mock auth while real backend is being wired
    const stored = getMockUser()
    if (stored && !isAuthenticated) {
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

  return { user, isAuthenticated }
}
