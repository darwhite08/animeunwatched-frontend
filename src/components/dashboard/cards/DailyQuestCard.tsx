"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useAuthStore } from "@/stores/auth.store"
import { useUserList } from "@/hooks/useLists"
import { useDiscover } from "@/hooks/usePosts"
import { Target, CheckCircle2, Circle, Zap, Clock } from "lucide-react"
import { useToast } from "@/stores/toast.store"

type Quest = { id: string; label: string; xp: number; progress: number; total: number; href: string }

const QUESTS: Quest[] = [
  { id:"q1", label:"Watch 1 episode today",   xp:50,  progress:0, total:1, href:"/watchlist"    },
  { id:"q2", label:"Rate an anime",           xp:100, progress:0, total:1, href:"/rate"          },
  { id:"q3", label:"Write a community post",  xp:75,  progress:0, total:1, href:"/community"     },
  { id:"q4", label:"Check the leaderboard",   xp:25,  progress:0, total:1, href:"/leaderboard"   },
  { id:"q5", label:"Discover new anime",      xp:50,  progress:0, total:1, href:"/ai-discover"   },
]

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState("")
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const midnight = new Date(); midnight.setHours(24,0,0,0)
      const diff = midnight.getTime() - now.getTime()
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      setTimeLeft(`${h}h ${m}m`)
    }
    tick(); const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])
  return timeLeft
}

export default function DailyQuestCard() {
  const { push } = useToast()
  const timeLeft = useCountdown()
  const user = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "")
  const { data: discoverData } = useDiscover()

  // Compute real quest progress
  const realQuests = useMemo(() => {
    const entries = listData?.data ?? []
    // q1: any entry updated today with episodesSeen > 0
    const todayStart = new Date(); todayStart.setHours(0,0,0,0)
    const watchedToday = entries.filter(e => e.episodesSeen > 0 && new Date(e.updatedAt) >= todayStart).length
    // q2: any entry with a score set
    const ratedCount = entries.filter(e => e.score !== null).length
    const postsCount = (discoverData?.pages[0]?.data ?? []).filter(p => p.authorId === user?.id).length
    return QUESTS.map(q => ({
      ...q,
      progress: q.id === "q1" ? Math.min(1, watchedToday) :
                q.id === "q2" ? Math.min(1, ratedCount) :
                q.id === "q3" ? Math.min(1, postsCount) :
                q.id === "q4" ? 1 : // just viewed = always done
                q.id === "q5" ? 1 : // just being on the site = done
                q.progress,
    }))
  }, [listData, discoverData, user])

  const done = realQuests.filter(q => q.progress >= q.total).length
  const totalXp = realQuests.reduce((s, q) => s + q.xp, 0)
  const earnedXp = realQuests.filter(q => q.progress >= q.total).reduce((s, q) => s + q.xp, 0)
  const allDone = done === realQuests.length
  const [claimed, setClaimed] = useState(false)

  const claim = () => {
    if (!allDone || claimed) return
    setClaimed(true)
    push(`+${totalXp} XP claimed! Daily quests complete! 🎯`, "success")
  }

  return (
    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] space-y-6 relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 text-amber-500/5 pointer-events-none">
        <Target size={120} strokeWidth={1} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Target size={15} className="text-amber-400" />
          <h4 className="text-xs font-black uppercase tracking-[0.28em] text-white/40">Daily Quests</h4>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/25">
          <Clock size={10} />
          Resets in {timeLeft}
        </div>
      </div>

      {/* Global progress */}
      <div className="space-y-2 relative z-10">
        <div className="flex justify-between text-[9px] font-black uppercase tracking-wider">
          <span className="text-white/30">{done}/{QUESTS.length} Complete</span>
          <span className="text-amber-400 flex items-center gap-1">
            <Zap size={9} fill="currentColor" /> {earnedXp}/{totalXp} XP
          </span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(done / QUESTS.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #f59e0b, #fbbf24)" }}
          />
        </div>
      </div>

      {/* Quest list */}
      <div className="space-y-2.5 relative z-10">
        {realQuests.map((q, i) => {
          const complete = q.progress >= q.total
          return (
            <motion.div key={q.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.07 }}>
              <Link href={q.href} className="flex items-center gap-3 group">
                {complete
                  ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" fill="currentColor" />
                  : <Circle size={16} className="text-white/20 shrink-0 group-hover:text-amber-400 transition-colors" />
                }
                <span className={`text-sm font-bold flex-1 transition-colors ${complete ? "text-white/40 line-through" : "text-white/70 group-hover:text-white"}`}>
                  {q.label}
                </span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${complete ? "bg-emerald-500/10 text-emerald-400/60" : "bg-amber-500/10 text-amber-400/80"}`}>
                  <Zap size={8} fill="currentColor" /> +{q.xp}
                </span>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Claim button */}
      <button
        onClick={claim}
        disabled={!allDone || claimed}
        className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all relative z-10 ${
          claimed ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20"
          : allDone ? "text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]"
          : "bg-white/5 text-white/20 border border-white/8 cursor-not-allowed"
        }`}
      >
        {claimed ? "✓ Claimed!" : allDone ? "Claim All Rewards" : `Complete all quests (+${totalXp} XP)`}
      </button>
    </div>
  )
}
