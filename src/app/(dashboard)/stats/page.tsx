"use client"

import { motion } from "framer-motion"
import { Clock, BarChart2, TrendingUp, Star, Zap, Award, Calendar, CheckCircle2 } from "lucide-react"
import Link from "next/link"

/* ── Mock stats data ── */
const YEARLY = [
  { year: 2024, hours: 1420, episodes: 3842, completed: 124 },
  { year: 2023, hours: 1180, episodes: 3102, completed: 98  },
  { year: 2022, hours: 890,  episodes: 2410, completed: 74  },
  { year: 2021, hours: 620,  episodes: 1680, completed: 52  },
]

const GENRE_DATA = [
  { genre: "Seinen",        hours: 487, pct: 34, color: "bg-amber-500"    },
  { genre: "Action",        hours: 355, pct: 25, color: "bg-indigo-500"   },
  { genre: "Psychological", hours: 213, pct: 15, color: "bg-purple-500"   },
  { genre: "Fantasy",       hours: 185, pct: 13, color: "bg-emerald-500"  },
  { genre: "Romance",       hours: 99,  pct: 7,  color: "bg-pink-500"     },
  { genre: "Other",         hours: 81,  pct: 6,  color: "bg-white/20"     },
]

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const MONTHLY_HOURS = [98, 112, 87, 134, 156, 102, 89, 143, 167, 89, 78, 165]
const MAX_H = Math.max(...MONTHLY_HOURS)

const TOP_STUDIOS = [
  { name: "MAPPA",     count: 31, hours: 320 },
  { name: "Madhouse",  count: 24, hours: 280 },
  { name: "Bones",     count: 18, hours: 210 },
  { name: "ufotable",  count: 12, hours: 186 },
  { name: "Wit Studio",count: 9,  hours: 124 },
]

export default function StatsPage() {
  const total = YEARLY.reduce((s, y) => s + y.hours, 0)

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 pb-32 space-y-10">

      {/* Header */}
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60 mb-2">Viewing Analytics</p>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">
          Watch Stats<span className="text-indigo-500">.</span>
        </h1>
        <p className="text-white/35 text-sm mt-1">Your complete anime viewing history</p>
      </div>

      {/* Hero numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Clock,        value: `${total.toLocaleString()}h`, label: "Total Hours",      color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { icon: BarChart2,    value: "10,034",                     label: "Episodes Watched", color: "text-blue-400",   bg: "bg-blue-500/10"   },
          { icon: CheckCircle2, value: "348",                        label: "Completed",        color: "text-emerald-400",bg: "bg-emerald-500/10"},
          { icon: Star,         value: "8.4",                        label: "Avg Score",        color: "text-amber-400",  bg: "bg-amber-500/10"  },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
            className="p-6 rounded-[2rem] bg-[#0a0a0a] border border-white/5 space-y-3"
          >
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon size={17} className={s.color} />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tighter text-white">{s.value}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25 mt-0.5">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className="p-7 rounded-[2rem] bg-[#0a0a0a] border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/50">Monthly Hours — 2024</h2>
          <span className="text-xs text-white/25 font-mono">{MONTHLY_HOURS.reduce((a,b)=>a+b,0)}h total</span>
        </div>
        <div className="flex items-end gap-2 h-36">
          {MONTHLY_HOURS.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[8px] font-mono text-white/20">{h}</span>
              <div className="w-full relative" style={{ height:"100px" }}>
                <motion.div
                  initial={{ height:0 }}
                  animate={{ height:`${(h/MAX_H)*100}%` }}
                  transition={{ delay: i*0.04, duration:0.6, ease:"easeOut" }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg min-h-[2px]"
                />
              </div>
              <span className="text-[8px] text-white/30 uppercase">{MONTHS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Genre breakdown */}
        <div className="p-7 rounded-[2rem] bg-[#0a0a0a] border border-white/5 space-y-5">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/50">Genre Breakdown</h2>
          <div className="space-y-4">
            {GENRE_DATA.map((g, i) => (
              <motion.div key={g.genre} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.07 }}
                className="space-y-1.5"
              >
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white/60">{g.genre}</span>
                  <span className="text-white/30 font-mono">{g.hours}h · {g.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width:0 }} animate={{ width:`${g.pct}%` }}
                    transition={{ delay: i*0.07+0.2, duration:0.7, ease:"easeOut" }}
                    className={`h-full ${g.color} rounded-full`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Top studios */}
        <div className="p-7 rounded-[2rem] bg-[#0a0a0a] border border-white/5 space-y-5">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/50">Top Studios</h2>
          <div className="space-y-3">
            {TOP_STUDIOS.map((s, i) => (
              <motion.div key={s.name} initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.08 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <span className="text-sm font-black text-white/20 w-5 shrink-0">#{i+1}</span>
                <div className="flex-1">
                  <p className="text-sm font-black text-white/80">{s.name}</p>
                  <p className="text-[9px] text-white/30">{s.count} anime · {s.hours}h</p>
                </div>
                <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width:0 }} animate={{ width:`${(s.hours/TOP_STUDIOS[0].hours)*100}%` }}
                    transition={{ delay: i*0.08+0.2, duration:0.6 }}
                    className="h-full bg-indigo-500 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Year comparison */}
      <div className="p-7 rounded-[2rem] bg-[#0a0a0a] border border-white/5 space-y-5">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/50">Year-over-Year</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {YEARLY.map((y, i) => (
            <motion.div key={y.year} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}
              className="text-center space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-colors"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{y.year}</p>
              <p className="text-2xl font-black text-white tracking-tighter">{y.hours}h</p>
              <p className="text-[9px] text-white/25">{y.completed} completed</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-center gap-4">
        <Link href="/watchlist" className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black uppercase tracking-widest text-white transition-all">
          View Watchlist
        </Link>
        <Link href="/profile/wrapped" className="px-6 py-3 rounded-2xl border border-white/10 bg-white/[0.03] text-xs font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/[0.06] transition-all">
          2024 Wrapped 🎉
        </Link>
      </div>
    </div>
  )
}
