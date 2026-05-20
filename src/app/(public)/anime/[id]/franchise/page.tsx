"use client"

import { use, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ChevronRight, Star, Tv2, Film, BookOpen,
  CheckCircle2, ListPlus, Clock, Play,
} from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import { useToast } from "@/stores/toast.store"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

/* ── Types ── */
type EntryType = "Main Series" | "Prequel" | "Sequel" | "Side Story" | "Movie" | "OVA"

type FranchiseEntry = {
  id: string
  title: string
  type: EntryType
  year: number
  episodes: number | null
  rating: number | null
  isCurrent?: boolean
  status: "finished" | "airing" | "upcoming"
}

/* ── Helpers ── */
const TYPE_COLORS: Record<EntryType, string> = {
  "Main Series": "bg-amber-500/15 border-amber-500/30 text-amber-400",
  "Prequel":     "bg-violet-500/15 border-violet-500/30 text-violet-400",
  "Sequel":      "bg-blue-500/15  border-blue-500/30  text-blue-400",
  "Side Story":  "bg-amber-500/15 border-amber-500/30 text-amber-400",
  "Movie":       "bg-rose-500/15  border-rose-500/30  text-rose-400",
  "OVA":         "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
}

const TYPE_ICONS: Record<EntryType, typeof Tv2> = {
  "Main Series": Tv2,
  "Prequel":     Clock,
  "Sequel":      Play,
  "Side Story":  BookOpen,
  "Movie":       Film,
  "OVA":         Star,
}

function buildFranchise(animeId: string, animeTitle: string, animeYear: number): FranchiseEntry[] {
  return [
    {
      id: `${animeId}-prequel`,
      title: `${animeTitle}: Origins`,
      type: "Prequel",
      year: animeYear - 3,
      episodes: 12,
      rating: 8.1,
      status: "finished",
    },
    {
      id: animeId,
      title: animeTitle,
      type: "Main Series",
      year: animeYear,
      episodes: null,
      rating: null,
      isCurrent: true,
      status: "finished",
    },
    {
      id: `${animeId}-ova`,
      title: `${animeTitle}: Special OVA`,
      type: "OVA",
      year: animeYear + 1,
      episodes: 4,
      rating: 7.9,
      status: "finished",
    },
    {
      id: `${animeId}-side`,
      title: `${animeTitle}: Side Stories`,
      type: "Side Story",
      year: animeYear + 2,
      episodes: 6,
      rating: 8.0,
      status: "finished",
    },
    {
      id: `${animeId}-movie`,
      title: `${animeTitle}: The Movie`,
      type: "Movie",
      year: animeYear + 3,
      episodes: 1,
      rating: 8.4,
      status: "finished",
    },
    {
      id: `${animeId}-sequel`,
      title: `${animeTitle}: Next Chapter`,
      type: "Sequel",
      year: animeYear + 4,
      episodes: null,
      rating: null,
      status: "upcoming",
    },
  ]
}

