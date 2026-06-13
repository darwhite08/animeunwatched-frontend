"use client"

// src/components/streak/AchievementGrid.tsx — derived from real streak data
import { Zap, Shield, Flame } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"

export const AchievementGrid = () => {
  const user = useAuthStore(s => s.user)
  const streak     = (user as { streakDays?: number } | null)?.streakDays ?? 0
  const bestStreak = (user as { bestStreak?: number } | null)?.bestStreak ?? streak

  const achievements = [
    { title: "Streak Spark", icon: Flame,  color: "text-orange-300", desc: "7 day streak",         earned: bestStreak >= 7   },
    { title: "Fire Walker",  icon: Flame,  color: "text-orange-500", desc: "10 day streak",        earned: bestStreak >= 10  },
    { title: "The Dedicated", icon: Shield, color: "text-blue-400",  desc: "30 day streak",        earned: bestStreak >= 30  },
    { title: "Century Flame", icon: Zap,    color: "text-yellow-400", desc: "100 day streak",       earned: bestStreak >= 100 },
  ]

  return (
    <div className="space-y-5 sm:space-y-6">
      <h4 className="text-lg sm:text-xl font-black tracking-tighter px-1 sm:px-2 italic">Milestones</h4>
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
        {achievements.map((item) => (
          <div
            key={item.title}
            className={`p-4 sm:p-5 lg:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-border bg-surface flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4 lg:gap-5 group hover:bg-surface transition-all ${item.earned ? "" : "opacity-40"}`}
          >
            <div className={`shrink-0 grid place-items-center h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-background border border-border ${item.color} group-hover:scale-110 transition-transform`}>
              <item.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-foreground leading-tight">{item.title}</p>
              <p className="text-[11px] sm:text-xs text-subtle uppercase font-bold tracking-tight">{item.desc}</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest shrink-0">
              {item.earned ? <span className="text-emerald-400">Unlocked</span> : <span className="text-subtle">{streak} / {item.desc.match(/\d+/)?.[0]}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
