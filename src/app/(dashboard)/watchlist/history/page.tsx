"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MonitorPlay, ChevronRight, CalendarDays, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/stores/auth.store"
import { useUserList } from "@/hooks/useLists"
import { useMemo } from "react"

// ─── Mock data ────────────────────────────────────────────────────────────────

const now = new Date()
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000)
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000)

interface EpisodeEntry {
  id: number
  animeTitle: string
  animeId: string
  episode: string
  watchedAt: Date
  duration: string
  platform: string
  coverGradient: string
}

const EPISODE_LOG: EpisodeEntry[] = [
  { id: 1,  animeTitle: "Frieren: Beyond Journey's End",        animeId: "frieren",                        episode: "Episode 28",        watchedAt: hoursAgo(1),  duration: "24m", platform: "Crunchyroll", coverGradient: "from-emerald-900 to-emerald-950" },
  { id: 2,  animeTitle: "Frieren: Beyond Journey's End",        animeId: "frieren",                        episode: "Episode 27",        watchedAt: hoursAgo(2),  duration: "24m", platform: "Crunchyroll", coverGradient: "from-emerald-900 to-emerald-950" },
  { id: 3,  animeTitle: "Jujutsu Kaisen",                       animeId: "jujutsu-kaisen",                 episode: "Season 2 · E13",    watchedAt: hoursAgo(5),  duration: "24m", platform: "Crunchyroll", coverGradient: "from-indigo-900 to-indigo-950"   },
  { id: 4,  animeTitle: "Chainsaw Man",                         animeId: "chainsaw-man",                   episode: "Episode 11",        watchedAt: hoursAgo(9),  duration: "24m", platform: "Crunchyroll", coverGradient: "from-red-900 to-red-950"          },
  { id: 5,  animeTitle: "Demon Slayer: Kimetsu no Yaiba",       animeId: "demon-slayer",                   episode: "Season 4 · E02",    watchedAt: daysAgo(1),   duration: "45m", platform: "Netflix",     coverGradient: "from-orange-900 to-orange-950"   },
  { id: 6,  animeTitle: "Solo Leveling",                        animeId: "solo-leveling",                  episode: "Episode 12",        watchedAt: daysAgo(1),   duration: "24m", platform: "Crunchyroll", coverGradient: "from-violet-900 to-violet-950"   },
  { id: 7,  animeTitle: "Attack on Titan",                      animeId: "attack-on-titan",                episode: "Season 4 Final",    watchedAt: daysAgo(2),   duration: "87m", platform: "Crunchyroll", coverGradient: "from-slate-800 to-slate-900"      },
  { id: 8,  animeTitle: "Steins;Gate",                          animeId: "steins-gate",                    episode: "Episode 24",        watchedAt: daysAgo(3),   duration: "24m", platform: "Funimation",  coverGradient: "from-sky-900 to-sky-950"          },
  { id: 9,  animeTitle: "Death Note",                           animeId: "death-note",                     episode: "Episode 19",        watchedAt: daysAgo(4),   duration: "24m", platform: "Netflix",     coverGradient: "from-neutral-900 to-black"        },
  { id: 10, animeTitle: "One Punch Man",                        animeId: "one-punch-man",                  episode: "Episode 08",        watchedAt: daysAgo(5),   duration: "24m", platform: "Netflix",     coverGradient: "from-yellow-900 to-yellow-950"   },
  { id: 11, animeTitle: "Spy x Family",                         animeId: "spy-x-family",                   episode: "Season 2 · E05",    watchedAt: daysAgo(7),   duration: "24m", platform: "Crunchyroll", coverGradient: "from-pink-900 to-pink-950"        },
  { id: 12, animeTitle: "Hunter x Hunter (2011)",               animeId: "hunter-x-hunter-2011",           episode: "Episode 131",       watchedAt: daysAgo(10),  duration: "24m", platform: "Crunchyroll", coverGradient: "from-teal-900 to-teal-950"        },
  { id: 13, animeTitle: "Cowboy Bebop",                         animeId: "cowboy-bebop",                   episode: "Session 24",        watchedAt: daysAgo(14),  duration: "24m", platform: "Funimation",  coverGradient: "from-amber-900 to-amber-950"     },
  { id: 14, animeTitle: "Neon Genesis Evangelion",              animeId: "neon-genesis-evangelion",        episode: "Episode 26",        watchedAt: daysAgo(20),  duration: "24m", platform: "Netflix",     coverGradient: "from-purple-900 to-purple-950"   },
  { id: 15, animeTitle: "Fullmetal Alchemist: Brotherhood",     animeId: "fullmetal-alchemist-brotherhood",episode: "Episode 64",        watchedAt: daysAgo(28),  duration: "24m", platform: "Netflix",     coverGradient: "from-blue-900 to-blue-950"        },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRelativeDay(date: Date): string {
  const daysDiff = Math.floor((now.getTime() - date.getTime()) / 86_400_000)
  if (daysDiff === 0) return "Today"
  if (daysDiff === 1) return "Yesterday"
  return `${daysDiff} days ago`
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

const PLATFORM_COLOR: Record<string, string> = {
  Crunchyroll: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  Netflix:     "bg-red-600/15 text-red-400 border-red-600/20",
  Funimation:  "bg-violet-600/15 text-violet-400 border-violet-600/20",
  Prime:       "bg-blue-500/15 text-blue-400 border-blue-500/20",
}

// ─── GitHub-style calendar ────────────────────────────────────────────────────

/** Build a map of day-offset → episode count for the last 30 days */
function buildCalendarMap(): Map<number, number> {
  const map = new Map<number, number>()
  for (let i = 0; i < 30; i++) map.set(i, 0)
  for (const entry of EPISODE_LOG) {
    const daysDiff = Math.floor((now.getTime() - entry.watchedAt.getTime()) / 86_400_000)
    if (daysDiff >= 0 && daysDiff < 30) {
      map.set(daysDiff, (map.get(daysDiff) ?? 0) + 1)
    }
  }
  return map
}

function calColor(count: number): string {
  if (count === 0) return "bg-white/5 border-white/5"
  if (count === 1) return "bg-amber-900/70 border-indigo-700/30"
  if (count === 2) return "bg-amber-700/80 border-amber-500/30"
  return "bg-amber-500 border-indigo-400/50"
}

function CalendarGrid() {
  const calMap = buildCalendarMap()
  // Days 0-29 in reverse order so index 0 = today, shown left→right oldest→newest
  const days = Array.from({ length: 30 }, (_, i) => 29 - i)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CalendarDays size={13} className="text-amber-400" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
          Last 30 Days
        </h3>
        <div className="flex-1 h-px bg-white/5" />
        <div className="flex items-center gap-1.5 text-[9px] text-white/20 font-bold">
          <span className="w-3 h-3 rounded-sm bg-white/5 border border-white/5 inline-block" /> 0
          <span className="w-3 h-3 rounded-sm bg-amber-900/70 border-indigo-700/30 inline-block ml-2" /> 1
          <span className="w-3 h-3 rounded-sm bg-amber-700/80 border-amber-500/30 inline-block ml-2" /> 2
          <span className="w-3 h-3 rounded-sm bg-amber-500 border-indigo-400/50 inline-block ml-2" /> 3+
        </div>
      </div>
      <div className="grid grid-cols-[repeat(30,1fr)] gap-1">
        {days.map((dayOffset) => {
          const count = calMap.get(dayOffset) ?? 0
          const date = daysAgo(dayOffset)
          const label = `${date.toLocaleDateString([], { month: "short", day: "numeric" })}: ${count} ep${count !== 1 ? "s" : ""}`
          return (
            <div
              key={dayOffset}
              title={label}
              className={`aspect-square rounded-sm border transition-all hover:scale-125 cursor-default ${calColor(count)}`}
            />
          )
        })}
      </div>
      <div className="flex justify-between text-[9px] text-white/20 font-bold">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  )
}

// ─── Episode row ──────────────────────────────────────────────────────────────

function EpisodeRow({ entry, index }: { entry: EpisodeEntry; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group"
    >
      {/* Cover thumbnail */}
      <div className={`relative w-10 h-12 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br ${entry.coverGradient} flex items-center justify-center`}>
        <MonitorPlay size={14} className="text-white/30" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-white uppercase italic tracking-tight truncate">
          {entry.animeTitle}
        </p>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
          {entry.episode}
        </p>
      </div>

      {/* Time */}
      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
        <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">
          {formatTime(entry.watchedAt)}
        </span>
        <span className="text-[9px] font-black text-white/15 flex items-center gap-1">
          <Clock size={9} /> {entry.duration}
        </span>
      </div>

      {/* Platform badge */}
      <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0 ${
        PLATFORM_COLOR[entry.platform] ?? "bg-white/5 text-white/30 border-white/10"
      }`}>
        {entry.platform}
      </span>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WatchlistHistoryPage() {
  const user = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "")

  const realStats = useMemo(() => {
    const entries = listData?.data ?? []
    const totalEps = entries.reduce((s, e) => s + e.episodesSeen, 0)
    const recentEntries = entries.filter(e => e.status === "WATCHING" || e.status === "COMPLETED")
    return { thisWeek: recentEntries.slice(0, 3).length, thisMonth: recentEntries.length, total: totalEps || 3842 }
  }, [listData])

  const thisWeek = realStats.thisWeek || EPISODE_LOG.filter((e) => {
    const diff = (now.getTime() - e.watchedAt.getTime()) / 86_400_000
    return diff <= 7
  }).length

  const thisMonth = realStats.thisMonth || EPISODE_LOG.filter((e) => {
    const diff = (now.getTime() - e.watchedAt.getTime()) / 86_400_000
    return diff <= 30
  }).length

  const total = realStats.total

  // Group by relative day
  const grouped = EPISODE_LOG.reduce<Map<string, EpisodeEntry[]>>((map, entry) => {
    const label = getRelativeDay(entry.watchedAt)
    const existing = map.get(label) ?? []
    map.set(label, [...existing, entry])
    return map
  }, new Map())

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 pb-32 space-y-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/25">
        <Link href="/watchlist" className="hover:text-amber-400 transition-colors">
          Watchlist
        </Link>
        <ChevronRight size={11} className="text-white/15" />
        <span className="text-white/50">Episode History</span>
      </nav>

      {/* Header */}
      <header className="space-y-3">
        <motion.p
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-amber-400 font-black uppercase tracking-[0.4em] text-[10px]"
        >
          <MonitorPlay size={13} /> Episode Log
        </motion.p>
        <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white italic leading-none">
          Episode<span style={{color:"#f59e0b"}}>.</span>
          <br />
          <span className="text-white/20">History</span>
        </h1>
      </header>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: "This Week",  value: thisWeek,  icon: <TrendingUp size={14} />,  color: "text-amber-400" },
          { label: "This Month", value: thisMonth, icon: <CalendarDays size={14} />, color: "text-violet-400" },
          { label: "All Time",   value: total.toLocaleString(), icon: <MonitorPlay size={14} />, color: "text-amber-400" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className={`flex items-center gap-2 ${color} mb-2`}>
              {icon}
              <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                {label}
              </span>
            </div>
            <p className="text-2xl font-black text-white italic">{value}</p>
          </div>
        ))}
      </motion.div>

      {/* Calendar heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
      >
        <CalendarGrid />
      </motion.div>

      {/* Episode list */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
            Episode Log
          </h2>
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[9px] font-black text-white/15 uppercase tracking-widest">
            {EPISODE_LOG.length} entries
          </span>
        </div>

        <AnimatePresence>
          {Array.from(grouped.entries()).map(([dayLabel, dayEntries]) => (
            <div key={dayLabel}>
              {/* Day label */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                  {dayLabel}
                </span>
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[9px] font-black text-white/15 uppercase tracking-widest">
                  {dayEntries.length} ep
                </span>
              </div>

              <div className="space-y-2">
                {dayEntries.map((entry, i) => (
                  <EpisodeRow key={entry.id} entry={entry} index={i} />
                ))}
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Back link */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
        <Link
          href="/watchlist"
          className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white/30 hover:text-amber-400 transition-colors"
        >
          ← Back to Watchlist
        </Link>
      </div>
    </div>
  )
}
