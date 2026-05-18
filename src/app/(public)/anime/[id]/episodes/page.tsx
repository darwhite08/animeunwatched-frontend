"use client"

import { use, useState, useMemo } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  Check, ChevronRight, Play, Tv,
} from "lucide-react"
import { useAnime } from "@/hooks/useAnime"
import { useToast } from "@/stores/toast.store"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

/* ── Types ── */
type EpisodeFilter = "all" | "watched" | "unwatched"

interface Episode {
  number: number
  title: string
  airDate: string
  duration: string
  gradientClass: string
  watched: boolean
}

/* ── Episode generator ── */
const EPISODE_GRADIENTS = [
  "from-indigo-900 to-violet-900",
  "from-blue-900   to-cyan-900",
  "from-rose-900   to-pink-900",
  "from-amber-900  to-orange-900",
  "from-emerald-900 to-teal-900",
  "from-purple-900  to-indigo-900",
]

const EPISODE_TITLE_SUFFIXES = [
  "The Beginning",
  "A New Path",
  "Shadows Ahead",
  "The Reckoning",
  "Into the Abyss",
  "Bonds of Steel",
  "Edge of Tomorrow",
  "Breaking Point",
  "The Long Road",
  "Embers and Ash",
  "Before the Storm",
  "Revelation",
  "The Price of Power",
  "Unbroken",
  "Last Stand",
  "What Remains",
  "The Weight of Truth",
  "Fractured",
  "Rising Tide",
  "End of Chapter",
]

function buildEpisodes(animeId: string, count: number): Episode[] {
  const seed = animeId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)

  return Array.from({ length: count }, (_, i) => {
    const epNum = i + 1
    // Deterministic but varied air dates (2023–2024 range)
    const baseMs = 1_672_531_200_000 + (seed % 365) * 86_400_000
    const airMs  = baseMs + i * 7 * 86_400_000
    const airDate = new Date(airMs).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

    const suffix = EPISODE_TITLE_SUFFIXES[(i + seed) % EPISODE_TITLE_SUFFIXES.length]

    return {
      number: epNum,
      title: `Episode ${epNum} — ${suffix}`,
      airDate,
      duration: "24:00",
      gradientClass: EPISODE_GRADIENTS[(i + seed) % EPISODE_GRADIENTS.length],
      watched: epNum <= 8,
    }
  })
}

