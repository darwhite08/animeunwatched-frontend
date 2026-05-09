"use client"

import BadgeShowcase from "@/components/gamification/BadgeShowcase"
import { motion } from "framer-motion"
import { Trophy, Star, Flame, Zap } from "lucide-react"

const MILESTONES = [
  { icon: Trophy, label: "Next Badge",   value: "The Dedicated",   desc: "30-day streak (8 days away)", color: "text-amber-400",   bg: "bg-amber-500/10"  },
  { icon: Flame,  label: "Current Streak",value: "22 Days",        desc: "Flame Grade III",              color: "text-orange-400",  bg: "bg-orange-500/10" },
  { icon: Star,   label: "Total Badges",  value: "5 / 12",          desc: "Earned so far",                color: "text-indigo-400",  bg: "bg-indigo-500/10" },
  { icon: Zap,    label: "Reputation",    value: "840",             desc: "Neural rank points",           color: "text-violet-400",  bg: "bg-violet-500/10" },
]

export default function AchievementsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 pb-32 space-y-10">
      {/* Header */}
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60 mb-2">Milestone Tracker</p>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">
          Achievements<span className="text-indigo-500">.</span>
        </h1>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MILESTONES.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
            className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/5 space-y-2"
          >
            <div className={`w-9 h-9 rounded-xl ${m.bg} flex items-center justify-center`}>
              <m.icon size={16} className={m.color} />
            </div>
            <div>
              <p className="text-xl font-black text-white tracking-tighter">{m.value}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">{m.label}</p>
            </div>
            <p className="text-[9px] text-white/30">{m.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Badge showcase */}
      <BadgeShowcase />
    </div>
  )
}
