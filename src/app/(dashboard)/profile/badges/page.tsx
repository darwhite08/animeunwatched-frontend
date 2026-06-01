"use client"

import BadgeShowcase from "@/components/gamification/BadgeShowcase"
import { motion } from "framer-motion"
import { Trophy, Star, Flame, Zap, Share2 } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"

// Total available badges in the system (static catalog count)
const TOTAL_BADGES = 12

export default function ProfileBadgesPage() {
  const { push } = useToast()
  const user = useAuthStore(s => s.user)

  const reputation  = user?.reputation ?? 0
  // XP level: every 500 rep = 1 level, minimum level 1
  const xpLevel     = Math.floor(reputation / 500) + 1
  // Earned badge count estimated from reputation tiers (each 200 rep unlocks ~1 badge)
  const earnedBadges = Math.min(Math.floor(reputation / 200), TOTAL_BADGES)
  const remaining    = TOTAL_BADGES - earnedBadges

  const STATS = [
    { icon:Trophy, label:"Earned",    value:String(earnedBadges), color:"text-accent-bright",  bg:"bg-accent/10"  },
    { icon:Star,   label:"Total",     value:String(TOTAL_BADGES), color:"text-accent-bright", bg:"bg-accent/10" },
    { icon:Zap,    label:"XP Level",  value:`Lv. ${xpLevel}`,     color:"text-orange-400", bg:"bg-orange-500/10" },
    { icon:Flame,  label:"Reputation",value:String(reputation),   color:"text-violet-400", bg:"bg-violet-500/10" },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-32 space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-2">Achievements</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">
            My Badges<span className="text-accent-bright">.</span>
          </h1>
          <p className="text-subtle text-sm mt-1">{earnedBadges} of {TOTAL_BADGES} earned · {remaining} remaining</p>
        </div>
        <button onClick={() => push("Share link copied!", "success")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-xs font-black uppercase tracking-wider text-muted hover:text-foreground hover:bg-surface transition-all mt-2"
        >
          <Share2 size={13} /> Share
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
            className="p-5 rounded-2xl bg-surface border border-border space-y-2"
          >
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon size={16} className={s.color} />
            </div>
            <p className="text-xl font-black text-foreground tracking-tighter">{s.value}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-subtle">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Badge showcase */}
      <BadgeShowcase />
    </div>
  )
}
