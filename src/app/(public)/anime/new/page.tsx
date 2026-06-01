"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Sparkles, CalendarDays, TrendingUp } from "lucide-react"
import type { Anime } from "@/lib/data/anime"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"

const mapDTO = (a: AnimeDTO, i: number): Anime => ({
  id: String(a.malId),
  title: a.title,
  titleJapanese: a.titleJapanese ?? "",
  rating: a.score ?? 0,
  year: a.year ?? 0,
  episodes: a.episodes,
  type: (["TV", "Movie", "OVA"] as const).includes(a.type as any) ? a.type as any : "TV",
  status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished",
  studio: a.studios[0] ?? "Unknown",
  genres: a.genres,
  synopsis: a.synopsis ?? "",
  image: a.imageUrl ?? "",
  tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")),
  category: "all",
  rank: i + 1,
})

type Filter = "week" | "month" | "year"

const CURRENT_YEAR = 2024

// Mock stats
const STATS: Record<Filter, { count: number; label: string }> = {
  week:  { count: 3,  label: "New This Week"  },
  month: { count: 8,  label: "New This Month" },
  year:  { count: 14, label: "New This Year"  },
}

// "NEW" badge threshold — anime released within "last 6 months" (mock: year >= 2024)
function isNew(anime: Anime): boolean {
  return anime.year >= CURRENT_YEAR
}

// For demo purposes: "week" = 2024+, "month" = 2023+, "year" = 2022+
const FILTER_YEAR: Record<Filter, number> = {
  week:  2024,
  month: 2023,
  year:  2022,
}

const FILTER_TABS: { id: Filter; label: string }[] = [
  { id: "week",  label: "This Week"  },
  { id: "month", label: "This Month" },
  { id: "year",  label: "This Year"  },
]

export default function NewAnimePage() {
  const [filter, setFilter] = useState<Filter>("year")
  const [selected, setSelected] = useState<Anime | null>(null)

  const { data: browseData, isLoading } = useBrowseAnime({ limit: 20 })
  const animeList = useMemo(() => (browseData?.data ?? []).map(mapDTO), [browseData])

  const filtered = useMemo(
    () =>
      [...animeList]
        .filter(a => a.year >= FILTER_YEAR[filter])
        .sort((a, b) => b.year - a.year || b.rating - a.rating),
    [animeList, filter],
  )

  if (isLoading) return null

  const stat = STATS[filter]

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <CalendarDays size={16} className="text-violet-400" />
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-violet-400/60">
            Archive Updates
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic text-foreground leading-none mb-2">
              New to the Archive<span className="text-violet-500">.</span>
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-violet-400">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Updated Daily
              </span>
              <span className="text-subtle text-xs">{filtered.length} titles available</span>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex gap-4 shrink-0">
            {(Object.keys(STATS) as Filter[]).map(k => (
              <div key={k} className="text-center">
                <p className="text-2xl font-black text-foreground">{STATS[k].count}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-subtle">{STATS[k].label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === t.id
                  ? "bg-violet-600 text-foreground shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                  : "bg-surface text-muted hover:bg-surface border border-border"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Active stat callout */}
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-2 text-subtle text-xs"
        >
          <TrendingUp size={13} className="text-violet-400" />
          <span>
            <span className="font-black text-muted">{stat.count}</span>{" "}
            {stat.label.toLowerCase()} — sorted by newest first
          </span>
        </motion.div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Sparkles size={32} className="text-subtle mb-4" />
            <p className="text-subtle font-black uppercase tracking-widest text-sm">Nothing yet</p>
            <p className="text-subtle text-xs mt-1">Check back later for new additions</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {filtered.map((anime, i) => (
              <div key={anime.id} className="relative">
                {isNew(anime) && (
                  <div className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-violet-600 rounded-full text-[8px] font-black uppercase tracking-widest text-foreground shadow-lg">
                    NEW
                  </div>
                )}
                <AnimeCard anime={anime} index={i} onClick={setSelected} />
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimeModal isOpen={selected !== null} onClose={() => setSelected(null)} anime={selected} />
    </div>
  )
}
