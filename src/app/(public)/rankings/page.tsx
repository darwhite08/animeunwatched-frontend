"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"
import { BarChart3, Star, TrendingUp, Award, Zap, ChevronLeft, ChevronRight } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"

function mapDTO(a: AnimeDTO, rank: number): Anime {
  const status: "finished" | "airing" = a.status?.toLowerCase().includes("airing") ? "airing" : "finished"
  const type = (["TV", "Movie", "OVA"] as const).includes(a.type as "TV" | "Movie" | "OVA")
    ? (a.type as "TV" | "Movie" | "OVA") : "TV"
  return {
    id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "",
    rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes,
    type, status, studio: a.studios[0] ?? "Unknown", genres: a.genres,
    synopsis: a.synopsis ?? "", image: a.imageUrl ?? "/assets/png/tanjiro.png",
    tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")),
    category: "all", rank,
  }
}

const LIMIT = 24

type CatId = "score" | "airing" | "movie" | "classic" | "new"

const CATEGORIES: { id: CatId; label: string; icon: typeof Star; desc: string; params: Record<string, string> }[] = [
  { id: "score",   label: "Highest Rated", icon: Star,       desc: "Ranked purely by community score",    params: {} },
  { id: "airing",  label: "Top Airing",    icon: Zap,        desc: "Best currently airing series",        params: { status: "airing" } },
  { id: "movie",   label: "Best Movies",   icon: Award,      desc: "Highest rated anime films",            params: { type: "Movie" } },
  { id: "classic", label: "Classic Picks", icon: TrendingUp, desc: "Legendary anime from before 2010",    params: { type: "TV", end_date: "2010-01-01" } },
  { id: "new",     label: "Recent Best",   icon: BarChart3,  desc: "Top rated anime from 2020 onwards",   params: { start_date: "2020-01-01" } },
]

export default function RankingsPage() {
  const [cat, setCat] = useState<CatId>("score")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Anime | null>(null)

  const active = CATEGORIES.find(c => c.id === cat)!

  const apiParams = useMemo(() => ({
    limit: LIMIT,
    page,
    ...active.params,
  }), [cat, page, active.params])

  const { data, isLoading, isError } = useBrowseAnime(apiParams)

  const totalPages = data?.meta?.pages ?? 1
  const totalAnime = data?.meta?.total ?? 0

  const ranked = useMemo(() => {
    if (!data?.data) return []
    const offset = (page - 1) * LIMIT
    return data.data.map((a, i) => mapDTO(a, offset + i + 1))
  }, [data, page])

  function changeCategory(newCat: CatId) {
    setCat(newCat)
    setPage(1)
  }

  const top3 = ranked.slice(0, page === 1 ? 3 : 0)
  const rest  = ranked.slice(page === 1 ? 3 : 0)

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-10">
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-3">Neural Leaderboard</p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase italic text-foreground leading-none mb-2">
          Leaderboard<span style={{color:"var(--app-accent)"}}>.</span>
        </h1>
        <p className="text-subtle text-sm mb-10">Top anime by community credibility-weighted scores</p>

        {/* Category tabs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => changeCategory(c.id)}
              className={`p-4 min-h-11 rounded-2xl border text-left transition-all active:scale-95 ${
                cat === c.id ? "border-accent/40 bg-accent/10" : "border-border bg-surface hover:border-border"
              }`}>
              <c.icon size={16} className={cat === c.id ? "text-accent-bright" : "text-subtle"} />
              <p className={`font-black text-sm mt-2 ${cat === c.id ? "text-foreground" : "text-muted"}`}>{c.label}</p>
              <p className="text-[9px] text-subtle mt-0.5 leading-tight">{c.desc}</p>
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-[1.6rem] bg-white/[0.04] animate-pulse"
                style={{ animationDelay: `${i * 30}ms` }} />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="py-24 text-center border border-dashed border-border rounded-[3rem]">
            <p className="text-subtle text-xs font-black uppercase tracking-widest">Failed to load rankings</p>
          </div>
        )}

        {!isLoading && !isError && (
          <AnimatePresence mode="wait">
            <motion.div key={`${cat}-${page}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Top 3 podium — page 1 only */}
              {top3.length >= 3 && (
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-10">
                  {[1, 0, 2].map((pos, i) => {
                    const anime = top3[pos]
                    if (!anime) return null
                    const medals = ["🥈", "🥇", "🥉"]
                    return (
                      <motion.div key={anime.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => setSelected(anime)}
                        className={`group p-3.5 sm:p-5 rounded-2xl border cursor-pointer transition-all hover:border-white/30 active:scale-95 ${
                          pos === 0 ? "border-accent/30 bg-accent/5" : "border-border bg-surface"
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 mb-3">
                          <span className="text-xl sm:text-2xl">{medals[i]}</span>
                          <span className="text-[10px] font-black text-subtle font-mono">#{pos + 1}</span>
                        </div>
                        <p className="font-black text-foreground group-hover:text-foreground text-sm leading-tight line-clamp-2">
                          {anime.title}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Star size={10} fill="var(--app-accent)" className="text-accent-bright" />
                          <span className="text-xs font-black text-muted">{anime.rating.toFixed(1)}</span>
                          <span className="text-[9px] text-subtle">· {anime.year}</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Rest of grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {rest.map((a, i) => (
                    <AnimeCard key={a.id} anime={a} index={i} onClick={setSelected} />
                  ))}
                </div>
              )}

              {ranked.length === 0 && (
                <div className="py-16 text-center border border-dashed border-border rounded-[3rem]">
                  <p className="text-subtle text-sm font-black uppercase tracking-widest">No anime in this category</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-10 flex-wrap">
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
              disabled={page === 1}
              className="px-4 min-h-11 rounded-xl bg-surface border border-border text-xs font-black text-muted hover:text-foreground hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 uppercase tracking-widest"
            >
              <ChevronLeft size={14} className="inline -mt-0.5" /> Prev
            </button>

            {(() => {
              const nums: (number | "...")[] = []
              for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
                  nums.push(i)
                } else if (nums[nums.length - 1] !== "...") {
                  nums.push("...")
                }
              }
              return nums.map((n, idx) =>
                n === "..." ? (
                  <span key={`d-${idx}`} className="text-subtle px-1 text-xs">…</span>
                ) : (
                  <button key={n}
                    onClick={() => { setPage(n as number); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                    className={`w-11 h-11 rounded-xl text-xs font-black transition-all active:scale-95 ${
                      page === n ? "bg-accent text-black shadow-[0_0_16px_color-mix(in srgb, var(--app-accent) 40%, transparent)]"
                        : "bg-surface border border-border text-muted hover:text-foreground hover:bg-surface"
                    }`}
                  >{n}</button>
                )
              )
            })()}

            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
              disabled={page >= totalPages}
              className="px-4 min-h-11 rounded-xl bg-surface border border-border text-xs font-black text-muted hover:text-foreground hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 uppercase tracking-widest"
            >
              Next <ChevronRight size={14} className="inline -mt-0.5" />
            </button>

            <span className="w-full text-center text-[10px] text-subtle font-black uppercase tracking-widest mt-1">
              Page {page} of {totalPages.toLocaleString()} — {totalAnime.toLocaleString()} total
            </span>
          </div>
        )}
      </div>

      <AnimeModal isOpen={selected !== null} onClose={() => setSelected(null)} anime={selected} />
    </div>
  )
}
