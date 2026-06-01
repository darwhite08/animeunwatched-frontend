"use client"

import { StreakHeader } from "@/components/streak/StreakHeader"
import { MainStreakCard } from "@/components/streak/MainStreakCard"
import { StreakHeatmap } from "@/components/streak/StreakHeatmap"
import { useAuthStore } from "@/stores/auth.store"
import { useUserList } from "@/hooks/useLists"
import { useMemo } from "react"
import { AchievementGrid } from "@/components/streak/AchievementGrid"
import { StreakInsights } from "@/components/streak/StreakInsights"

// NEW IMPORTS
import { RoutineCard } from "@/components/streak/RoutineCard"
import { ProgressCard } from "@/components/streak/ProgressCard"
import { SocialCard } from "@/components/streak/SocialCard"
import BadgeShowcase from "@/components/gamification/BadgeShowcase"

export default function StreakPage() {
  const user = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "")

  const streakStats = useMemo(() => {
    const entries = listData?.data ?? []
    const completed = entries.filter(e => e.status === "COMPLETED").length
    const watching = entries.filter(e => e.status === "WATCHING").length
    const totalEps = entries.reduce((sum, e) => sum + e.episodesSeen, 0)
    // Use real streak from DB; fallback to rep-estimate for legacy users
    const rep = user?.reputation ?? 0
    const estStreak = user?.streakDays ?? Math.min(365, Math.floor(rep / 10))
    const bestStreak = user?.bestStreak ?? Math.min(365, Math.floor(rep / 6))
    return { estStreak, bestStreak, completed, watching, totalEps }
  }, [listData, user])

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 pb-24">
      <StreakHeader />

      {/* SECTION 1: THE HERO DATA */}
      <MainStreakCard currentStreak={streakStats.estStreak} bestStreak={streakStats.bestStreak} />

      {/* SECTION 2: THE BENTO ANALYTICS GRID */}
      <div className="grid lg:grid-cols-12 gap-8">

        {/* LEFT: Consistency & Routine */}
        <div className="lg:col-span-8 space-y-8">
          <div className="p-10 rounded-[3rem] border border-border bg-surface shadow-2xl relative overflow-hidden">
             {/* Decorative Background Text */}
             <span className="absolute -bottom-10 -right-5 text-[120px] font-black text-white/[0.02] pointer-events-none uppercase italic">History</span>

             <h3 className="text-2xl font-black tracking-tighter mb-8 italic relative z-10">Consistency Map</h3>
             <StreakHeatmap />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <RoutineCard />
            <SocialCard />
          </div>
        </div>

        {/* RIGHT: Progress & Milestones */}
        <div className="lg:col-span-4 space-y-8">
          <ProgressCard />
          <StreakInsights />
          <AchievementGrid />
        </div>

      </div>

      {/* SECTION 3: BADGE SHOWCASE */}
      <div className="p-10 rounded-[3rem] border border-border bg-surface shadow-2xl">
        <BadgeShowcase />
      </div>
    </div>
  )
}