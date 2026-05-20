"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Play, Star, Bookmark, MessageCircle, Trophy, Heart, Filter } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/stores/auth.store"
import { useFeed } from "@/hooks/usePosts"
import { useUserProfile } from "@/hooks/useUsers"

type EventType = "watch" | "rate" | "add" | "review" | "badge" | "like" | "follow" | "post"

type Event = {
  id: string; type: EventType; title: string
  detail: string; time: string; link: string
}

const TYPE_CONFIG: Record<EventType, { icon: typeof Activity; color: string; bg: string }> = {
  watch:  { icon: Play,          color:"text-emerald-400", bg:"bg-emerald-500/10" },
  rate:   { icon: Star,          color:"text-amber-400",   bg:"bg-amber-500/10"   },
  add:    { icon: Bookmark,      color:"text-indigo-400",  bg:"bg-indigo-500/10"  },
  review: { icon: MessageCircle, color:"text-blue-400",    bg:"bg-blue-500/10"    },
  badge:  { icon: Trophy,        color:"text-purple-400",  bg:"bg-purple-500/10"  },
  like:   { icon: Heart,         color:"text-rose-400",    bg:"bg-rose-500/10"    },
  follow: { icon: Activity,      color:"text-teal-400",    bg:"bg-teal-500/10"    },
  post:   { icon: MessageCircle, color:"text-indigo-400",  bg:"bg-indigo-500/10"  },
}

const ALL_TYPES: EventType[] = ["watch","rate","add","review","badge","like","follow","post"]

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60_000)
    if (mins < 60)  return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)   return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7)   return `${days}d ago`
    return `${Math.floor(days / 7)}w ago`
  } catch {
    return ""
  }
}

export default function ActivityPage() {
  const user    = useAuthStore(s => s.user)
  const { data: feedData }    = useFeed()
  const { data: profileData } = useUserProfile(user?.username ?? "")

  // Build real activity events from feed posts authored by the current user
  const EVENTS: Event[] = useMemo(() => {
    const postEvents: Event[] = (feedData?.pages.flatMap(p => p.data) ?? [])
      .filter(p => p.authorId === user?.id)
      .map(p => ({
        id:     p.id,
        type:   "post" as EventType,
        title:  "Posted",
        detail: p.content.slice(0, 80) + (p.content.length > 80 ? "…" : ""),
        time:   timeAgo(p.createdAt),
        link:   "/feed",
      }))

    // Supplement with recent list activity from the user profile if available
    const listEvents: Event[] = (profileData?.user?.recentPosts ?? [])
      .filter(p => p.authorId !== user?.id) // avoid duplicating own posts
      .slice(0, 3)
      .map(p => ({
        id:     `profile-${p.id}`,
        type:   "post" as EventType,
        title:  "Interacted",
        detail: p.content.slice(0, 80) + (p.content.length > 80 ? "…" : ""),
        time:   timeAgo(p.createdAt),
        link:   "/feed",
      }))

    return [...postEvents, ...listEvents].sort(
      (a, b) => 0 // already ordered by creation from the API
    )
  }, [feedData, profileData, user?.id])

  const [filter, setFilter] = useState<EventType | "all">("all")
  const filtered = filter==="all" ? EVENTS : EVENTS.filter(e => e.type === filter)

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 pb-32 space-y-8">
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60 mb-2">Your History</p>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
          Activity<span className="text-indigo-500">.</span>
        </h1>
        <p className="text-white/35 text-sm mt-1">{EVENTS.length} event{EVENTS.length !== 1 ? "s" : ""} tracked</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <Filter size={13} className="text-white/30" />
        <button onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${filter==="all"?"bg-amber-500 text-black":"bg-white/5 text-white/40 border border-white/5"}`}
        >All</button>
        {ALL_TYPES.map(t => {
          const cfg = TYPE_CONFIG[t]
          return (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                filter===t ? `${cfg.bg} ${cfg.color} border border-current/20` : "bg-white/5 text-white/40 border border-white/5"
              }`}
            >{t}</button>
          )
        })}
      </div>

      {/* Event list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((ev, i) => {
            const cfg = TYPE_CONFIG[ev.type]
            const Icon = cfg.icon
            return (
              <motion.div key={ev.id} layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ delay:i*0.03 }}>
                <Link href={ev.link} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 hover:bg-white/[0.04] transition-all group">
                  <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon size={15} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white/80 group-hover:text-white transition-colors">{ev.title}</p>
                    <p className="text-[10px] text-white/35 truncate mt-0.5">{ev.detail}</p>
                  </div>
                  <span className="text-[9px] font-mono text-white/20 shrink-0">{ev.time}</span>
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-12 text-center border border-dashed border-white/5 rounded-[2rem]">
            <p className="text-white/20 text-xs font-black uppercase tracking-widest">No {filter} events yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
