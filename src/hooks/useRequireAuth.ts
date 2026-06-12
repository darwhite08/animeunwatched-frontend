"use client"

import { useCallback } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { useAuthPrompt } from "@/stores/authPrompt.store"

/**
 * Returns a guard: runs `action` if the user is signed in, otherwise pops the
 * sign-in prompt. Use it to gate any write action behind auth for guests.
 *
 *   const requireAuth = useRequireAuth()
 *   requireAuth(() => likePost(), { subtitle: "Sign in to like posts." })
 */
export function useRequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const show = useAuthPrompt((s) => s.show)
  return useCallback(
    (action: () => void, opts?: { title?: string; subtitle?: string }) => {
      if (isAuthenticated) action()
      else show(opts)
    },
    [isAuthenticated, show],
  )
}
