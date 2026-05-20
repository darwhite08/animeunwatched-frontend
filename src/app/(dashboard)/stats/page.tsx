"use client"

import { motion } from "framer-motion"
import { Clock, BarChart2, TrendingUp, Star, Zap, Award, Calendar, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/stores/auth.store"
import { useUserList } from "@/hooks/useLists"
import { useMemo } from "react"

/* ── Visual placeholder — no per-month tracking in backend yet ── */
const MONTHLY_HOURS = [98, 112, 87, 134, 156, 102, 89, 143, 167, 89, 78, 165]
const MAX_H = Math.max(...MONTHLY_HOURS)
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

/* ── Colour palette for genre bars ── */
const GENRE_COLOURS = [
  "bg-amber-500",
  "bg-amber-400",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-pink-500",
  "bg-white/20",
]

export default function StatsPage() {
  const user = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "")

  const stats = useMemo(() => {
    const entries = listData?.data ?? []
    const completed = entries.filter(e => e.status === "COMPLETED").length
    const totalEps  = entries.reduce((s, e) => s + e.episodesSeen, 0)
    // Estimate: average anime episode is ~24 min
    const totalHrs  = Math.round(totalEps * 24 / 60)
    const scores    = entries.filter(e => e.score !== null).map(e => e.score as number)
    const avgScore  = scores.length
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : "—"

    // Genre breakdown — count genres across all list entries
    const genreCount: Record<string, number> = {}
    for (const e of entries) {
      for (const g of (e.anime?.genres ?? [])) {
        genreCount[g] = (genreCount[g] ?? 0) + 1
      }
    }
    const sortedGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
    const totalGenreCount = sortedGenres.reduce((s, [, c]) => s + c, 0) || 1

    const genreData = sortedGenres.map(([genre, count], i) => ({
      genre,
      count,
      pct: Math.round((count / totalGenreCount) * 100),
      color: GENRE_COLOURS[i] ?? "bg-white/20",
    }))

    // Top studios — count studios across all list entries
    const studioCount: Record<string, number> = {}
    for (const e of entries) {
      for (const s of (e.anime?.studios ?? [])) {
        studioCount[s] = (studioCount[s] ?? 0) + 1
      }
    }
    const topStudios = Object.entries(studioCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        // Estimate hours: count × avg 24min × 12 eps per anime
        hours: Math.round(count * 24 * 12 / 60),
      }))

    const maxStudioHours = topStudios[0]?.hours || 1

    return {
      totalHrs,
      totalEps,
      completed,
      avgScore,
      total: entries.length,
      genreData,
      topStudios,
      maxStudioHours,
    }
  }, [listData])

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 pb-32 space-y-10">

      {/* Header */}
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-2">Viewing Analytics</p>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">
          Watch Stats<span style={{color:"#f59e0b"}}>.</span>
        </h1>
        <p className="text-white/35 text-sm mt-1">Your complete anime viewing history</p>
      </div>

      {/* Hero numbers — real data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Clock,        value: `${stats.totalHrs.toLocaleString()}h`, label: "Total Hours",      color: "text-amber-400",   bg: "bg-amber-500/10"   },
          { icon: BarChart2,    value: stats.totalEps.toLocaleString(),        label: "Episodes Watched", color: "text-blue-400",    bg: "bg-blue-500/10"    },
          { icon: CheckCircle2, value: stats.completed.toLocaleString(),       label: "Completed",        color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { icon: Star,         value: stats.avgScore,                         label: "Avg Score",        color: "text-amber-400",   bg: "bg-amber-500/10"   },
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

      {/* Monthly bar chart — visual placeholder (no per-month tracking yet) */}
      <div className="p-7 rounded-[2rem] bg-[#0a0a0a] border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/50">Monthly Hours — 2024</h2>
            <p className="text-[9px] text-white/20 mt-0.5">Visual overview — per-month tracking coming soon</p>
          </div>
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
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg min-h-[2px]"
                />
              </div>
              <span className="text-[8px] text-white/30 uppercase">{MONTHS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Genre breakdown — real data from list entries */}
        <div className="p-7 rounded-[2rem] bg-[#0a0a0a] border border-white/5 space-y-5">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/50">Genre Breakdown</h2>

          {stats.genreData.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">No data yet</p>
              <Link href="/bestanimelist" className="mt-2 block text-[9px] text-amber-400 hover:text-amber-300 font-black uppercase tracking-widest">
                Add Anime to List →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.genreData.map((g, i) => (
                <motion.div key={g.genre} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.07 }}
                  className="space-y-1.5"
                >
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white/60">{g.genre}</span>
                    <span className="text-white/30 font-mono">{g.count} anime · {g.pct}%</span>
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
          )}
        </div>

        {/* Top studios — real data from list entries */}
        <div className="p-7 rounded-[2rem] bg-[#0a0a0a] border border-white/5 space-y-5">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/50">Top Studios</h2>

          {stats.topStudios.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">No data yet</p>
              <Link href="/bestanimelist" className="mt-2 block text-[9px] text-amber-400 hover:text-amber-300 font-black uppercase tracking-widest">
                Add Anime to List →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topStudios.map((s, i) => (
                <motion.div key={s.name} initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.08 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5"
                >
                  <span className="text-sm font-black text-white/20 w-5 shrink-0">#{i+1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-black text-white/80">{s.name}</p>
                    <p className="text-[9px] text-white/30">{s.count} anime · ~{s.hours}h</p>
                  </div>
                  <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width:0 }}
                      animate={{ width:`${(s.hours / stats.maxStudioHours) * 100}%` }}
                      transition={{ delay: i*0.08+0.2, duration:0.6 }}
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-center gap-4">
        <Link href="/watchlist" className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-xs font-black uppercase tracking-widest text-white transition-all">
          View Watchlist
        </Link>
        <Link href="/profile/wrapped" className="px-6 py-3 rounded-2xl border border-white/10 bg-white/[0.03] text-xs font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/[0.06] transition-all">
          2024 Wrapped 🎉
        </Link>
      </div>
    </div>
  )
}
