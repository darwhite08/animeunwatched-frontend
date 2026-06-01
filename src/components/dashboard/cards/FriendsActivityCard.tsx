"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Users, ChevronRight, Zap } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { PresenceDot } from "@/components/ui/PresenceDot"
import type { User } from "@/lib/api/types"

interface FriendActivity {
  user: Pick<User, "id" | "username" | "displayName" | "avatarUrl">
  anime: { title: string; malId: number; imageUrl?: string | null }
  status: string
  updatedAt: string
}

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`
  return `${Math.floor(d / 86400000)}d ago`
}

const AVATAR_GRADIENTS = [
  "from-accent to-orange-600", "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600", "from-rose-500 to-pink-600",
  "from-sky-500 to-blue-600",
]
function grad(name: string) {
  return AVATAR_GRADIENTS[(name.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length]
}

export default function FriendsActivityCard() {
  const user = useAuthStore(s => s.user)

  const { data, isLoading } = useQuery({
    queryKey: ["friends-activity", user?.username],
    queryFn: () => api<{ data: FriendActivity[] }>(`/users/${user?.username}/following-activity?limit=5`),
    enabled: !!user?.username,
    staleTime: 60_000,
  })

  const activities = data?.data ?? []

  return (
    <div className="p-8 rounded-[2.5rem] border border-border bg-surface relative overflow-hidden group">
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-accent/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-accent/10 transition-colors duration-700" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-accent-bright" />
          <h4 className="text-xs font-black uppercase tracking-[0.28em] text-subtle">
            Friends Watching
          </h4>
        </div>
        <Link href="/following" className="text-[9px] font-black uppercase tracking-widest text-accent-bright/60 hover:text-accent-bright transition-colors flex items-center gap-1">
          All <ChevronRight size={10} />
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-lg bg-surface shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-2/3 bg-surface rounded-full" />
                <div className="h-2 w-1/2 bg-surface rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && activities.length === 0 && (
        <div className="text-center py-8 space-y-3">
          <Users size={24} className="mx-auto text-subtle" />
          <p className="text-xs text-subtle font-black uppercase tracking-widest">
            Follow Shinobi to see their activity
          </p>
          <Link href="/users"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-black transition-all"
            style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}>
            <Zap size={10} /> Find Friends
          </Link>
        </div>
      )}

      <div className="space-y-4 relative z-10">
        {activities.map((a, i) => {
          const name = a.user.displayName ?? a.user.username
          const statusLabel = a.status === "COMPLETED" ? "finished" : a.status === "WATCHING" ? "watching" : a.status === "REWATCHING" ? "rewatching" : "added"
          return (
            <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
              <Link href={`/anime/${a.anime.malId}`} className="flex items-center gap-3.5 group/item cursor-pointer">
                <div className="relative shrink-0">
                  <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${grad(name)} flex items-center justify-center text-[11px] font-black group-hover/item:scale-110 transition-transform`}>
                    {name[0]?.toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5">
                    <PresenceDot userId={a.user.id} size={9} />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-muted group-hover/item:text-foreground transition-colors leading-tight">
                    <span className="text-accent-bright/80">{name}</span>
                    {" "}{statusLabel}
                  </p>
                  <p className="text-[10px] font-black uppercase text-subtle tracking-tighter truncate mt-0.5">
                    {a.anime.title}
                  </p>
                </div>
                <span className="text-[9px] font-medium text-subtle italic shrink-0">{timeAgo(a.updatedAt)}</span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
