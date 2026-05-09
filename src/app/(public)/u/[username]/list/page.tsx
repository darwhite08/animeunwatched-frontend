"use client"

import { use, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Star,
  Clock,
  Eye,
  Plus,
  SortAsc,
  BarChart2,
  CheckCircle2,
  PlayCircle,
  BookmarkPlus,
  PauseCircle,
} from "lucide-react"
import { ANIME_DB } from "@/lib/data/anime"
import { useToast } from "@/stores/toast.store"

/* ─────────────────────────────────────────────
   Types & constants
───────────────────────────────────────────── */
type WatchStatus = "Watching" | "Completed" | "Plan to Watch" | "On Hold"

type ListEntry = {
  animeId: string
  status: WatchStatus
  dateAdded: string
  episodesWatched: number
}

type SortKey = "name" | "rating" | "date"

const STATUS_COLORS: Record<WatchStatus, string> = {
  "Watching":       "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Completed":      "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  "Plan to Watch":  "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "On Hold":        "bg-rose-500/20 text-rose-400 border-rose-500/30",
}

const STATUS_ICONS: Record<WatchStatus, typeof PlayCircle> = {
  "Watching":       PlayCircle,
  "Completed":      CheckCircle2,
  "Plan to Watch":  BookmarkPlus,
  "On Hold":        PauseCircle,
}

/* 12 entries: 4 Watching, 4 Completed, 2 Plan to Watch, 2 On Hold */
const RAW_ENTRIES: ListEntry[] = [
  { animeId: "attack-on-titan",            status: "Watching",       dateAdded: "2024-10-01", episodesWatched: 62  },
  { animeId: "jujutsu-kaisen",             status: "Watching",       dateAdded: "2024-09-14", episodesWatched: 30  },
  { animeId: "chainsaw-man",               status: "Watching",       dateAdded: "2024-08-22", episodesWatched: 9   },
  { animeId: "demon-slayer",               status: "Watching",       dateAdded: "2024-07-05", episodesWatched: 28  },
  { animeId: "fullmetal-alchemist-brotherhood", status: "Completed", dateAdded: "2024-06-10", episodesWatched: 64  },
  { animeId: "steins-gate",                status: "Completed",      dateAdded: "2024-05-02", episodesWatched: 24  },
  { animeId: "hunter-x-hunter-2011",       status: "Completed",      dateAdded: "2024-04-18", episodesWatched: 148 },
  { animeId: "vinland-saga",               status: "Completed",      dateAdded: "2024-03-09", episodesWatched: 48  },
  { animeId: "frieren",                    status: "Plan to Watch",  dateAdded: "2024-11-12", episodesWatched: 0   },
  { animeId: "monster",                    status: "Plan to Watch",  dateAdded: "2024-11-01", episodesWatched: 0   },
  { animeId: "berserk-1997",               status: "On Hold",        dateAdded: "2024-02-14", episodesWatched: 12  },
  { animeId: "neon-genesis-evangelion",    status: "On Hold",        dateAdded: "2024-01-30", episodesWatched: 18  },
]

/* Join with ANIME_DB */
const LIST_DATA = RAW_ENTRIES.map((entry) => {
  const anime = ANIME_DB.find((a) => a.id === entry.animeId)!
  return { ...entry, anime }
}).filter((e) => e.anime !== undefined)

const ALL_STATUSES: WatchStatus[] = ["Watching", "Completed", "Plan to Watch", "On Hold"]

/* ─────────────────────────────────────────────
   Stats helpers
───────────────────────────────────────────── */
function calcHours(entries: typeof LIST_DATA): number {
  return Math.round(
    entries.reduce((sum, e) => {
      const eps = e.episodesWatched || e.anime.episodes || 0
      return sum + eps * 23.5 // avg min per ep → convert to hours
    }, 0) / 60,
  )
}

/* ─────────────────────────────────────────────
   Card
───────────────────────────────────────────── */
interface ListCardProps {
  entry: (typeof LIST_DATA)[number]
  index: number
  onAdd: (title: string) => void
}

