"use client"

// src/components/streak/StreakInsights.tsx
//
// All insights are derived from real signals: list activity hour
// distribution → "Prime Viewing"; current streak → "Next Milestone";
// archive size → "Community Rank" (rough percentile placeholder until
// we have a real leaderboard rank endpoint).
import { motion } from "framer-motion"
import { Zap, Target, TrendingUp, AlertCircle } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { useUserList } from "@/hooks/useLists"

function nextMilestone(streak: number): { days: number; label: string } {
  if (streak < 7)   return { days: 7,   label: "Streak Spark" }
  if (streak < 30)  return { days: 30,  label: "Fire Walker" }
  if (streak < 100) return { days: 100, label: "Century Flame" }
  if (streak < 365) return { days: 365, label: "Eternal Flame" }
  return { days: streak, label: "Eternal Flame" }
}

export const StreakInsights = () => {
  const user = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "")
  const streak = (user as { streakDays?: number } | null)?.streakDays ?? 0
  const entries = listData?.data ?? []

  // Prime viewing — most common hour-of-day across all list updates
  const hourCounts = new Array(24).fill(0) as number[]
  for (const e of entries) hourCounts[new Date(e.updatedAt).getHours()]++
  const peakHour = hourCounts.reduce((best, c, i) => c > hourCounts[best] ? i : best, 0)
  const peakLabel = entries.length === 0
    ? "—"
    : new Date(2025, 0, 1, peakHour).toLocaleTimeString(undefined, { hour: "numeric", hour12: true })

  // Next milestone derived from current streak
  const next = nextMilestone(streak)
  const toGo = Math.max(0, next.days - streak)

  // Most recent WATCHING entry — used as the "verify today's episode" prompt
  const watching = entries
    .filter(e => e.status === "WATCHING" || e.status === "REWATCHING")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]

  const insights = [
    {
      title: "Prime Viewing",
      value: peakLabel,
      desc:  entries.length > 0 ? "Your peak consistency time." : "Update some entries to see this.",
      icon:  Zap,
      color: "text-yellow-400",
    },
    {
      title: "Next Milestone",
      value: toGo > 0 ? `${toGo}d` : "Achieved",
      desc:  toGo > 0 ? `${toGo} day${toGo === 1 ? "" : "s"} until '${next.label}'.` : `'${next.label}' unlocked.`,
      icon:  Target,
      color: "text-accent-bright",
    },
    {
      title: "Archive Size",
      value: entries.length.toLocaleString(),
      desc:  entries.length === 0 ? "Start your archive to see this grow." : `${entries.length} entr${entries.length === 1 ? "y" : "ies"} catalogued.`,
      icon:  TrendingUp,
      color: "text-emerald-400",
    },
  ]

  return (
    <div className="space-y-6">
      <h4 className="text-xl font-black tracking-tighter px-2 italic">Neural Insights</h4>
      <div className="grid gap-4">
        {insights.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-[2.5rem] border border-border bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl group hover:border-border transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-black/40 ${item.color}`}>
                <item.icon size={20} />
              </div>
              <span className="text-[10px] font-black text-subtle uppercase tracking-[0.2em]">Live</span>
            </div>

            <div className="space-y-1">
              <p className="text-2xl font-black text-foreground tracking-tight">{item.value}</p>
              <p className="text-xs font-bold text-muted uppercase tracking-tighter">{item.title}</p>
            </div>

            <p className="mt-4 text-[11px] text-subtle font-medium leading-relaxed">
              {item.desc}
            </p>
          </motion.div>
        ))}

        {watching && (
          <div className="p-6 rounded-[2rem] bg-accent/10 border border-accent/20 flex items-center gap-4 group cursor-pointer hover:bg-white/20 transition-all">
            <AlertCircle className="text-accent-bright shrink-0" size={20} />
            <p className="text-[11px] font-bold text-accent-bright leading-tight">
              Log today&apos;s episode of <span className="text-foreground">{watching.anime?.title ?? "your current show"}</span> to keep your streak alive.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
