"use client"

import { motion } from "framer-motion"
import { Clock, BarChart2, TrendingUp, Star, Zap, Award, Calendar, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/stores/auth.store"
import { useUserList } from "@/hooks/useLists"
import { useMemo } from "react"

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

/* ── Colour palette for genre bars ── */
const GENRE_COLOURS = [
  "bg-accent",
  "bg-accent-bright",
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

    // Monthly hours for the current year — derived from updatedAt of
    // entries. Approximation but uses only real signals: each entry's
    // episodes are attributed to the month of its most recent update.
    const thisYear = new Date().getFullYear()
    const monthlyHours = new Array(12).fill(0) as number[]
    for (const e of entries) {
      const d = new Date(e.updatedAt)
      if (d.getFullYear() !== thisYear) continue
      monthlyHours[d.getMonth()] += Math.round(e.episodesSeen * 24 / 60)
    }
    const maxMonth = Math.max(1, ...monthlyHours)

    return {
      totalHrs,
      totalEps,
      completed,
      avgScore,
      total: entries.length,
      genreData,
      topStudios,
      maxStudioHours,
      monthlyHours,
      maxMonth,
      thisYear,
    }
  }, [listData])

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 pb-32 space-y-10">

      {/* Header */}
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-2">Viewing Analytics</p>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">
          Watch Stats<span style={{color:"var(--app-accent)"}}>.</span>
        </h1>
        <p className="text-subtle text-sm mt-1">Your complete anime viewing history</p>
      </div>

      {/* Hero numbers — real data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Clock,        value: `${stats.totalHrs.toLocaleString()}h`, label: "Total Hours",      color: "text-accent-bright",   bg: "bg-accent/10"   },
          { icon: BarChart2,    value: stats.totalEps.toLocaleString(),        label: "Episodes Watched", color: "text-blue-400",    bg: "bg-blue-500/10"    },
          { icon: CheckCircle2, value: stats.completed.toLocaleString(),       label: "Completed",        color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { icon: Star,         value: stats.avgScore,                         label: "Avg Score",        color: "text-accent-bright",   bg: "bg-accent/10"   },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
            className="p-6 rounded-[2rem] bg-surface border border-border space-y-3"
          >
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon size={17} className={s.color} />
            </div>
            <div>
              <p className="text-3xl font-black tracking-tighter text-foreground">{s.value}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-subtle mt-0.5">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly bar chart — derived from your list entries' updatedAt */}
      <div className="p-7 rounded-[2rem] bg-surface border border-border space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-muted">Monthly Hours — {stats.thisYear}</h2>
            <p className="text-[9px] text-subtle mt-0.5">Episodes × 24 min, bucketed by last-update month</p>
          </div>
          <span className="text-xs text-subtle font-mono">
            {stats.monthlyHours.reduce((a, b) => a + b, 0)}h total
          </span>
        </div>
        <div className="flex items-end gap-2 h-36">
          {stats.monthlyHours.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[8px] font-mono text-subtle">{h}</span>
              <div className="w-full relative" style={{ height:"100px" }}>
                <motion.div
                  initial={{ height:0 }}
                  animate={{ height:`${(h / stats.maxMonth) * 100}%` }}
                  transition={{ delay: i*0.04, duration:0.6, ease:"easeOut" }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-accent to-accent-bright rounded-t-lg min-h-[2px]"
                />
              </div>
              <span className="text-[8px] text-subtle uppercase">{MONTHS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Genre breakdown — real data from list entries */}
        <div className="p-7 rounded-[2rem] bg-surface border border-border space-y-5">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-muted">Genre Breakdown</h2>

          {stats.genreData.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-[10px] text-subtle font-black uppercase tracking-widest">No data yet</p>
              <Link href="/bestanimelist" className="mt-2 block text-[9px] text-accent-bright hover:text-foreground font-black uppercase tracking-widest">
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
                    <span className="font-bold text-muted">{g.genre}</span>
                    <span className="text-subtle font-mono">{g.count} anime · {g.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
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
        <div className="p-7 rounded-[2rem] bg-surface border border-border space-y-5">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-muted">Top Studios</h2>

          {stats.topStudios.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-[10px] text-subtle font-black uppercase tracking-widest">No data yet</p>
              <Link href="/bestanimelist" className="mt-2 block text-[9px] text-accent-bright hover:text-foreground font-black uppercase tracking-widest">
                Add Anime to List →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topStudios.map((s, i) => (
                <motion.div key={s.name} initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.08 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-border"
                >
                  <span className="text-sm font-black text-subtle w-5 shrink-0">#{i+1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-black text-muted">{s.name}</p>
                    <p className="text-[9px] text-subtle">{s.count} anime · ~{s.hours}h</p>
                  </div>
                  <div className="w-20 h-1.5 bg-surface rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width:0 }}
                      animate={{ width:`${(s.hours / stats.maxStudioHours) * 100}%` }}
                      transition={{ delay: i*0.08+0.2, duration:0.6 }}
                      className="h-full bg-accent rounded-full"
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
        <Link href="/watchlist" className="px-6 py-3 rounded-2xl bg-accent hover:bg-accent-bright text-xs font-black uppercase tracking-widest text-foreground transition-all">
          View Watchlist
        </Link>
        <Link href="/profile/wrapped" className="px-6 py-3 rounded-2xl border border-border bg-surface text-xs font-black uppercase tracking-widest text-muted hover:text-foreground hover:bg-surface transition-all">
          2024 Wrapped 🎉
        </Link>
      </div>
    </div>
  )
}
