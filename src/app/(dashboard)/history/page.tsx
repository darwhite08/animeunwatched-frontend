"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  History,
  Search,
  Trash2,
  X,
  Clock,
  Play,
  MonitorPlay,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { useUserList } from "@/hooks/useLists"
import { ui } from "@/lib/design/tokens"

// ─── Types ────────────────────────────────────────────────────────────────────

interface HistoryEntry {
  id: number
  animeTitle: string
  animeId: string
  episode: string
  watchedAt: Date
  duration: string
  platform: string
  coverGradient: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const now = new Date()
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000)
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000)

const HISTORY_ENTRIES: HistoryEntry[] = [
  {
    id: 1,
    animeTitle: "Frieren: Beyond Journey's End",
    animeId: "frieren",
    episode: "Episode 28",
    watchedAt: hoursAgo(1),
    duration: "24m",
    platform: "Crunchyroll",
    coverGradient: "from-emerald-900 to-emerald-950",
  },
  {
    id: 2,
    animeTitle: "Jujutsu Kaisen",
    animeId: "jujutsu-kaisen",
    episode: "Season 2 · E13",
    watchedAt: hoursAgo(3),
    duration: "24m",
    platform: "Crunchyroll",
    coverGradient: "from-indigo-900 to-indigo-950",
  },
  {
    id: 3,
    animeTitle: "Chainsaw Man",
    animeId: "chainsaw-man",
    episode: "Episode 11",
    watchedAt: hoursAgo(8),
    duration: "24m",
    platform: "Crunchyroll",
    coverGradient: "from-red-900 to-red-950",
  },
  {
    id: 4,
    animeTitle: "Demon Slayer: Kimetsu no Yaiba",
    animeId: "demon-slayer",
    episode: "Season 4 · E02",
    watchedAt: daysAgo(1),
    duration: "45m",
    platform: "Netflix",
    coverGradient: "from-orange-900 to-orange-950",
  },
  {
    id: 5,
    animeTitle: "Solo Leveling",
    animeId: "solo-leveling",
    episode: "Episode 12",
    watchedAt: daysAgo(1),
    duration: "24m",
    platform: "Crunchyroll",
    coverGradient: "from-violet-900 to-violet-950",
  },
  {
    id: 6,
    animeTitle: "Attack on Titan",
    animeId: "attack-on-titan",
    episode: "Season 4 Final",
    watchedAt: daysAgo(2),
    duration: "87m",
    platform: "Crunchyroll",
    coverGradient: "from-slate-800 to-slate-900",
  },
  {
    id: 7,
    animeTitle: "Steins;Gate",
    animeId: "steins-gate",
    episode: "Episode 24",
    watchedAt: daysAgo(2),
    duration: "24m",
    platform: "Funimation",
    coverGradient: "from-sky-900 to-sky-950",
  },
  {
    id: 8,
    animeTitle: "Death Note",
    animeId: "death-note",
    episode: "Episode 19",
    watchedAt: daysAgo(3),
    duration: "24m",
    platform: "Netflix",
    coverGradient: "from-neutral-900 to-black",
  },
  {
    id: 9,
    animeTitle: "One Punch Man",
    animeId: "one-punch-man",
    episode: "Episode 08",
    watchedAt: daysAgo(5),
    duration: "24m",
    platform: "Netflix",
    coverGradient: "from-yellow-900 to-yellow-950",
  },
  {
    id: 10,
    animeTitle: "Spy x Family",
    animeId: "spy-x-family",
    episode: "Season 2 · E05",
    watchedAt: daysAgo(7),
    duration: "24m",
    platform: "Crunchyroll",
    coverGradient: "from-pink-900 to-pink-950",
  },
  {
    id: 11,
    animeTitle: "Hunter x Hunter (2011)",
    animeId: "hunter-x-hunter-2011",
    episode: "Episode 131",
    watchedAt: daysAgo(10),
    duration: "24m",
    platform: "Crunchyroll",
    coverGradient: "from-teal-900 to-teal-950",
  },
  {
    id: 12,
    animeTitle: "Cowboy Bebop",
    animeId: "cowboy-bebop",
    episode: "Session 24",
    watchedAt: daysAgo(14),
    duration: "24m",
    platform: "Funimation",
    coverGradient: "from-amber-900 to-amber-950",
  },
  {
    id: 13,
    animeTitle: "Neon Genesis Evangelion",
    animeId: "neon-genesis-evangelion",
    episode: "Episode 26",
    watchedAt: daysAgo(18),
    duration: "24m",
    platform: "Netflix",
    coverGradient: "from-purple-900 to-purple-950",
  },
  {
    id: 14,
    animeTitle: "Mob Psycho 100",
    animeId: "mob-psycho-100",
    episode: "Season 3 · E05",
    watchedAt: daysAgo(22),
    duration: "24m",
    platform: "Crunchyroll",
    coverGradient: "from-cyan-900 to-cyan-950",
  },
  {
    id: 15,
    animeTitle: "Fullmetal Alchemist: Brotherhood",
    animeId: "fullmetal-alchemist-brotherhood",
    episode: "Episode 64",
    watchedAt: daysAgo(28),
    duration: "24m",
    platform: "Netflix",
    coverGradient: "from-blue-900 to-blue-950",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRelativeDay(date: Date): string {
  const daysDiff = Math.floor(
    (now.getTime() - date.getTime()) / 86_400_000
  )
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const { push } = useToast()
  const user = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "")

  // Build history from real list entries (episodes seen = watching history proxy)
  const apiHistory: HistoryEntry[] = (listData?.data ?? [])
    .filter(e => e.episodesSeen > 0 || e.status === "COMPLETED")
    .slice(0, 15)
    .map((e, i) => ({
      id: e.id as unknown as number,
      animeTitle: e.anime?.title ?? "Unknown",
      animeId: String(e.anime?.malId ?? ""),
      episode: e.status === "COMPLETED" ? `Completed (${e.episodesSeen} eps)` : `Ep. ${e.episodesSeen}`,
      watchedAt: new Date(e.updatedAt),
      duration: "24 min",
      platform: "Kaiveron",
      coverGradient: `from-indigo-${6 + (i % 4) * 100}/30 to-purple-${6 + (i % 3) * 100}/20`,
    }))

  // Realtime: keep local entries in sync with the API. When listData
  // refetches (e.g. after the user logs an episode), this re-derives.
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set())
  const entries = apiHistory.filter(e => !removedIds.has(e.id))
  const setEntries = (updater: (prev: HistoryEntry[]) => HistoryEntry[]) => {
    const next = updater(entries)
    const removed = new Set(
      apiHistory.filter(e => !next.find(n => n.id === e.id)).map(e => e.id),
    )
    setRemovedIds(removed)
  }
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    if (!query.trim()) return entries
    const q = query.toLowerCase()
    return entries.filter((e) => e.animeTitle.toLowerCase().includes(q))
  }, [entries, query])

  // Group by relative day label
  const grouped = useMemo(() => {
    const map = new Map<string, HistoryEntry[]>()
    for (const entry of filtered) {
      const label = getRelativeDay(entry.watchedAt)
      const existing = map.get(label) ?? []
      map.set(label, [...existing, entry])
    }
    return map
  }, [filtered])

  // Stats
  const totalEpisodes = entries.length
  const totalMinutes = entries.reduce((acc, e) => {
    const mins = parseInt(e.duration, 10)
    return acc + (isNaN(mins) ? 0 : mins)
  }, 0)
  const totalHours = (totalMinutes / 60).toFixed(1)
  const thisWeek = entries.filter((e) => {
    const diff = (now.getTime() - e.watchedAt.getTime()) / 86_400_000
    return diff <= 7
  }).length
  const avgSession =
    entries.length > 0
      ? Math.round(totalMinutes / entries.length) + "m"
      : "0m"

  const handleClearAll = () => {
    setEntries(() => [])
    push("Watch history cleared (local view only)", "info")
  }

  return (
    <div className={`max-w-5xl mx-auto ${ui.screenX} py-8 sm:py-12 pb-32 space-y-8 sm:space-y-10`}>
      {/* Header */}
      <header className="flex flex-row items-end justify-between gap-4">
        <div className="space-y-2 sm:space-y-3 min-w-0">
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-accent-bright font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[10px]"
          >
            <History size={13} /> Viewing Log
          </motion.p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-foreground italic leading-none">
            Watch<span style={{color:"var(--app-accent)"}}>.</span>
            <br />
            <span className="text-subtle">History</span>
          </h1>
        </div>

        <button
          onClick={handleClearAll}
          className={`shrink-0 flex items-center gap-2 px-4 sm:px-5 ${ui.touch} rounded-2xl border border-red-900/30 bg-red-950/20 text-red-400 hover:bg-red-900/30 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest`}
        >
          <Trash2 size={13} /> <span className="hidden sm:inline">Clear All</span>
        </button>
      </header>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { label: "Episodes Watched", value: totalEpisodes, icon: <MonitorPlay size={14} /> },
          { label: "Total Hours", value: `${totalHours}h`, icon: <Clock size={14} /> },
          { label: "This Week", value: thisWeek, icon: <History size={14} /> },
          { label: "Avg Session", value: avgSession, icon: <Play size={14} /> },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <div className="flex items-center gap-2 text-accent-bright mb-2">
              {icon}
              <span className="text-[9px] font-black uppercase tracking-widest text-subtle">
                {label}
              </span>
            </div>
            <p className="text-2xl font-black text-foreground italic">{value}</p>
          </div>
        ))}
      </motion.div>

      {/* Search + continue */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative group flex-1">
          <Search
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle group-focus-within:text-accent-bright transition-colors"
          />
          <input
            type="text"
            placeholder="Filter by anime name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-11 min-h-11 py-3 rounded-2xl bg-surface border border-border text-foreground placeholder:text-subtle focus:outline-none focus:border-accent/40 transition-all text-base sm:text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 ${ui.touch} grid place-items-center text-subtle hover:text-foreground active:scale-95 transition-all`}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <Link
          href="/watchlist"
          className={`flex items-center justify-center gap-2 px-6 ${ui.touch} rounded-2xl bg-accent hover:bg-accent-bright text-black font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all whitespace-nowrap`}
        >
          Continue Watching <ArrowRight size={13} />
        </Link>
      </div>

      {/* History grouped by day */}
      {entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 sm:py-32 px-6 text-center border border-dashed border-border rounded-3xl sm:rounded-[2rem]"
        >
          <div className="h-14 w-14 rounded-2xl bg-surface border border-border grid place-items-center mb-5 text-accent-bright">
            <History size={24} />
          </div>
          <p className="text-subtle font-black uppercase tracking-widest text-[11px] sm:text-xs">
            No watch history yet
          </p>
          <Link
            href="/watchlist"
            className={`mt-6 inline-flex items-center gap-2 px-5 ${ui.touch} rounded-2xl bg-accent text-black font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform`}
          >
            <Play size={14} /> Start Watching
          </Link>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center border border-dashed border-border rounded-3xl sm:rounded-[2rem]"
        >
          <p className="text-subtle font-black uppercase tracking-widest text-[11px] sm:text-xs">
            No results for &ldquo;{query}&rdquo;
          </p>
          <button
            onClick={() => setQuery("")}
            className={`mt-2 inline-flex items-center ${ui.touch} px-4 text-xs text-accent-bright hover:opacity-80 active:scale-95 font-black uppercase tracking-widest transition-all`}
          >
            Clear search
          </button>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([dayLabel, dayEntries]) => (
            <div key={dayLabel}>
              {/* Day label */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-black text-subtle uppercase tracking-widest">
                  {dayLabel}
                </span>
                <div className="flex-1 h-px bg-surface" />
                <span className="text-[9px] font-black text-subtle uppercase tracking-widest">
                  {dayEntries.length} ep
                </span>
              </div>

              {/* Entries */}
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {dayEntries.map((entry, i) => (
                    <HistoryEntryRow
                      key={entry.id}
                      entry={entry}
                      index={i}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Single history entry row ─────────────────────────────────────────────────

function HistoryEntryRow({
  entry,
  index,
}: {
  entry: HistoryEntry
  index: number
}) {
  const rowClass =
    "flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 min-h-11 rounded-2xl bg-surface border border-border hover:border-white/30 active:scale-[0.99] transition-all group"
  const inner = (
    <>
      {/* Cover thumbnail */}
      <div
        className={`relative w-11 h-14 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br ${entry.coverGradient}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <MonitorPlay size={16} className="text-subtle" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] sm:text-sm font-black text-foreground uppercase italic tracking-tight truncate group-hover:text-foreground transition-colors">
          {entry.animeTitle}
        </p>
        <p className="text-[10px] font-bold text-subtle uppercase tracking-widest mt-0.5 truncate">
          {entry.episode}
        </p>
      </div>

      {/* Time */}
      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
        <span className="text-[10px] font-black text-subtle uppercase tracking-widest">
          {formatTime(entry.watchedAt)}
        </span>
        <span className="text-[9px] font-black text-subtle flex items-center gap-1">
          <Clock size={9} /> {entry.duration}
        </span>
      </div>

      {/* Platform badge */}
      <span
        className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0 ${
          PLATFORM_COLOR[entry.platform] ??
          "bg-surface text-subtle border-border"
        }`}
      >
        {entry.platform}
      </span>
    </>
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ delay: index * 0.03 }}
    >
      {entry.animeId ? (
        <Link href={`/anime/${entry.animeId}`} className={rowClass}>{inner}</Link>
      ) : (
        <div className={rowClass}>{inner}</div>
      )}
    </motion.div>
  )
}