/* ── Page ── */
export default function AnimeEpisodesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const malId = Number(id)
  const { data: animeData, isLoading } = useAnime(malId > 0 ? malId : 0)
  const anime = animeData?.anime ? mapDTO(animeData.anime, 0) : null

  const { push } = useToast()

  const totalCount = anime?.episodes ?? 12
  const [episodes, setEpisodes] = useState<Episode[]>(() =>
    buildEpisodes(id, totalCount),
  )
  const [filter, setFilter] = useState<EpisodeFilter>("all")

  const watchedCount = episodes.filter(e => e.watched).length

  const visible = useMemo(() => {
    if (filter === "watched")   return episodes.filter(e => e.watched)
    if (filter === "unwatched") return episodes.filter(e => !e.watched)
    return episodes
  }, [episodes, filter])

  const toggleWatched = (num: number) => {
    setEpisodes(eps =>
      eps.map(e => {
        if (e.number !== num) return e
        const next = !e.watched
        push(
          next
            ? `Episode ${num} marked as watched!`
            : `Episode ${num} marked as unwatched`,
          next ? "success" : "info",
        )
        return { ...e, watched: next }
      }),
    )
  }

  const progressPct = Math.round((watchedCount / totalCount) * 100)

  const FILTERS: { id: EpisodeFilter; label: string }[] = [
    { id: "all",       label: "All"       },
    { id: "watched",   label: "Watched"   },
    { id: "unwatched", label: "Unwatched" },
  ]

  if (isLoading) return <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center text-white/30">Loading…</div>

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/25 mb-8">
          <Link href="/bestanimelist" className="hover:text-white/60 transition-colors">
            Anime Archive
          </Link>
          <ChevronRight size={11} className="text-white/15" />
          <Link href={`/anime/${id}`} className="hover:text-white/60 transition-colors truncate max-w-[180px]">
            {anime?.title ?? id}
          </Link>
          <ChevronRight size={11} className="text-white/15" />
          <span className="text-indigo-400">Episodes</span>
        </nav>

        {/* Anime mini-header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/8 mb-8"
        >
          <Link href={`/anime/${id}`} className="relative h-20 w-14 rounded-xl overflow-hidden shrink-0 group">
            <Image
              src={anime?.image ?? ""}
              alt={anime?.title ?? ""}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="56px"
            />
          </Link>

          <div className="flex-1 min-w-0">
            <Link href={`/anime/${id}`}>
              <h1 className="text-xl font-black uppercase italic tracking-tighter text-white hover:text-indigo-300 transition-colors leading-tight truncate">
                {anime?.title ?? ""}
              </h1>
            </Link>
            <p className="text-[10px] text-white/30 mt-0.5 font-mono">{anime?.titleJapanese}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400">
                <Tv size={11} />
                {anime?.episodes == null ? "Ongoing" : `${anime.episodes} Episodes`}
              </div>
              <span className="text-[10px] text-white/30">{anime?.studio} · {anime?.year}</span>
            </div>
          </div>
        </motion.div>

        {/* Ongoing notice */}
        {anime?.episodes === null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <p className="text-sm font-black text-emerald-400 uppercase italic tracking-tight">
              Ongoing — Episodes added as they air
            </p>
          </motion.div>
        )}

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-3"
        >
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
            <span>Your Progress</span>
            <span className="text-indigo-400">{watchedCount} / {totalCount} watched</span>
          </div>
          <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-500 rounded-full"
            />
          </div>
          <p className="text-right text-[9px] font-mono text-white/20">{progressPct}% complete</p>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                filter === f.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white/5 text-white/40 hover:bg-white/8 border border-white/5"
              }`}
            >
              {f.label}
              {f.id === "watched"   && <span className="ml-1.5 text-white/30">{episodes.filter(e => e.watched).length}</span>}
              {f.id === "unwatched" && <span className="ml-1.5 text-white/30">{episodes.filter(e => !e.watched).length}</span>}
            </button>
          ))}
        </div>

        {/* Episode list */}
        <div className="space-y-3">
          {visible.map((ep, i) => (
            <motion.div
              key={ep.number}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.025, 0.4) }}
              className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                ep.watched
                  ? "bg-emerald-500/[0.03] border-emerald-500/15 hover:border-emerald-500/30"
                  : "bg-white/[0.02] border-white/8 hover:border-white/15"
              }`}
            >
              {/* Thumbnail placeholder */}
              <div
                className={`relative h-14 w-20 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br ${ep.gradientClass} flex items-center justify-center`}
              >
                <span className="text-lg font-black text-white/30">{String(ep.number).padStart(2, "0")}</span>
                {ep.watched && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Check size={20} className="text-emerald-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white leading-tight truncate">
                  {ep.title}
                </p>
                <div className="flex items-center gap-3 mt-1 text-[9px] font-bold text-white/30 uppercase tracking-wider">
                  <span>{ep.airDate}</span>
                  <span>·</span>
                  <span>{ep.duration}</span>
                </div>
              </div>

              {/* Watch status toggle */}
              <button
                onClick={() => toggleWatched(ep.number)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shrink-0 ${
                  ep.watched
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                    : "bg-white/5 text-white/30 border border-white/8 hover:bg-indigo-500/15 hover:text-indigo-400 hover:border-indigo-500/25"
                }`}
              >
                <Check size={11} className={ep.watched ? "" : "opacity-30"} />
                {ep.watched ? "Watched" : "Mark"}
              </button>

              {/* Play button */}
              <button
                onClick={() => push("Streaming coming soon!", "info")}
                className="flex items-center justify-center h-9 w-9 rounded-xl bg-white/5 border border-white/8 text-white/30 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all shrink-0"
              >
                <Play size={14} fill="currentColor" />
              </button>
            </motion.div>
          ))}

          {visible.length === 0 && (
            <div className="py-16 text-center text-white/20 text-sm font-bold">
              No episodes match this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
