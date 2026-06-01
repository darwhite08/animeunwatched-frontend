"use client"

import { motion } from "framer-motion"
import { Book, CheckCircle, Clock, Zap, TrendingUp } from "lucide-react"

const STATS = [
  { label: "Total Series",  value: "48",     icon: Book,         color: "text-blue-400",    bg: "bg-blue-500/10"   },
  { label: "Completed",     value: "12",     icon: CheckCircle,  color: "text-emerald-400", bg: "bg-emerald-500/10"},
  { label: "Avg. Pace",     value: "4 Ch/d", icon: Zap,          color: "text-accent-bright",   bg: "bg-accent/10"  },
  { label: "Hours Read",    value: "240h",   icon: Clock,        color: "text-purple-400",  bg: "bg-purple-500/10" },
  { label: "This Month",    value: "+8",     icon: TrendingUp,   color: "text-accent-bright",  bg: "bg-accent/10" },
]

export const ReadingStats = () => (
  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
    {STATS.map((stat, i) => (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.07 }}
        className="p-6 rounded-[2rem] border border-border bg-surface hover:bg-surface-2 transition-all group"
      >
        <div className={`p-2.5 rounded-xl ${stat.bg} w-fit mb-4 group-hover:scale-110 transition-transform`}>
          <stat.icon size={17} className={stat.color} />
        </div>
        <p className="text-3xl font-black text-foreground tracking-tighter">{stat.value}</p>
        <p className="text-[9px] font-black text-subtle uppercase tracking-[0.25em] mt-1">{stat.label}</p>
      </motion.div>
    ))}
  </div>
)
