"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Trophy, Flame, CheckCheck, Trash2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/stores/toast.store"
import { useNotificationsQuery, useMarkRead, useMarkAllRead } from "@/hooks/useNotificationsQuery"
import type { Notification } from "@/lib/api/types"
import { ui } from "@/lib/design/tokens"

// Per-type visual — icon + tint. Falls back to a bell for anything unknown.
const TYPE_META: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  message:         { icon: MessageCircle, color: "text-indigo-400",     bg: "bg-indigo-500/15" },
  new_follower:    { icon: UserPlus,      color: "text-emerald-400",    bg: "bg-emerald-500/15" },
  post_liked:      { icon: Heart,         color: "text-rose-400",       bg: "bg-rose-500/15" },
  review_liked:    { icon: Heart,         color: "text-rose-400",       bg: "bg-rose-500/15" },
  post_comment:    { icon: MessageCircle, color: "text-accent-bright",  bg: "bg-accent/15" },
  mention:         { icon: AtSign,        color: "text-sky-400",        bg: "bg-sky-500/15" },
  achievement:     { icon: Trophy,        color: "text-amber-400",      bg: "bg-amber-500/15" },
  streak_reminder: { icon: Flame,         color: "text-orange-400",     bg: "bg-orange-500/15" },
  system:          { icon: Bell,          color: "text-muted",          bg: "bg-surface" },
}
const metaFor = (t: string) => TYPE_META[t] ?? TYPE_META.system

type Filter = "all" | "unread"

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 60000) return "just now"
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`
  return `${Math.floor(d / 86400000)}d ago`
}

type Row = {
  id: string
  type: string
  message: string
  avatar: string | null
  link: string | null
  time: string
  read: boolean
}

export default function NotificationsPage() {
  const { push } = useToast()
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>("all")

  const { data: apiData } = useNotificationsQuery()
  const markReadMut = useMarkRead()
  const markAllMut = useMarkAllRead()

  const notifs: Row[] = (apiData?.data ?? []).map((n: Notification) => {
    const p = (n.payload ?? {}) as Record<string, unknown>
    return {
      id: n.id,
      type: n.type,
      // The backend already writes a human sentence ("X started following you").
      message: (p.message as string) ?? (p.description as string) ?? (p.title as string) ?? "New notification",
      avatar: (p.actorAvatarUrl as string) ?? null,
      link: (p.link as string) ?? null,
      time: timeAgo(n.createdAt),
      read: n.read,
    }
  })

  const unreadCount = notifs.filter((n) => !n.read).length
  const markAllRead = () =>
    markAllMut.mutate(undefined, { onSuccess: () => push("All notifications marked as read", "success") })
  const openRow = (n: Row) => {
    if (!n.read) markReadMut.mutate(n.id)
    if (n.link) router.push(n.link)
  }
  const dismiss = (id: string) => markReadMut.mutate(id)

  const visible = filter === "unread" ? notifs.filter((n) => !n.read) : notifs

  return (
    <div className={`max-w-3xl mx-auto ${ui.screenX} py-8 sm:py-12 space-y-6 sm:space-y-8 pb-32`}>
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground uppercase italic">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 ${ui.touch} rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider text-accent-bright hover:bg-white/10 active:scale-95 border border-accent/20 transition-all`}
          >
            <CheckCheck size={13} /> <span className="hidden sm:inline">Mark all </span>read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(["all", "unread"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center px-5 min-h-11 rounded-full text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
              filter === f ? "bg-surface text-foreground" : "text-subtle hover:bg-surface hover:text-foreground"
            }`}
          >
            {f}
            {f === "unread" && unreadCount > 0 && ` (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-24 text-center border border-dashed border-border rounded-[3rem]"
        >
          <Bell size={28} className="mx-auto mb-3 text-subtle" />
          <p className="text-subtle text-xs font-black uppercase tracking-widest">
            {filter === "unread" ? "You're all caught up" : "No notifications yet"}
          </p>
          <p className="text-subtle/70 text-xs mt-2">Follows, likes and replies will show up here.</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {visible.map((n, i) => {
              const { icon: Icon, color, bg } = metaFor(n.type)
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => openRow(n)}
                  className={`group relative flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] ${
                    n.read ? "border-border bg-transparent hover:bg-surface" : "border-accent/15 bg-accent/5 hover:bg-white/[0.06]"
                  }`}
                >
                  {!n.read && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-accent" />}

                  {/* Avatar (real profile pic) with a small type badge; icon fallback when no avatar */}
                  <div className="relative shrink-0">
                    {n.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.avatar} alt="" className="h-11 w-11 rounded-full object-cover bg-surface" />
                    ) : (
                      <div className={`h-11 w-11 rounded-full grid place-items-center ${bg}`}>
                        <Icon size={18} className={color} />
                      </div>
                    )}
                    {n.avatar && (
                      <span className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full grid place-items-center ring-2 ring-background ${bg}`}>
                        <Icon size={11} className={color} />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <p className={`text-sm leading-snug ${n.read ? "text-muted" : "text-foreground font-medium"}`}>{n.message}</p>
                    <span className="text-[11px] text-subtle mt-0.5 block">{n.time}</span>
                  </div>

                  {!n.read && <span className="absolute top-1/2 -translate-y-1/2 right-14 h-2 w-2 rounded-full bg-accent" />}

                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id) }}
                    aria-label="Dismiss notification"
                    className="shrink-0 grid place-items-center h-10 w-10 rounded-lg text-subtle opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-muted hover:bg-surface active:scale-90 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
