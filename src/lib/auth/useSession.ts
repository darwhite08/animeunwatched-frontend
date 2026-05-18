"use client"

import { useAuthStore } from "@/stores/auth.store"

// Simple hook that reads from the real Zustand auth store
// Session is bootstrapped by SessionProvider on mount via POST /auth/refresh
export function useSession() {
  const user = useAuthStore(s => s.user)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return { user, isAuthenticated }
}
