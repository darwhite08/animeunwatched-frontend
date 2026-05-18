"use client"

import { useEffect } from "react"
import { useNotificationsQuery, useUnreadCount, useMarkRead, useMarkAllRead } from "@/hooks/useNotificationsQuery"
import { getSocket } from "@/lib/socket"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth.store"

export const useNotifications = () => {
  const qc = useQueryClient()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  const { data: notifData } = useNotificationsQuery()
  const { data: unreadData } = useUnreadCount()
  const markReadMut = useMarkRead()
  const markAllMut  = useMarkAllRead()

  // Real-time: socket.io "notification.new" event
  useEffect(() => {
    if (!isAuthenticated) return
    const socket = getSocket()
    if (!socket) return
    const handler = () => {
      qc.invalidateQueries({ queryKey: ["notifications"] })
      qc.invalidateQueries({ queryKey: ["notifications/unread"] })
    }
    socket.on("notification.new", handler)
    return () => { socket.off("notification.new", handler) }
  }, [isAuthenticated, qc])

  const notifications = (notifData?.data ?? []).map(n => ({
    id: n.id,
    type: n.type,
    message: (n.payload as Record<string, string>).title
      ?? (n.payload as Record<string, string>).message
      ?? n.type,
    time: (() => {
      const d = Date.now() - new Date(n.createdAt).getTime()
      if (d < 60000) return "just now"
      if (d < 3600000) return `${Math.floor(d/60000)}m ago`
      if (d < 86400000) return `${Math.floor(d/3600000)}h ago`
      return `${Math.floor(d/86400000)}d ago`
    })(),
    read: n.read,
    node: "NODE_00",
  }))

  const unreadCount = unreadData?.count ?? notifications.filter(n => !n.read).length

  const markAllAsRead = () => markAllMut.mutate(undefined)
  const clearAll      = () => markAllMut.mutate(undefined)

  return { notifications, unreadCount, markAllAsRead, clearAll }
}
