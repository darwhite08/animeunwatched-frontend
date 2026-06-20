"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { useSeasonal } from "@/hooks/useAnime"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"

const SEASONS = ["winter", "spring", "summer", "fall"] as const
type Season = typeof SEASONS[number]

const SEASON_META: Record<Season, { emoji: string; months: string; accent: string; badge: string }> = {
  winter: { emoji: "❄️", months: "Jan – Mar", accent: "text-blue-400",   badge: "bg-blue-500/15 text-blue-300 border-blue-500/20"    },
  spring: { emoji: "🌸", months: "Apr – Jun", accent: "text-pink-400",   badge: "bg-pink-500/15 text-pink-300 border-pink-500/20"    },
  summer: { emoji: "☀️", months: "Jul – Sep", accent: "text-accent-bright",  badge: "bg-accent/15 text-accent-bright border-accent/20"  },
  fall:   { emoji: "🍂", months: "Oct – Dec", accent: "text-orange-400", badge: "bg-orange-500/15 text-orange-300 border-orange-500/20"},
}

const EARLIEST_YEAR = 1917
const CURRENT_YEAR  = new Date().getFullYear()
const YEAR_LIST     = Array.from({ length: CURRENT_YEAR - EARLIEST_YEAR + 1 }, (_, i) => CURRENT_YEAR - i)

function getCurrentSeason(): Season {
  const m = new Date().getMonth() + 1
  if (m <= 3) return "winter"
  if (m <= 6) return "spring"
  if (m <= 9) return "summer"
  return "fall"
}

function mapDTO(a: AnimeDTO, i: number): Anime {
  return {
    id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "",
    rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes,
    type: (["TV","Movie","OVA"] as const).includes(a.type as "TV"|"Movie"|"OVA")
      ? (a.type as "TV"|"Movie"|"OVA") : "TV",
    status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished",
    studio: a.studios[0] ?? "Unknown", genres: a.genres,
    synopsis: a.synopsis ?? "", image: a.imageUrl ?? "/assets/png/tanjiro.png",
    tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i + 1,
  }
}

