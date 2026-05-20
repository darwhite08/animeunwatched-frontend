"use client"

import { motion } from "framer-motion"
import { Clock, Bookmark, Star, Trophy, MessageCircle, Play, ArrowRight, BookOpen } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/stores/auth.store"
import { useUserList } from "@/hooks/useLists"
import { useMemo } from "react"

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 60000) return "just now"
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`
  return `${Math.floor(d / 86400000)}d ago`
}

const FALLBACK = [
  { icon: Play,          color: "text-emerald-400", bg: "bg-emerald-500/10", title: "Watched Ep. 24",    anime: "Demon Slayer",    time: "2h ago",  href: "/watchlist" },
  { icon: Star,          color: "text-amber-400",   bg: "bg-amber-500/10",   title: "Rated 10/10",       anime: "Monster",         time: "1d ago",  href: "/bestanimelist" },
  { icon: Trophy,        color: "text-purple-400",  bg: "bg-purple-500/10",  title: "Streak Milestone",  anime: "20 Day Streak",   time: "3d ago",  href: "/streak" },
  { icon: MessageCircle, color: "text-blue-400",    bg: "bg-blue-500/10",    title: "Left a Review",     anime: "FMA Brotherhood", time: "4d ago",  href: "/community" },
]

export const ActivityCard = () => {
  const user = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "")

  const activities = useMemo(() => {
    const entries = listData?.data ?? []
    if (entries.length === 0) return FALLBACK

    return entries.slice(0, 5).map(entry => {
      const statusIcon = entry.status === "COMPLETED" ? Trophy
        : entry.status === "WATCHING" ? Play
        : entry.status === "DROPPED" ? BookOpen
        : Bookmark
      const statusColor = entry.status === "COMPLETED" ? "text-amber-400"
        : entry.status === "WATCHING" ? "text-emerald-400"
        : "text-amber-400"
      const statusBg = entry.status === "COMPLETED" ? "bg-amber-500/10"
        : entry.status === "WATCHING" ? "bg-emerald-500/10"
        : "bg-indigo-500/10"
      const title = entry.status === "COMPLETED" ? "Completed"
        : entry.status === "WATCHING" ? `Watching Ep. ${entry.episodesSeen}`
        : entry.status === "PLAN_TO_WATCH" ? "Added to List"
        : entry.status

      return {
        icon: statusIcon,
        color: statusColor,
        bg: statusBg,
        title: title.replace(/_/g, " "),
        anime: entry.anime?.title ?? "Unknown",
        time: timeAgo(entry.updatedAt ?? entry.createdAt),
        href: `/anime/${entry.anime?.malId ?? ""}`,
      }
    })
  }, [listData])

  return (
    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] flex flex-col gap-6 relative overflow-hidden group">
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />

      <div className="flex items-center justify-between relative z-10">
        <h4 className="text-xs font-black uppercase tracking-[0.28em] text-white/30 flex items-center gap-2">
          <Clock size={12} className="text-white/20" /> Recent Journey
        </h4>
        <Link href="/watchlist" className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60 hover:text-amber-400 transition-colors flex items-center gap-1">
          All <ArrowRight size={10} />
        </Link>
      </div>

      <div className="space-y-4 relative z-10">
        {activities.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
            <Link href={item.href} className="flex items-center gap-3.5 group/item cursor-pointer">
              <div className={`h-8 w-8 rounded-xl ${item.bg} flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform`}>
                <item.icon size={13} className={item.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white/80 group-hover/item:text-white transition-colors leading-tight">{item.title}</p>
                <p className="text-[10px] font-black uppercase text-white/20 tracking-tighter truncate">{item.anime}</p>
              </div>
              <span className="text-[9px] font-medium text-white/15 italic shrink-0">{item.time}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
