"use client"

import { StreakHeader } from "@/components/streak/StreakHeader"
import { MainStreakCard } from "@/components/streak/MainStreakCard"
import { StreakHeatmap } from "@/components/streak/StreakHeatmap"
import { AchievementGrid } from "@/components/streak/AchievementGrid"
import { StreakInsights } from "@/components/streak/StreakInsights"

// NEW IMPORTS
import { RoutineCard } from "@/components/streak/RoutineCard"
import { ProgressCard } from "@/components/streak/ProgressCard"
import { SocialCard } from "@/components/streak/SocialCard"
import BadgeShowcase from "@/components/gamification/BadgeShowcase"

export default function StreakPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 pb-24">
      <StreakHeader />

      {/* SECTION 1: THE HERO DATA */}
      <MainStreakCard currentStreak={22} bestStreak={45} />

      {/* SECTION 2: THE BENTO ANALYTICS GRID */}
      <div className="grid lg:grid-cols-12 gap-8">

        {/* LEFT: Consistency & Routine */}
        <div className="lg:col-span-8 space-y-8">
          <div className="p-10 rounded-[3rem] border border-white/5 bg-[#0a0a0a] shadow-2xl relative overflow-hidden">
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
      <div className="p-10 rounded-[3rem] border border-white/5 bg-[#0a0a0a] shadow-2xl">
        <BadgeShowcase />
      </div>
    </div>
  )
}