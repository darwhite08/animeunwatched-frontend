"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Bell, Flame, BookOpen, Trophy, Zap, Vote, CheckCheck, Trash2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/stores/toast.store"
import { useNotificationsQuery, useMarkRead, useMarkAllRead } from "@/hooks/useNotificationsQuery"
import type { Notification } from "@/lib/api/types"

type NotifType = "achievement" | "comment" | "update" | "follow" | "poll" | "system"

type Notif = {
  id: string
  type: NotifType
  title: string
  body: string
  time: string
  read: boolean
  node: string
}

const ICON_MAP: Record<NotifType, { icon: typeof Bell; color: string; bg: string }> = {
  achievement: { icon: Flame,    color: "text-orange-400", bg: "bg-orange-500/10" },
  comment:     { icon: BookOpen, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  update:      { icon: Zap,      color: "text-yellow-400", bg: "bg-yellow-500/10" },
  follow:      { icon: Trophy,   color: "text-emerald-400",bg: "bg-emerald-500/10"},
  poll:        { icon: Vote,     color: "text-violet-400", bg: "bg-violet-500/10" },
  system:      { icon: Bell,     color: "text-white/50",   bg: "bg-white/5"       },
}

const INITIAL: Notif[] = [
  { id: "1", type: "achievement", title: "7-Day Streak Achieved",          body: "Neural Link: your consistency unlocked Flame Grade II.",                    time: "2m ago",   read: false, node: "NODE_01" },
  { id: "2", type: "comment",     title: "New comment on your review",     body: "User 'Zoro' replied to your Attack on Titan review.",                       time: "18m ago",  read: false, node: "NODE_04" },
  { id: "3", type: "poll",        title: "Poll results are in",            body: "The poll 'Best Anime of 2024?' you voted in has closed. Dungeon Meshi won.", time: "1h ago",   read: false, node: "NODE_07" },
  { id: "4", type: "update",      title: "Solo Leveling S2: Trailer Live", body: "New content synced to the neural archive.",                               time: "3h ago",   read: true,  node: "NODE_02" },
  { id: "5", type: "follow",      title: "New follower",                   body: "User 'ShadowWatcher' followed your profile.",                              time: "5h ago",   read: true,  node: "NODE_09" },
  { id: "6", type: "achievement", title: "100 Archives Logged",            body: "You've catalogued 100 anime. Badge: Centurion Watcher unlocked.",           time: "1d ago",   read: true,  node: "NODE_03" },
  { id: "7", type: "system",      title: "Platform Update v4.2",           body: "AI Oracle precision improved to 98.4%. Neural search now indexes tags.",    time: "2d ago",   read: true,  node: "NODE_00" },
  { id: "8", type: "comment",     title: "Mentioned in a thread",          body: "Your theory on Eren's plan is trending in the community.",                  time: "3d ago",   read: true,  node: "NODE_05" },
]

type Filter = "all" | "unread"

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 60000) return "just now"
  if (d < 3600000) return `${Math.floor(d/60000)}m ago`
  if (d < 86400000) return `${Math.floor(d/3600000)}h ago`
  return `${Math.floor(d/86400000)}d ago`
}

export default function NotificationsPage() {
  const { push } = useToast()
  const [filter, setFilter] = useState<Filter>("all")

  const { data: apiData } = useNotificationsQuery()
  const markReadMut = useMarkRead()
  const markAllMut  = useMarkAllRead()

  // Map API notifications to local Notif type, fall back to INITIAL
  const apiNotifs: Notif[] = (apiData?.data ?? []).map((n: Notification) => ({
    id: n.id,
    type: (["achievement","comment","update","follow","poll","system"].includes(n.type) ? n.type : "system") as NotifType,
    title: (n.payload as Record<string,string>).title ?? n.type,
    body:  (n.payload as Record<string,string>).description ?? (n.payload as Record<string,string>).message ?? "",
    time:  timeAgo(n.createdAt),
    read:  n.read,
    node:  "NODE_00",
  }))

  const notifs = apiNotifs.length > 0 ? apiNotifs : INITIAL
  const unreadCount = notifs.filter(n => !n.read).length

    const markAllRead = () => {
    markAllMut.mutate(undefined, {
      onSuccess: () => push("All notifications marked as read", "success"),
    })
  }
  const clearAll = () => markAllMut.mutate(undefined, { onSuccess: () => push("All marked as read", "info") })
  const markRead = (id: string) => {
    const notif = notifs.find(n => n.id === id)
    if (notif && !notif.read) markReadMut.mutate(id)
  }
  const dismiss = (id: string) => markReadMut.mutate(id)

  const visible = filter === "unread" ? notifs.filter(n => !n.read) : notifs

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8 pb-32">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-amber-400/60 mb-2">Neural_Feed</p>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Notifications</h1>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-indigo-400 hover:bg-indigo-500/10 border border-indigo-500/20 transition-colors"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
          <button
            onClick={clearAll}
            className="p-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
            title="Clear all"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(["all", "unread"] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              filter === f
                ? "bg-white/10 text-white"
                : "text-white/35 hover:bg-white/5 hover:text-white"
            }`}
          >
            {f}{f === "unread" && unreadCount > 0 && ` (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-24 text-center border border-dashed border-white/5 rounded-[3rem]"
        >
          <Bell size={28} className="mx-auto mb-3 text-white/15" />
          <p className="text-white/20 text-xs font-black uppercase tracking-widest">
            {filter === "unread" ? "No unread notifications" : "All clear"}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {visible.map((notif, i) => {
              const { icon: Icon, color, bg } = ICON_MAP[notif.type]
              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => markRead(notif.id)}
                  className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                    notif.read
                      ? "border-white/5 bg-transparent hover:bg-white/[0.02]"
                      : "border-indigo-500/15 bg-indigo-500/5 hover:bg-indigo-500/8"
                  }`}
                >
                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="absolute top-5 right-5 h-2 w-2 rounded-full bg-indigo-500" />
                  )}

                  <div className={`shrink-0 p-2.5 rounded-xl ${bg}`}>
                    <Icon size={16} className={color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold leading-snug ${notif.read ? "text-white/60" : "text-white"}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-white/35 mt-0.5 leading-relaxed">{notif.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{notif.time}</span>
                      <span className="text-[9px] font-mono text-white/15 uppercase">{notif.node}</span>
                    </div>
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); dismiss(notif.id) }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-all"
                  >
                    <Trash2 size={12} />
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
