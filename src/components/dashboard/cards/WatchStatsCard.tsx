"use client"

import { motion } from "framer-motion"
import { Monitor, Clock, CheckCircle2, Star } from "lucide-react"

export const WatchStatsCard = () => {
  const stats = [
    { label: "Total Hours", value: "1,420", icon: Clock, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Episodes", value: "3,842", icon: Monitor, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Completed", value: "124", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Mean Score", value: "8.4", icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="group relative p-8 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] hover:bg-zinc-900/50 transition-all duration-500 overflow-hidden"
        >
          {/* Subtle background glow on hover */}
          <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity ${stat.bg}`} />
          
          <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} w-fit mb-6 group-hover:scale-110 transition-transform`}>
            <stat.icon size={24} />
          </div>
          
          <div className="space-y-1">
            <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}