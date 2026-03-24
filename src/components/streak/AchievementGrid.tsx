// src/components/streak/AchievementGrid.tsx
import { Award, Zap, Shield, Crown,Flame } from "lucide-react"

export const AchievementGrid = () => {
  const achievements = [
    { title: "Fire Walker", icon: Flame, color: "text-orange-500", desc: "10 Day Streak" },
    { title: "The Dedicated", icon: Shield, color: "text-blue-400", desc: "No skips for 1 month" },
    { title: "Binge Master", icon: Zap, color: "text-yellow-400", desc: "12 episodes in 24h" },
  ]

  return (
    <div className="space-y-6">
      <h4 className="text-xl font-black tracking-tighter px-2 italic">Milestones</h4>
      <div className="grid gap-4">
        {achievements.map((item) => (
          <div key={item.title} className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] flex items-center gap-5 group hover:bg-white/[0.05] transition-all">
            <div className={`p-4 rounded-2xl bg-black border border-white/10 ${item.color} group-hover:scale-110 transition-transform`}>
              <item.icon size={20} />
            </div>
            <div>
              <p className="font-black text-white/90">{item.title}</p>
              <p className="text-xs text-white/30 uppercase font-bold tracking-tighter">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}