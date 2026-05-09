"use client"

import { motion } from "framer-motion"
import { Zap, ChevronRight } from "lucide-react"
import Link from "next/link"

const LEVELS = [
  { min: 0,      title: "Neophyte",      color: "from-slate-500 to-slate-400"   },
  { min: 500,    title: "Initiate",      color: "from-blue-600 to-blue-400"     },
  { min: 1500,   title: "Apprentice",    color: "from-indigo-600 to-indigo-400" },
  { min: 3000,   title: "Shinobi",       color: "from-violet-600 to-violet-400" },
  { min: 6000,   title: "Jonin",         color: "from-purple-600 to-purple-400" },
  { min: 12000,  title: "Anbu",          color: "from-pink-600 to-pink-400"     },
  { min: 25000,  title: "Elite Jonin",   color: "from-rose-600 to-rose-400"     },
  { min: 50000,  title: "Kage",          color: "from-orange-600 to-amber-400"  },
  { min: 100000, title: "Legendary",     color: "from-amber-500 to-yellow-300"  },
]

function getLevel(xp: number) {
  let current = LEVELS[0]
  for (const lvl of LEVELS) {
    if (xp >= lvl.min) current = lvl
    else break
  }
  const idx = LEVELS.indexOf(current)
  const next = LEVELS[idx + 1]
  const progress = next
    ? ((xp - current.min) / (next.min - current.min)) * 100
    : 100
  return { ...current, level: idx + 1, nextMin: next?.min ?? current.min, progress: Math.min(100, progress) }
}

interface XPCardProps {
  xp?: number
  reputation?: number
}

export default function XPCard({ xp = 84000, reputation = 840 }: XPCardProps) {
  const { title, color, level, nextMin, progress } = getLevel(xp)

  return (
    <Link href="/streak" className="block group">
      <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${color} relative overflow-hidden`}>
        {/* Shine */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 blur-2xl rounded-full" />

        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-black/20">
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Neural Level</span>
            </div>
            <ChevronRight size={14} className="text-white/50 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div>
            <p className="text-4xl font-black tracking-tighter text-white leading-none">Lv. {level}</p>
            <p className="text-sm font-black text-white/80 mt-1 italic">{title}</p>
          </div>

          {/* XP bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/50">
              <span>{xp.toLocaleString()} XP</span>
              <span>{nextMin.toLocaleString()} XP</span>
            </div>
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-white/60 rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-[9px] font-black text-white/50 uppercase tracking-wider">
            <span>Reputation: {reputation}</span>
            <span>·</span>
            <span>Top 4% globally</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
