"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { MessageSquare } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { getSocket } from "@/lib/socket"

function useUnreadDMs() {
  const isAuth = useAuthStore(s => s.isAuthenticated)
  const qc = useQueryClient()

  // Real-time: refresh DM count on every chat.message socket event so the
  // badge updates the instant a message arrives — no polling delay.
  useEffect(() => {
    if (!isAuth) return
    let retry: ReturnType<typeof setTimeout> | null = null
    let cleanup: (() => void) | null = null
    const attach = () => {
      const s = getSocket()
      if (!s) { retry = setTimeout(attach, 600); return }
      const refresh = () => qc.invalidateQueries({ queryKey: ["dm-unread-count"] })
      s.on("chat.message", refresh)
      s.on("chat.read",    refresh)
      cleanup = () => { s.off("chat.message", refresh); s.off("chat.read", refresh) }
    }
    attach()
    return () => { if (retry) clearTimeout(retry); cleanup?.() }
  }, [isAuth, qc])

  return useQuery({
    queryKey: ["dm-unread-count"],
    queryFn: () => api<{ conversations: Array<{ unreadCount?: number }> }>("/chat/conversations"),
    enabled: isAuth,
    staleTime: 30_000,
    refetchInterval: 60_000,
    select: (data) => data.conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
  })
}

export default function MessagesButton() {
  const isAuth = useAuthStore(s => s.isAuthenticated)
  const pathname = usePathname()
  const { data: unread = 0 } = useUnreadDMs()

  // Hide the floating Messages button when already inside the chat view —
  // user is already in messages, the button is redundant noise
  if (!isAuth) return null
  if (pathname?.startsWith("/chat")) return null

  return (
    <Link href="/chat">
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-black shadow-[0_8px_32px_color-mix(in srgb, var(--app-accent) 35%, transparent)] transition-all"
        style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}
      >
        <div className="relative">
          <MessageSquare size={15} />
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-red-500 text-foreground text-[7px] font-black flex items-center justify-center leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>
        Messages
      </motion.div>
    </Link>
  )
}
