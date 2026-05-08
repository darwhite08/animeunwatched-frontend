import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as ep from "@/lib/api/endpoints"
import { useAuthStore } from "@/stores/auth.store"

export const notifKey     = ["notifications"]        as const
export const unreadKey    = ["notifications/unread"] as const

export function useNotificationsQuery(page = 1) {
  const isAuth = useAuthStore(s => s.isAuthenticated)
  return useQuery({
    queryKey: [...notifKey, page],
    queryFn:  () => ep.listNotifications(page),
    enabled:  isAuth,
    refetchInterval: 30_000, // poll every 30s
  })
}

export function useUnreadCount() {
  const isAuth = useAuthStore(s => s.isAuthenticated)
  return useQuery({
    queryKey: unreadKey,
    queryFn:  ep.getUnreadCount,
    enabled:  isAuth,
    refetchInterval: 15_000, // poll every 15s
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ep.markRead(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: notifKey })
      qc.invalidateQueries({ queryKey: unreadKey })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ep.markAllRead,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: notifKey })
      qc.invalidateQueries({ queryKey: unreadKey })
    },
  })
}
