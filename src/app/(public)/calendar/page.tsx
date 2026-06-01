"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { CalendarCheck, RadioButton } from "@phosphor-icons/react"
import { useSeasonal } from "@/hooks/useAnime"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return {
    id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "",
    rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes,
    type: (["TV","Movie","OVA"] as const).includes(a.type as "TV"|"Movie"|"OVA") ? (a.type as "TV"|"Movie"|"OVA") : "TV",
    status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished",
    studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "",
    image: a.imageUrl ?? "/assets/png/tanjiro.png",
    tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i + 1,
  }
}

const SEASONS = ["winter", "spring", "summer", "fall"] as const
type Season = typeof SEASONS[number]

const SEASON_META: Record<Season, { emoji: string; months: string; accent: string }> = {
  winter: { emoji: "❄️", months: "Jan – Mar", accent: "text-blue-400"   },
  spring: { emoji: "🌸", months: "Apr – Jun", accent: "text-pink-400"   },
  summer: { emoji: "☀️", months: "Jul – Sep", accent: "text-accent-bright"  },
  fall:   { emoji: "🍂", months: "Oct – Dec", accent: "text-orange-400" },
}

const EARLIEST_YEAR = 1917
const CURRENT_YEAR  = new Date().getFullYear()

function getCurrentSeason(): Season {
  const m = new Date().getMonth() + 1
  if (m <= 3) return "winter"
  if (m <= 6) return "spring"
  if (m <= 9) return "summer"
  return "fall"
}

export default function CalendarPage() {
  const [year,    setYear]    = useState(CURRENT_YEAR)
  const [season,  setSeason]  = useState<Season>(getCurrentSeason())
  const [selected, setSelected] = useState<Anime | null>(null)

  const { data, isLoading, isError, refetch } = useSeasonal(year, season)
  const anime = useMemo(() => (data?.data ?? []).map(mapDTO), [data])

  const airing   = anime.filter(a => a.status === "airing")
  const finished = anime.filter(a => a.status !== "airing")
  const meta = SEASON_META[season]

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">

      {/* Sticky header */}
      <div className="sticky top-[72px] z-30 border-b border-border backdrop-blur-xl"
        style={{ background: "rgba(2,2,2,0.92)" }}>
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarCheck size={14} weight="duotone" className="text-accent-bright" />
                <p className="text-[9px] font-mono uppercase tracking-[0.4em]"
                  style={{ color: "rgba(245,158,11,0.6)" }}>Seasonal Calendar</p>
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic text-foreground leading-none">
                Anime Schedule<span style={{ color: "#f59e0b" }}>.</span>
              </h1>
            </div>

            {/* Year nav */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setYear(y => Math.max(EARLIEST_YEAR, y - 1))}
                disabled={year <= EARLIEST_YEAR}
                className="p-2 rounded-xl border border-border bg-surface hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-xl font-black tracking-tighter text-foreground w-16 text-center">{year}</span>
              <button
                onClick={() => setYear(y => Math.min(CURRENT_YEAR, y + 1))}
                disabled={year >= CURRENT_YEAR}
                className="p-2 rounded-xl border border-border bg-surface hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Season tabs */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {SEASONS.map(s => {
              const m = SEASON_META[s]
              const active = s === season
              return (
                <button key={s} onClick={() => setSeason(s)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    active ? "text-black" : "bg-surface text-subtle hover:bg-surface hover:text-foreground border border-border"
                  }`}
                  style={active ? {
                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
                  } : undefined}
                >
                  <span>{m.emoji}</span>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  <span className="text-[7px] opacity-60 hidden sm:inline">{m.months}</span>
                </button>
              )
            })}

            {!isLoading && !isError && (
              <span className="ml-auto text-[10px] text-subtle font-black uppercase tracking-widest">
                {anime.length} titles
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-[1.8rem] bg-white/[0.04] animate-pulse"
                style={{ animationDelay: `${i * 40}ms` }} />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="py-24 text-center border border-dashed border-border rounded-[3rem]">
            <p className="text-subtle font-black uppercase tracking-widest text-xs mb-4">
              Could not load {season} {year}
            </p>
            <button onClick={() => refetch()}
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: "#f59e0b" }}>
              Retry
            </button>
          </div>
        )}

        {/* Airing */}
        {!isLoading && !isError && airing.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div key={`${year}-${season}-airing`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Currently Airing
                </span>
                <span className="text-[10px] text-subtle font-black">{airing.length} series</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {airing.map((a, i) => <AnimeCard key={a.id} anime={a} index={i} onClick={setSelected} />)}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Finished */}
        {!isLoading && !isError && finished.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div key={`${year}-${season}-finished`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1.5 rounded-full bg-surface border border-border text-[10px] font-black text-muted uppercase tracking-wider">
                  Completed
                </span>
                <span className="text-[10px] text-subtle font-black">{finished.length} series</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {finished.map((a, i) => <AnimeCard key={a.id} anime={a} index={i} onClick={setSelected} />)}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Empty */}
        {!isLoading && !isError && anime.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-28 text-center border border-dashed border-border rounded-[3rem]">
            <p className="text-4xl mb-4">{meta.emoji}</p>
            <p className="text-subtle font-black uppercase tracking-widest text-xs">
              No anime archived for {meta.emoji} {season} {year}
            </p>
            <p className="text-subtle text-[10px] mt-2">Try an adjacent season or year</p>
          </motion.div>
        )}
      </div>

      <AnimeModal isOpen={selected !== null} onClose={() => setSelected(null)} anime={selected} />
    </div>
  )
}
