"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Target, CheckCircle2, Circle, Zap, Clock } from "lucide-react"
import { useToast } from "@/stores/toast.store"

type Quest = { id: string; label: string; xp: number; progress: number; total: number; href: string }

const QUESTS: Quest[] = [
  { id:"q1", label:"Watch 1 episode",       xp:50,  progress:1, total:1, href:"/watchlist"  },
  { id:"q2", label:"Rate an anime",          xp:100, progress:0, total:1, href:"/rate"       },
  { id:"q3", label:"Write a post",           xp:75,  progress:0, total:1, href:"/community"  },
  { id:"q4", label:"Check the leaderboard",  xp:25,  progress:1, total:1, href:"/leaderboard"},
  { id:"q5", label:"Add 1 anime to list",    xp:50,  progress:1, total:1, href:"/bestanimelist"},
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
  const done = QUESTS.filter(q => q.progress >= q.total).length
  const totalXp = QUESTS.reduce((s, q) => s + q.xp, 0)
  const earnedXp = QUESTS.filter(q => q.progress >= q.total).reduce((s, q) => s + q.xp, 0)
  const allDone = done === QUESTS.length
  const [claimed, setClaimed] = useState(false)

  const claim = () => {
    if (!allDone || claimed) return
    setClaimed(true)
    push(`+${totalXp} XP claimed! Daily quests complete! 🎯`, "success")
  }

  return (
    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] space-y-6 relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 text-indigo-500/5 pointer-events-none">
        <Target size={120} strokeWidth={1} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Target size={15} className="text-indigo-400" />
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
          <span className="text-indigo-400 flex items-center gap-1">
            <Zap size={9} fill="currentColor" /> {earnedXp}/{totalXp} XP
          </span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(done / QUESTS.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full"
          />
        </div>
      </div>

      {/* Quest list */}
      <div className="space-y-2.5 relative z-10">
        {QUESTS.map((q, i) => {
          const complete = q.progress >= q.total
          return (
            <motion.div key={q.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.07 }}>
              <Link href={q.href} className="flex items-center gap-3 group">
                {complete
                  ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" fill="currentColor" />
                  : <Circle size={16} className="text-white/20 shrink-0 group-hover:text-indigo-400 transition-colors" />
                }
                <span className={`text-sm font-bold flex-1 transition-colors ${complete ? "text-white/40 line-through" : "text-white/70 group-hover:text-white"}`}>
                  {q.label}
                </span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${complete ? "bg-emerald-500/10 text-emerald-400/60" : "bg-indigo-500/10 text-indigo-400/80"}`}>
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
          : allDone ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          : "bg-white/5 text-white/20 border border-white/8 cursor-not-allowed"
        }`}
      >
        {claimed ? "✓ Claimed!" : allDone ? "Claim All Rewards" : `Complete all quests (+${totalXp} XP)`}
      </button>
    </div>
  )
}
