"use client"

import { useEffect } from "react"
import { useNotificationsQuery, useUnreadCount, useMarkRead, useMarkAllRead } from "@/hooks/useNotificationsQuery"
import { getSocket } from "@/lib/socket"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"

type NotifPayload = { message?: string; title?: string; link?: string; [k: string]: unknown }

export const useNotifications = () => {
  const qc = useQueryClient()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const { push } = useToast()

  const { data: notifData } = useNotificationsQuery()
  const { data: unreadData } = useUnreadCount()
  const markReadMut = useMarkRead()
  const markAllMut  = useMarkAllRead()

  // Real-time: socket.io "notification.new" event — invalidate cache + play
  // sound + show toast so users SEE/HEAR new activity even without checking
  // the bell.
  useEffect(() => {
    if (!isAuthenticated) return
    let retry: ReturnType<typeof setTimeout> | null = null
    let cleanup: (() => void) | null = null

    const attach = () => {
      const socket = getSocket()
      if (!socket) { retry = setTimeout(attach, 600); return }

      const handler = (payload: { type: string; payload: NotifPayload } | undefined) => {
        // 1. Force a refetch — notification list + unread count get fresh data
        qc.invalidateQueries({ queryKey: ["notifications"] })
        qc.invalidateQueries({ queryKey: ["notifications/unread"] })

        // 2. Sound is handled globally in RealtimeListeners (robust audio pool),
        //    so it fires once everywhere — don't double-play here.

        // 3. Toast preview so a user not looking at the bell still notices
        const msg = payload?.payload?.message ?? payload?.payload?.title ?? "New notification"
        push(typeof msg === "string" ? msg.slice(0, 100) : "New notification", "info")
      }

      // A conversation was opened → its grouped DM notification cleared. Refetch
      // so the bell/badge updates live without a refresh.
      const readHandler = () => {
        qc.invalidateQueries({ queryKey: ["notifications"] })
        qc.invalidateQueries({ queryKey: ["notifications/unread"] })
      }

      socket.on("notification.new", handler)
      socket.on("notification.read", readHandler)
      cleanup = () => { socket.off("notification.new", handler); socket.off("notification.read", readHandler) }
    }

    attach()
    return () => { if (retry) clearTimeout(retry); cleanup?.() }
  }, [isAuthenticated, qc, push])

  const notifications = (notifData?.data ?? []).map(n => {
    const p = (n.payload ?? {}) as Record<string, string>
    return {
      id: n.id,
      type: n.type,
      message: p.message ?? p.title ?? "New notification",
      avatar: p.actorAvatarUrl ?? null,
      link: p.link ?? null,
      time: (() => {
        const d = Date.now() - new Date(n.createdAt).getTime()
        if (d < 60000) return "just now"
        if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
        if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`
        return `${Math.floor(d / 86400000)}d ago`
      })(),
      read: n.read,
    }
  })

  const unreadCount = unreadData?.count ?? notifications.filter(n => !n.read).length

  const markAllAsRead = () => markAllMut.mutate(undefined)
  const clearAll      = () => markAllMut.mutate(undefined)

  return { notifications, unreadCount, markAllAsRead, clearAll }
}