/* ── Entry Row ── */
function FranchiseRow({
  entry,
  index,
  isCurrent,
}: {
  entry: FranchiseEntry
  index: number
  isCurrent: boolean
}) {
  const Icon = TYPE_ICONS[entry.type]
  const colorClass = TYPE_COLORS[entry.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.07 }}
      className={`relative flex items-center gap-5 p-5 rounded-2xl border transition-all ${
        isCurrent
          ? "bg-amber-600/10 border-amber-500/30"
          : "bg-white/[0.02] border-white/8 hover:border-white/15 hover:bg-white/[0.04]"
      }`}
    >
      {/* Timeline dot */}
      <div className="hidden sm:flex flex-col items-center shrink-0">
        <div className={`h-4 w-4 rounded-full border-2 ${isCurrent ? "bg-amber-500 border-indigo-400" : "bg-white/10 border-white/20"}`} />
        {index < 5 && <div className="w-px flex-1 min-h-[2.5rem] bg-white/8 mt-1" />}
      </div>

      {/* Icon */}
      <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon size={16} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${colorClass}`}>
            {entry.type}
          </span>
          {isCurrent && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1">
              <CheckCircle2 size={9} /> Currently Viewing
            </span>
          )}
          {entry.status === "upcoming" && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-[9px] font-black uppercase tracking-widest text-amber-400">
              Upcoming
            </span>
          )}
          {entry.status === "airing" && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[9px] font-black uppercase tracking-widest text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Airing
            </span>
          )}
        </div>
        <p className={`font-black text-sm uppercase italic tracking-tight truncate ${isCurrent ? "text-amber-200" : "text-white"}`}>
          {entry.title}
        </p>
        <div className="flex items-center gap-3 mt-1 text-[10px] text-white/30">
          <span>{entry.year}</span>
          {entry.episodes !== null && (
            <>
              <span className="text-white/15">·</span>
              <span>{entry.episodes === 1 ? "1 episode" : `${entry.episodes} eps`}</span>
            </>
          )}
          {entry.status === "upcoming" && (
            <>
              <span className="text-white/15">·</span>
              <span>TBA</span>
            </>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="shrink-0 text-right">
        {entry.rating !== null ? (
          <div className="flex items-center gap-1">
            <Star size={11} fill="#f59e0b" className="text-amber-400" />
            <span className="text-sm font-black text-white">{entry.rating.toFixed(1)}</span>
          </div>
        ) : (
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider">
            {entry.status === "upcoming" ? "TBA" : "—"}
          </span>
        )}
      </div>
    </motion.div>
  )
}

/* ── Page ── */
export default function FranchisePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { push } = useToast()
  const [added, setAdded] = useState(false)

  const { data: browseData, isLoading } = useBrowseAnime({ limit: 6 })
  const anime = (browseData?.data ?? []).map(mapDTO)[0] ?? null

  const franchise = anime ? buildFranchise(id, anime.title, anime.year) : []

  const handleAddAll = () => {
    setAdded(true)
    push(`Added all ${anime?.title ?? ""} franchise entries to your watchlist!`, "success")
  }

  const stats = {
    total: franchise.length,
    finished: franchise.filter((e) => e.status === "finished").length,
    totalEps: franchise.reduce((sum, e) => sum + (e.episodes ?? 0), 0),
    avgRating:
      franchise
        .filter((e) => e.rating !== null)
        .reduce((sum, e) => sum + (e.rating ?? 0), 0) /
      franchise.filter((e) => e.rating !== null).length,
  }

  if (isLoading) return <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center text-white/30">Loading…</div>

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/25 mb-8">
          <Link href="/bestanimelist" className="hover:text-white/60 transition-colors">
            Anime
          </Link>
          <ChevronRight size={11} className="text-white/15" />
          <Link href={`/anime/${id}`} className="hover:text-white/60 transition-colors truncate max-w-[180px]">
            {anime?.title ?? id}
          </Link>
          <ChevronRight size={11} className="text-white/15" />
          <span className="text-amber-400">Franchise</span>
        </nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-3">
            Complete Franchise
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase italic text-white leading-none mb-2">
            {anime?.title ?? id}
            <span style={{color:"#f59e0b"}}>.</span>
          </h1>
          <p className="text-white/35 text-sm">All related entries in the same series universe.</p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        >
          {[
            { label: "Total Entries", value: stats.total },
            { label: "Finished",      value: stats.finished },
            { label: "Total Episodes", value: stats.totalEps || "TBA" },
            { label: "Avg Rating",    value: isNaN(stats.avgRating) ? "—" : stats.avgRating.toFixed(1) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/8 text-center"
            >
              <p className="text-xl font-black text-white">{value}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Add All button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-8"
        >
          <button
            onClick={handleAddAll}
            disabled={added}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              added
                ? "bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 cursor-default"
                : "bg-amber-500 hover:bg-amber-400 text-black"
            }`}
          >
            {added ? (
              <><CheckCircle2 size={14} /> All Added to Watchlist</>
            ) : (
              <><ListPlus size={14} /> Add All to Watchlist</>
            )}
          </button>
        </motion.div>

        {/* Timeline */}
        <div className="space-y-0 relative">
          {franchise.map((entry, i) => (
            <FranchiseRow
              key={entry.id}
              entry={entry}
              index={i}
              isCurrent={!!entry.isCurrent}
            />
          ))}
        </div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 pt-8 border-t border-white/5"
        >
          <Link
            href={`/anime/${id}`}
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ChevronRight size={12} className="rotate-180" />
            Back to {anime?.title ?? id}
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
