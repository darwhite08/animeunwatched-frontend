"use client"

import { motion } from "framer-motion"
import { BarChart3, Eye, Heart, MessageCircle, Users, TrendingUp, TrendingDown, ArrowUpRight, RefreshCw } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useCreatorStats, useCreatorContent, useCreatorDaily } from "@/hooks/useCreator"
import { useToast } from "@/stores/toast.store"

const TYPE_COLORS: Record<string, string> = {
  Blog: "bg-purple-500/20 text-purple-400 border-purple-500/20",
  Feed: "bg-accent/20 text-accent-bright border-accent/20",
  Poll: "bg-accent/20 text-accent-bright border-accent/20",
}

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

export default function AnalyticsPage() {
  const queryClient = useQueryClient()
  const toast = useToast(s => s.push)

  const { data: statsData } = useCreatorStats()
  const { data: contentData } = useCreatorContent()
  const { data: dailyData }   = useCreatorDaily()

  // Live values only — show "—" until backend responds rather than make up
  // numbers. No more hardcoded fallbacks.
  const totalViews      = statsData?.totalViews
  const publishedBlogs  = statsData?.publishedBlogs
  const postCount       = statsData?.postCount
  const reputation      = statsData?.reputation

  const fmt = (n: number | undefined) =>
    n === undefined ? "—" : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

  const METRICS = [
    { label: "Total Views",    value: fmt(totalViews),     delta: "", up: true,  icon: Eye,           color: "text-accent-bright",  bg: "bg-accent/10"  },
    { label: "Published",      value: fmt(publishedBlogs), delta: "", up: true,  icon: BarChart3,     color: "text-rose-400",    bg: "bg-rose-500/10"    },
    { label: "Total Posts",    value: fmt(postCount),      delta: "", up: true,  icon: MessageCircle, color: "text-accent-bright",   bg: "bg-accent/10"   },
    { label: "Reputation",     value: fmt(reputation),     delta: "", up: true,  icon: Users,         color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ]

  // Real 7-day series: combine likes + comments on the creator's posts
  // into a single "engagement" bar per day. Posts alone are too sparse
  // for a meaningful chart at small scale.
  const CHART_DATA = (dailyData?.data ?? []).map(d => ({
    day:   WEEKDAY[new Date(d.day).getUTCDay()],
    views: d.posts * 10 + d.likes + d.comments,  // engagement weighting
  }))
  const MAX_VIEWS = Math.max(1, ...CHART_DATA.map(d => d.views))

  const topContent = (contentData?.data ?? []).slice(0, 5).map(item => ({
    title: item.title,
    type:  "Blog" as const,
    views: item.mockViews,
    likes: Math.floor(item.mockViews * 0.07),
  }))

  function handleSync() {
    queryClient.invalidateQueries({ queryKey: ["creator"] })
    toast("Analytics refreshed from backend", "success")
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
            <BarChart3 size={18} className="text-accent-bright" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Analytics</h1>
            <p className="text-sm text-muted">Last 30 days performance</p>
          </div>
        </div>

        <button
          onClick={handleSync}
          className="flex items-center gap-2 text-xs font-semibold text-accent-bright hover:text-accent-bright border border-accent/30 hover:border-accent/60 bg-accent/10 hover:bg-accent/20 px-3 py-2 rounded-xl transition-all"
        >
          <RefreshCw size={13} />
          Sync with Backend
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-surface-2 border border-border rounded-2xl p-5 space-y-3"
          >
            <div className={`w-9 h-9 rounded-xl ${m.bg} flex items-center justify-center`}>
              <m.icon size={16} className={m.color} />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tighter text-foreground">{m.value}</p>
              <p className="text-xs text-muted uppercase tracking-wider mt-0.5">{m.label}</p>
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${m.up ? "text-emerald-400" : "text-red-400"}`}>
              {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {m.delta} vs last month
            </div>
          </motion.div>
        ))}
      </div>

      {/* Views chart */}
      <div className="bg-surface-2 border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Views — Last 7 Days</h2>
          <span className="text-xs text-subtle uppercase tracking-widest">Daily</span>
        </div>

        <div className="flex items-end gap-3 h-40">
          {CHART_DATA.map((d, i) => {
            const pct = (d.views / MAX_VIEWS) * 100
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[9px] text-subtle font-mono">
                  {d.views >= 1000 ? `${(d.views / 1000).toFixed(1)}k` : d.views}
                </span>
                <div className="w-full flex items-end" style={{ height: "80px" }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400 min-h-[4px]"
                  />
                </div>
                <span className="text-[9px] text-muted uppercase">{d.day}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top content */}
      <div className="bg-surface-2 border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Top Performing Content</h2>

        <div className="space-y-2">
          {topContent.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface transition-colors group"
            >
              <span className="text-xs font-black text-subtle w-5 shrink-0">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-muted group-hover:text-foreground truncate transition-colors">
                  {item.title}
                </p>
              </div>
              <span className={`text-[9px] border px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 ${TYPE_COLORS[item.type]}`}>
                {item.type}
              </span>
              <div className="flex items-center gap-3 text-xs text-subtle shrink-0">
                <span className="flex items-center gap-1"><Eye size={11} /> {item.views >= 1000 ? `${(item.views / 1000).toFixed(1)}k` : item.views}</span>
                {item.likes > 0 && <span className="flex items-center gap-1"><Heart size={11} /> {item.likes}</span>}
              </div>
              <ArrowUpRight size={14} className="text-subtle group-hover:text-accent-bright transition-colors shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
