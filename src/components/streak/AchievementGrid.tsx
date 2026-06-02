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
    <div className="space-y-6">
      <h4 className="text-xl font-black tracking-tighter px-2 italic">Milestones</h4>
      <div className="grid gap-4">
        {achievements.map((item) => (
          <div
            key={item.title}
            className={`p-6 rounded-[2rem] border border-border bg-surface flex items-center gap-5 group hover:bg-surface transition-all ${item.earned ? "" : "opacity-40"}`}
          >
            <div className={`p-4 rounded-2xl bg-background border border-border ${item.color} group-hover:scale-110 transition-transform`}>
              <item.icon size={20} />
            </div>
            <div className="flex-1">
              <p className="font-black text-foreground">{item.title}</p>
              <p className="text-xs text-subtle uppercase font-bold tracking-tighter">{item.desc}</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">
              {item.earned ? <span className="text-emerald-400">Unlocked</span> : <span className="text-subtle">{streak} / {item.desc.match(/\d+/)?.[0]}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
