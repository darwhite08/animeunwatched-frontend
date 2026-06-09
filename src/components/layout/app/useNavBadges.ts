"use client"

import { useUnreadCount } from "@/hooks/useNotificationsQuery"
import { useConversations } from "@/hooks/useChat"

export type NavBadgeKey = "unreadDms" | "unreadNotifications"

/**
 * Live unread counts for the nav. Reuses the existing notification + chat
 * queries. Returns 0 for any count that isn't available yet.
 */
export function useNavBadges(): Record<NavBadgeKey, number> {
  const { data: notif } = useUnreadCount()
  const { data: convos } = useConversations()

  const unreadNotifications = notif?.count ?? 0

  // Conversations may be an array or { data: [...] }; sum each thread's unread.
  type Convo = { unreadCount?: number; unread?: number }
  const raw = (Array.isArray(convos) ? convos : (convos as { data?: unknown[] } | undefined)?.data ?? []) as Convo[]
  const unreadDms = raw.reduce((sum, c) => sum + (c.unreadCount ?? c.unread ?? 0), 0)

  return { unreadDms, unreadNotifications }
}
