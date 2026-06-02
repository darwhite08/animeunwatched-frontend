"use client"

// src/components/streak/ProgressCard.tsx — real progress toward the next badge
import { motion } from "framer-motion"
import { Target } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"

function nextBadge(streak: number): { name: string; days: number } {
  if (streak < 7)   return { name: "Streak Spark",   days: 7   }
  if (streak < 30)  return { name: "Fire Walker",    days: 30  }
  if (streak < 100) return { name: "Century Flame",  days: 100 }
  if (streak < 365) return { name: "Eternal Flame",  days: 365 }
  return { name: "Eternal Flame", days: streak }
}

export const ProgressCard = () => {
  const user = useAuthStore(s => s.user)
  const streak = (user as { streakDays?: number } | null)?.streakDays ?? 0
  const next   = nextBadge(streak)
  const prevThreshold = (() => {
    if (next.days === 7)   return 0
    if (next.days === 30)  return 7
    if (next.days === 100) return 30
    if (next.days === 365) return 100
    return next.days
  })()
  const span = Math.max(1, next.days - prevThreshold)
  const into = Math.max(0, streak - prevThreshold)
  const pct  = Math.min(100, Math.round((into / span) * 100))
  const toGo = Math.max(0, next.days - streak)

  return (
    <div className="relative overflow-hidden p-8 rounded-[2.5rem] border border-border bg-surface-2 backdrop-blur-3xl group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/20 blur-[60px] rounded-full group-hover:bg-purple-500/30 transition-all" />

      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-accent-bright uppercase tracking-[0.2em]">Next Evolution</p>
            <h4 className="text-xl font-black text-foreground italic">{next.name}</h4>
          </div>
          <Target className="text-subtle" size={24} />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-muted">Progress</span>
            <span className="text-foreground">{pct}%</span>
          </div>
          <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-border">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${pct}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
            />
          </div>
        </div>

        <p className="text-[11px] text-subtle font-medium italic leading-tight">
          {toGo > 0
            ? `${toGo} more day${toGo === 1 ? "" : "s"} to unlock "${next.name}".`
            : `"${next.name}" unlocked — keep going for the next milestone.`
          }
        </p>
      </div>
    </div>
  )
}
