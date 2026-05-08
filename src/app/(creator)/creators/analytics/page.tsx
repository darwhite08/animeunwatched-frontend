"use client"

import { motion } from "framer-motion"
import { BarChart3, Eye, Heart, MessageCircle, Users, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react"

const METRICS = [
  { label: "Total Views",    value: "24.8k",  delta: "+18%", up: true,  icon: Eye,           color: "text-indigo-400",  bg: "bg-indigo-500/10" },
  { label: "Total Likes",    value: "1,843",  delta: "+24%", up: true,  icon: Heart,         color: "text-rose-400",    bg: "bg-rose-500/10"   },
  { label: "Comments",       value: "312",    delta: "-4%",  up: false, icon: MessageCircle, color: "text-amber-400",   bg: "bg-amber-500/10"  },
  { label: "New Followers",  value: "128",    delta: "+9%",  up: true,  icon: Users,         color: "text-emerald-400", bg: "bg-emerald-500/10"},
]

const TOP_CONTENT = [
  { title: "Why Attack on Titan Changed Anime Forever",  type: "Blog",  views: 12400, likes: 843  },
  { title: "Gojo vs Sukuna Breakdown",                   type: "Feed",  views: 4200,  likes: 312  },
  { title: "Best Anime of 2024 — Final Rankings",        type: "Poll",  views: 3800,  likes: 0    },
  { title: "Gojo Satoru's Infinity: A Physics Breakdown", type: "Blog", views: 2900,  likes: 220  },
  { title: "Demon Slayer S5 Power Scaling",              type: "Feed",  views: 1100,  likes: 98   },
]

const TYPE_COLORS: Record<string, string> = {
  Blog: "bg-purple-500/20 text-purple-400 border-purple-500/20",
  Feed: "bg-indigo-500/20 text-indigo-400 border-indigo-500/20",
  Poll: "bg-amber-500/20 text-amber-400 border-amber-500/20",
}

// Simple fake bar chart data (7 days)
const CHART_DATA = [
  { day: "Mon", views: 3200 },
  { day: "Tue", views: 4100 },
  { day: "Wed", views: 3800 },
  { day: "Thu", views: 5200 },
  { day: "Fri", views: 4600 },
  { day: "Sat", views: 2900 },
  { day: "Sun", views: 3100 },
]
const MAX_VIEWS = Math.max(...CHART_DATA.map(d => d.views))

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <BarChart3 size={18} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-white/40">Last 30 days performance</p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-zinc-900 border border-white/10 rounded-2xl p-5 space-y-3"
          >
            <div className={`w-9 h-9 rounded-xl ${m.bg} flex items-center justify-center`}>
              <m.icon size={16} className={m.color} />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tighter text-white">{m.value}</p>
              <p className="text-xs text-white/40 uppercase tracking-wider mt-0.5">{m.label}</p>
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${m.up ? "text-emerald-400" : "text-red-400"}`}>
              {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {m.delta} vs last month
            </div>
          </motion.div>
        ))}
      </div>

      {/* Views chart */}
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Views — Last 7 Days</h2>
          <span className="text-xs text-white/30 uppercase tracking-widest">Daily</span>
        </div>

        <div className="flex items-end gap-3 h-40">
          {CHART_DATA.map((d, i) => {
            const pct = (d.views / MAX_VIEWS) * 100
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[9px] text-white/30 font-mono">
                  {d.views >= 1000 ? `${(d.views/1000).toFixed(1)}k` : d.views}
                </span>
                <div className="w-full flex items-end" style={{ height: "80px" }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400 min-h-[4px]"
                  />
                </div>
                <span className="text-[9px] text-white/40 uppercase">{d.day}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top content */}
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-white">Top Performing Content</h2>

        <div className="space-y-2">
          {TOP_CONTENT.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <span className="text-xs font-black text-white/20 w-5 shrink-0">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white/80 group-hover:text-white truncate transition-colors">
                  {item.title}
                </p>
              </div>
              <span className={`text-[9px] border px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 ${TYPE_COLORS[item.type]}`}>
                {item.type}
              </span>
              <div className="flex items-center gap-3 text-xs text-white/30 shrink-0">
                <span className="flex items-center gap-1"><Eye size={11} /> {item.views >= 1000 ? `${(item.views/1000).toFixed(1)}k` : item.views}</span>
                {item.likes > 0 && <span className="flex items-center gap-1"><Heart size={11} /> {item.likes}</span>}
              </div>
              <ArrowUpRight size={14} className="text-white/20 group-hover:text-indigo-400 transition-colors shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
