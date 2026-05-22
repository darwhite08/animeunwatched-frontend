"use client"

import { useEffect } from "react"
import { useLiveFollows } from "@/hooks/useRealtime"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"

/**
 * Global realtime listeners that should run for every authenticated user,
 * regardless of which page they're on. Mount once near the root.
 *
 * - new-follower toast (driven by follow.new socket event)
 */
export function RealtimeListeners() {
  const isAuth = useAuthStore(s => s.isAuthenticated)
  const { push } = useToast()

  useLiveFollows(() => {
    push("Someone just followed you", "info")
  })

  useEffect(() => {
    // Reserved for future global listeners (e.g. server announcements)
    void isAuth
  }, [isAuth])

  return null
}