export default function SeasonalPage() {
  const [year,     setYear]     = useState(CURRENT_YEAR)
  const [season,   setSeason]   = useState<Season>(getCurrentSeason())
  const [yearOpen, setYearOpen] = useState(false)
  const [selected, setSelected] = useState<Anime | null>(null)

  const { data, isLoading, isError, refetch } = useSeasonal(year, season)
  const anime = useMemo(() => (data?.data ?? []).map(mapDTO), [data])
  const meta  = SEASON_META[season]

  function shiftYear(delta: number) {
    setYear(y => Math.max(EARLIEST_YEAR, Math.min(CURRENT_YEAR, y + delta)))
  }
  function shiftSeason(delta: number) {
    const idx  = SEASONS.indexOf(season)
    const next = (idx + delta + SEASONS.length) % SEASONS.length
    if (delta > 0 && idx === SEASONS.length - 1) shiftYear(1)
    if (delta < 0 && idx === 0) shiftYear(-1)
    setSeason(SEASONS[next])
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-40">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <CalendarDays size={16} className="text-accent-bright" />
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60">Seasonal Archive</p>
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase italic text-foreground leading-none mb-3">
          Seasonal<span style={{color:"var(--app-accent)"}}>.</span>
        </h1>
        <p className="text-subtle text-sm">Every anime, every season — from {EARLIEST_YEAR} to {CURRENT_YEAR}.</p>
      </div>

      {/* Sticky picker bar */}
      <div className="sticky top-[var(--sticky-top,0px)] z-30 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center gap-3 sm:gap-4">

          {/* Year control */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftYear(-1)} disabled={year <= EARLIEST_YEAR}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="relative">
              <button
                onClick={() => setYearOpen(o => !o)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/6 border border-border text-sm font-black text-foreground hover:bg-surface transition-all min-w-[90px] justify-center"
              >
                {year}
                <ChevronDown size={13} className={`text-muted transition-transform ${yearOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {yearOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="absolute top-full mt-2 left-0 z-50 w-32 bg-surface-2 border border-border rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <div data-lenis-prevent className="max-h-64 overflow-y-auto overscroll-contain scrollbar-hide">
                      {YEAR_LIST.map(y => (
                        <button key={y} onClick={() => { setYear(y); setYearOpen(false) }}
                          className={`w-full text-left px-4 py-2 text-sm font-bold transition-colors ${
                            y === year ? "bg-accent/20 text-accent-bright" : "text-muted hover:text-foreground hover:bg-surface"
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => shiftYear(1)} disabled={year >= CURRENT_YEAR}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Season tabs */}
          <div className="flex items-center gap-1.5 bg-white/4 border border-border rounded-2xl p-1 max-w-full overflow-x-auto scrollbar-hide">
            {SEASONS.map(s => {
              const m = SEASON_META[s]
              const active = s === season
              return (
                <button key={s} onClick={() => setSeason(s)}
                  className={`flex shrink-0 items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                    active ? "bg-white/12 text-foreground shadow-sm" : "text-subtle hover:text-foreground hover:bg-surface"
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span className={active ? m.accent : ""}>{s}</span>
                </button>
              )
            })}
          </div>

          {/* Season arrows */}
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={() => shiftSeason(-1)} title="Previous season"
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-all">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => shiftSeason(1)} title="Next season"
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Season label */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6 flex flex-wrap items-center gap-3 sm:gap-4">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic text-foreground">
          {meta.emoji} {season.charAt(0).toUpperCase() + season.slice(1)} {year}
        </h2>
        <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${meta.badge}`}>
          {meta.months}
        </span>
        {!isLoading && !isError && (
          <span className="text-[10px] font-black text-subtle uppercase tracking-widest ml-auto">
            {anime.length} titles
          </span>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-[1.8rem] bg-white/[0.04] animate-pulse"
                style={{ animationDelay: `${i * 40}ms` }} />
            ))}
          </div>
        )}

        {isError && !isLoading && (
          <div className="py-32 text-center border border-dashed border-border rounded-[3rem]">
            <p className="text-subtle font-black uppercase tracking-widest text-xs mb-4">
              Could not load {season} {year}
            </p>
            <button onClick={() => refetch()}
              className="text-xs text-accent-bright hover:text-foreground font-black uppercase tracking-widest">
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && anime.length === 0 && (
          <div className="py-32 text-center border border-dashed border-border rounded-[3rem]">
            <p className="text-5xl mb-4">{meta.emoji}</p>
            <p className="text-subtle font-black uppercase tracking-widest text-xs">
              No anime archived for {season} {year}
            </p>
            <p className="text-subtle text-[10px] mt-2">Try an adjacent season or year</p>
          </div>
        )}

        {!isLoading && !isError && anime.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div key={`${year}-${season}`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5"
            >
              {anime.map((a, i) => (
                <motion.div key={a.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.4) }}
                  onClick={() => setSelected(a)}
                  whileTap={{ scale: 0.96 }}
                  className="group relative cursor-pointer"
                >
                  <div className="aspect-[2/3] rounded-[1.6rem] overflow-hidden bg-white/[0.04] relative">
                    {a.image ? (
                      <img src={a.image} alt={a.title} loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-subtle text-4xl font-black">
                        {a.title[0]}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      {a.rating > 0 && (
                        <span className="text-[10px] font-black text-accent-bright">★ {a.rating.toFixed(1)}</span>
                      )}
                    </div>
                    {a.rating >= 8.0 && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-accent/90 text-[8px] font-black text-black">
                        {a.rating.toFixed(1)}
                      </div>
                    )}
                    {a.status === "airing" && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[7px] font-black text-emerald-400 uppercase">Live</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2.5 px-0.5">
                    <p className="text-[11px] font-bold text-muted leading-tight line-clamp-2 group-hover:text-foreground transition-colors">
                      {a.title}
                    </p>
                    {a.studio !== "Unknown" && (
                      <p className="text-[9px] text-subtle mt-0.5 truncate">{a.studio}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <AnimeModal isOpen={selected !== null} onClose={() => setSelected(null)} anime={selected} />
    </div>
  )
}
