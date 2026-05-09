"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, Star, Zap, BookOpen, BarChart3 } from "lucide-react"
import CreatorDashboard from "@/components/creator/creator/CreatorDashboard"
import { useCreatorStats } from "@/hooks/useCreator"

// Fallback 7-day chart data
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

export default function BlogPage() {
  const { data: statsData } = useCreatorStats()

  const totalViews     = statsData?.totalViews     ?? 24800
  const publishedBlogs = statsData?.publishedBlogs ?? 2
  const reputation     = statsData?.reputation      ?? 840
  // XP Level derived from reputation (every 500 rep = 1 level)
  const xpLevel        = Math.floor(reputation / 500) + 1

  const STAT_BAR = [
    { label: "Total Views",     value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : String(totalViews), icon: Eye,      color: "text-indigo-400",  bg: "bg-indigo-500/10"  },
    { label: "Published Blogs", value: String(publishedBlogs), icon: BookOpen, color: "text-rose-400",    bg: "bg-rose-500/10"    },
    { label: "Reputation",      value: String(reputation),     icon: Star,     color: "text-amber-400",   bg: "bg-amber-500/10"   },
    { label: "XP Level",        value: `Lv. ${xpLevel}`,       icon: Zap,      color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ]

  return (
    <main className="min-h-screen bg-black text-white flex">
      <div className="flex gap-8 w-full mx-auto">

        {/* Main Content */}
        <div className="flex-1 space-y-12 py-10">

          {/* Hub header with analytics link */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-indigo-400/60 mb-1">
                Creator Hub
              </p>
              <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                Your Studio
              </h1>
            </div>
            <Link
              href="/creators/analytics"
              className="flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-600/10 hover:bg-indigo-600/20 px-4 py-2 rounded-xl transition-all"
            >
              <BarChart3 size={15} />
              View Analytics →
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {STAT_BAR.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-zinc-900 border border-white/10 rounded-2xl p-4 flex items-center gap-4"
              >
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon size={16} className={s.color} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-black tracking-tighter text-white">{s.value}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider truncate">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ORIGINAL DASHBOARD (UNCHANGED) */}
          <CreatorDashboard />

          {/* ===== POLL SECTION ===== */}
          <SectionHeader
            title="Your Polls"
            href="/creator/polls"
          />

          <div className="grid md:grid-cols-3 gap-6">
            <ContentCard title="Best New Gen MC?" type="Poll" />
            <ContentCard title="Strongest Hashira?" type="Poll" />
            <ContentCard title="Best Anime of 2024?" type="Poll" />
          </div>

          {/* Recent Performance mini-chart */}
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Recent Performance</h2>
              <Link
                href="/creators/analytics"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                Full Analytics →
              </Link>
            </div>

            <div className="flex items-end gap-3 h-28">
              {CHART_DATA.map((d, i) => {
                const pct = (d.views / MAX_VIEWS) * 100
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end" style={{ height: "64px" }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                        className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-400 min-h-[4px]"
                      />
                    </div>
                    <span className="text-[9px] text-white/40 uppercase">{d.day}</span>
                  </div>
                )
              })}
            </div>

            <p className="text-xs text-white/30">
              Views — last 7 days
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}

/* ========================= */

function SectionHeader({
  title,
  href,
}: {
  title: string
  href: string
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Link
        href={href}
        className="text-sm text-indigo-400 hover:text-indigo-300 transition"
      >
        View All →
      </Link>
    </div>
  )
}

function ContentCard({
  title,
  type,
}: {
  title: string
  type: "Feed" | "Blog" | "Poll"
}) {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 hover:border-indigo-500 transition cursor-pointer">
      <span className="text-xs bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full">
        {type}
      </span>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="text-sm text-white/50 mt-2">
        1.2k views • 54 interactions
      </p>
    </div>
  )
}
