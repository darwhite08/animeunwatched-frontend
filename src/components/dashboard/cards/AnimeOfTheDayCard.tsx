"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Plus, Check, RefreshCw, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import { useWatchlist } from "@/stores/watchlist.store"
import { useToast } from "@/stores/toast.store"

function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function mapDTO(a: AnimeDTO, i: number) {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as "TV"|"Movie"|"OVA" : "TV" as const, status: a.status?.toLowerCase().includes("airing") ? "airing" as const : "finished" as const, studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all" as const, rank: i+1 }
}

export default function AnimeOfTheDayCard() {
  const { add, remove, has } = useWatchlist()
  const { push } = useToast()

  const [offset, setOffset] = useState(0)
  const { data, isLoading } = useBrowseAnime({ limit: 50 })
  const list = (data?.data ?? []).map(mapDTO)
  const dayIndex = list.length > 0 ? (getDayOfYear() + offset) % list.length : 0
  const anime = list[dayIndex]

  if (isLoading || !anime) {
    return (
      <div className="relative w-full rounded-[2.5rem] overflow-hidden border border-border bg-surface min-h-[340px] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-indigo-500 animate-spin" />
      </div>
    )
  }

  const inList = has(anime.id)

  const handleToggleList = () => {
    if (inList) {
      remove(anime.id)
      push(`Removed "${anime.title}" from watchlist`, "info")
    } else {
      add(anime)
      push(`Added "${anime.title}" to watchlist!`, "success")
    }
  }

  const handleRefresh = () => {
    setOffset(o => (o + 1) % list.length)
  }

  return (
    <div className="relative w-full rounded-[2.5rem] overflow-hidden border border-border bg-surface min-h-[340px]">
      {/* Blurred background image */}
      <div className="absolute inset-0">
        <Image
          src={anime.image}
          alt={anime.title}
          fill
          className="object-cover brightness-[0.25] blur-sm scale-110"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-bg)] via-[var(--app-bg)]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--app-bg)]/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full min-h-[340px]">
        {/* Cover thumbnail */}
        <div className="hidden sm:block w-40 shrink-0 m-6 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative w-full h-full min-h-[260px]">
            <Image
              src={anime.image}
              alt={anime.title}
              fill
              className="object-cover"
              sizes="160px"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 p-6 sm:pl-4 flex flex-col justify-between">
          <div>
            {/* Label */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1.5 rounded-full bg-accent/15 border border-accent/40 text-[9px] font-black uppercase tracking-[0.4em] text-accent">
                Anime of the Day
              </span>
              {anime.status === "airing" && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              )}
            </div>

            {/* Title */}
            <motion.h2
              key={anime.id + "-title"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-2xl lg:text-3xl font-black tracking-tighter uppercase italic text-foreground leading-tight mb-3"
            >
              {anime.title}
            </motion.h2>

            {/* Meta row */}
            <motion.div
              key={anime.id + "-meta"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-3 flex-wrap"
            >
              <div className="flex items-center gap-1.5">
                <Star size={12} fill="var(--app-accent)" className="text-accent-bright" />
                <span className="text-sm font-black text-foreground">{anime.rating.toFixed(1)}</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <span className="text-xs font-bold text-muted">{anime.studio}</span>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <span className="text-xs font-bold text-muted">{anime.year}</span>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <span className="text-xs font-bold text-muted">{anime.type}</span>
            </motion.div>

            {/* Genre tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {anime.genres.map(g => (
                <span
                  key={g}
                  className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-surface rounded-full text-muted"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <motion.p
              key={anime.id + "-synopsis"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-xs text-muted leading-relaxed line-clamp-3 max-w-sm"
            >
              {anime.synopsis.slice(0, 100)}
              {anime.synopsis.length > 100 ? "…" : ""}
            </motion.p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-5 flex-wrap">
            <button
              onClick={handleToggleList}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                inList
                  ? "bg-emerald-600 hover:bg-emerald-500 text-foreground"
                  : "bg-accent hover:bg-accent-bright text-black"
              }`}
            >
              {inList ? <Check size={13} /> : <Plus size={13} />}
              {inList ? "In Watchlist" : "Add to List"}
            </button>

            <Link
              href={`/anime/${anime.id}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface hover:bg-surface border border-border hover:border-border text-xs font-black uppercase tracking-widest text-muted hover:text-foreground transition-all"
            >
              <ExternalLink size={13} /> View Details
            </Link>

            <button
              onClick={handleRefresh}
              title="Show next anime"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface hover:bg-surface border border-border hover:border-border text-muted hover:text-foreground transition-all"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
