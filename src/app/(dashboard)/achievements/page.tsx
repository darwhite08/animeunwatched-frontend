"use client"

import BadgeShowcase from "@/components/gamification/BadgeShowcase"
import { motion } from "framer-motion"
import { Trophy, Flame, Zap } from "lucide-react"
import { Medal } from "@phosphor-icons/react"
import { useAuthStore } from "@/stores/auth.store"

export default function AchievementsPage() {
  const user  = useAuthStore(s => s.user)
  const rep   = user?.reputation ?? 0
  const level = Math.max(1, Math.floor(Math.sqrt(rep * 100 / 1000)))
  const grade = level >= 10 ? "Grade IV" : level >= 7 ? "Grade III" : level >= 4 ? "Grade II" : "Grade I"
  const nextLevelRep = ((level + 1) ** 2) * 10

  const MILESTONES = [
    { icon: Trophy, label: "Next Badge",    value: level >= 10 ? "Legendary" : `Level ${level + 1}`, desc: `${rep.toLocaleString()} / ${nextLevelRep.toLocaleString()} rep`, color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20"  },
    { icon: Flame,  label: "Current Level", value: `Level ${level}`,  desc: `${grade} Shinobi`,       color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { icon: Medal,  label: "Status",        value: grade,             desc: "Neural rank",             color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20"  },
    { icon: Zap,    label: "Reputation",    value: rep.toLocaleString(), desc: "Total points",         color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 pb-32 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={14} className="text-amber-400" />
          <p className="text-[9px] font-mono uppercase tracking-[0.4em]"
            style={{ color: "rgba(245,158,11,0.6)" }}>
            Milestone Tracker
          </p>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">
          Achievements<span style={{ color: "#f59e0b" }}>.</span>
        </h1>
        <div className="mt-5 h-px" style={{
          background: "linear-gradient(90deg, rgba(245,158,11,0.5), rgba(245,158,11,0.2) 40%, transparent)"
        }} />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MILESTONES.map((m, i) => (
          <motion.div key={m.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`p-5 rounded-2xl border space-y-3 ${m.bg} ${m.border}`}
          >
            <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center">
              <m.icon size={16} className={m.color} />
            </div>
            <div>
              <p className="text-xl font-black text-white tracking-tighter">{m.value}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{m.label}</p>
            </div>
            <p className="text-[9px] text-white/30 leading-relaxed">{m.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Badge showcase */}
      <BadgeShowcase />
    </div>
  )
}
