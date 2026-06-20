"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useLiveFollows } from "@/hooks/useRealtime"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { getSocket } from "@/lib/socket"
import { playSound } from "@/lib/audio/notifications"

/** Fired on every new notification so the topbar bell can ring. */
export const NOTIF_RING_EVENT = "kaiveron:notif-ring"

/**
 * Global realtime listeners that should run for every authenticated user,
 * regardless of which page they're on. Mount once near the root.
 *
 * - new-follower toast (driven by follow.new socket event)
 * - new-notification: chime (robust audio pool) + cache-invalidate + a ring
 *   event the bell animates off. Global so it fires on desktop too (the topbar
 *   bell doesn't mount useNotifications).
 */
export function RealtimeListeners() {
  const isAuth = useAuthStore(s => s.isAuthenticated)
  const { push } = useToast()
  const qc = useQueryClient()

  useLiveFollows(() => {
    push("Someone just followed you", "info")
  })

  useEffect(() => {
    if (!isAuth) return
    let cleanup: (() => void) | undefined
    let retry: ReturnType<typeof setTimeout> | undefined
    const attach = () => {
      const socket = getSocket()
      if (!socket) { retry = setTimeout(attach, 600); return }
      const handler = () => {
        playSound("new-message")                                   // robust, autoplay-unlocked pool
        qc.invalidateQueries({ queryKey: ["notifications/unread"] })
        if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(NOTIF_RING_EVENT))
      }
      socket.on("notification.new", handler)
      cleanup = () => socket.off("notification.new", handler)
    }
    attach()
    return () => { cleanup?.(); if (retry) clearTimeout(retry) }
  }, [isAuth, qc])

  return null
}
