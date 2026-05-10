"use client"

import BadgeShowcase from "@/components/gamification/BadgeShowcase"
import { motion } from "framer-motion"
import { Trophy, Star, Flame, Zap, Share2 } from "lucide-react"
import { useToast } from "@/stores/toast.store"

const STATS = [
  { icon:Trophy, label:"Earned",       value:"5",    color:"text-amber-400",   bg:"bg-amber-500/10"  },
  { icon:Star,   label:"Total",         value:"12",   color:"text-indigo-400",  bg:"bg-indigo-500/10" },
  { icon:Flame,  label:"Streak",        value:"22d",  color:"text-orange-400",  bg:"bg-orange-500/10" },
  { icon:Zap,    label:"Reputation",    value:"840",  color:"text-violet-400",  bg:"bg-violet-500/10" },
]

export default function ProfileBadgesPage() {
  const { push } = useToast()
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-32 space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-2">Achievements</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">
            My Badges<span className="text-amber-400">.</span>
          </h1>
          <p className="text-white/35 text-sm mt-1">5 of 12 earned · 7 remaining</p>
        </div>
        <button onClick={() => push("Share link copied!", "success")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-black uppercase tracking-wider text-white/50 hover:text-white hover:bg-white/8 transition-all mt-2"
        >
          <Share2 size={13} /> Share
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
            className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/5 space-y-2"
          >
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon size={16} className={s.color} />
            </div>
            <p className="text-xl font-black text-white tracking-tighter">{s.value}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Badge showcase */}
      <BadgeShowcase />
    </div>
  )
}