function ListCard({ entry, index, onAdd }: ListCardProps) {
  const { anime, status, episodesWatched } = entry
  const totalEps = anime.episodes ?? 0
  const progress = totalEps > 0 ? Math.min((episodesWatched / totalEps) * 100, 100) : 0
  const StatusIcon = STATUS_ICONS[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl overflow-hidden border border-white/5 bg-[#0a0a0a] hover:border-indigo-500/25 hover:bg-zinc-900/60 transition-all duration-400"
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={anime.image}
          alt={anime.title}
          fill
          className="object-cover brightness-70 group-hover:brightness-85 transition-all duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Status badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${STATUS_COLORS[status]}`}>
            <StatusIcon size={8} />
            {status}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute top-2.5 right-2.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md">
            <Star size={9} fill="#f59e0b" className="text-amber-400" />
            <span className="text-[9px] font-black text-white">{anime.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* "Add to My List" hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => onAdd(anime.title)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg"
          >
            <Plus size={12} />
            Add to My List
          </button>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <h3 className="text-[10px] font-black text-white uppercase italic tracking-tight leading-tight line-clamp-2">
          {anime.title}
        </h3>

        {/* Episode progress bar */}
        {totalEps > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-bold text-white/30">
                {episodesWatched}/{totalEps} eps
              </span>
              <span className="text-[8px] font-bold text-white/30">{Math.round(progress)}%</span>
            </div>
            <div className="h-1 w-full bg-white/8 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: index * 0.03 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function UserListPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = use(params)
  const { push } = useToast()

  const [filterStatus, setFilterStatus] = useState<WatchStatus | "All">("All")
  const [sortKey, setSortKey] = useState<SortKey>("date")

  const handleAddToList = (title: string) => {
    push(`Added "${title}" to your list!`, "success")
  }

  /* Derived */
  const filtered = useMemo(() => {
    const base = filterStatus === "All" ? LIST_DATA : LIST_DATA.filter((e) => e.status === filterStatus)
    return [...base].sort((a, b) => {
      if (sortKey === "name")   return a.anime.title.localeCompare(b.anime.title)
      if (sortKey === "rating") return b.anime.rating - a.anime.rating
      /* date */                return b.dateAdded.localeCompare(a.dateAdded)
    })
  }, [filterStatus, sortKey])

  const watchingCount   = LIST_DATA.filter((e) => e.status === "Watching").length
  const completedCount  = LIST_DATA.filter((e) => e.status === "Completed").length
  const totalHours      = calcHours(LIST_DATA)

  const statCards = [
    { label: "Total",     value: LIST_DATA.length,  icon: BarChart2,  color: "text-indigo-400" },
    { label: "Watching",  value: watchingCount,      icon: PlayCircle, color: "text-emerald-400" },
    { label: "Completed", value: completedCount,     icon: CheckCircle2, color: "text-violet-400" },
    { label: "Hours",     value: totalHours,         icon: Clock,      color: "text-amber-400" },
  ]

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* Mesh glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[55%] h-[60%] bg-indigo-700/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[50%] bg-violet-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 space-y-12">

        {/* Back link */}
        <Link
          href={`/u/${username}`}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/35 hover:text-white transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          @{username} Profile
        </Link>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic"
        >
          @{username}&apos;s<br />
          <span className="text-indigo-400">Anime List</span>
        </motion.h1>

        {/* Stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 + 0.1 }}
              className="group p-6 rounded-2xl border border-white/5 bg-[#0a0a0a] hover:bg-zinc-900/50 transition-all"
            >
              <div className={`mb-3 ${s.color} opacity-80`}>
                <s.icon size={22} strokeWidth={1.5} />
              </div>
              <p className="text-3xl font-black text-white tracking-tighter">{s.value}</p>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters + Sort row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {(["All", ...ALL_STATUSES] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`relative px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                  filterStatus === tab
                    ? "bg-indigo-600 text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
                    : "bg-white/[0.04] border border-white/8 text-white/40 hover:text-white/80 hover:bg-white/8"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sort buttons */}
          <div className="flex items-center gap-2">
            <SortAsc size={13} className="text-white/25 shrink-0" />
            {(["name", "rating", "date"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setSortKey(key)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  sortKey === key
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                By {key === "name" ? "Name" : key === "rating" ? "Rating" : "Date"}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${filterStatus}-${sortKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {filtered.map((entry, i) => (
              <ListCard
                key={entry.animeId}
                entry={entry}
                index={i}
                onAdd={handleAddToList}
              />
            ))}

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-24 text-center space-y-3"
              >
                <Eye size={36} className="text-white/15 mx-auto" />
                <p className="text-sm font-black text-white/20 uppercase tracking-widest">No anime in this category yet</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
