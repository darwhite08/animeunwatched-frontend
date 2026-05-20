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
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-10">
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-3">Neural Rankings</p>
        <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none mb-2">
          Rankings<span style={{color:"#f59e0b"}}>.</span>
        </h1>
        <p className="text-white/35 text-sm mb-10">Ranked by community credibility-weighted scores</p>

        {/* Category tabs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => changeCategory(c.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                cat === c.id ? "border-indigo-500/40 bg-indigo-500/10" : "border-white/8 bg-white/[0.02] hover:border-white/15"
              }`}>
              <c.icon size={16} className={cat === c.id ? "text-amber-400" : "text-white/30"} />
              <p className={`font-black text-sm mt-2 ${cat === c.id ? "text-white" : "text-white/60"}`}>{c.label}</p>
              <p className="text-[9px] text-white/25 mt-0.5 leading-tight">{c.desc}</p>
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
          <div className="py-24 text-center border border-dashed border-white/5 rounded-[3rem]">
            <p className="text-white/20 text-xs font-black uppercase tracking-widest">Failed to load rankings</p>
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
                <div className="grid grid-cols-3 gap-4 mb-10">
                  {[1, 0, 2].map((pos, i) => {
                    const anime = top3[pos]
                    if (!anime) return null
                    const medals = ["🥈", "🥇", "🥉"]
                    return (
                      <motion.div key={anime.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => setSelected(anime)}
                        className={`group p-5 rounded-2xl border cursor-pointer transition-all hover:border-indigo-500/30 ${
                          pos === 0 ? "border-amber-500/30 bg-amber-500/5" : "border-white/8 bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{medals[i]}</span>
                          <span className="text-[10px] font-black text-white/30 font-mono">#{pos + 1}</span>
                        </div>
                        <p className="font-black text-white/90 group-hover:text-white text-sm leading-tight line-clamp-2">
                          {anime.title}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Star size={10} fill="#f59e0b" className="text-amber-400" />
                          <span className="text-xs font-black text-white/60">{anime.rating.toFixed(1)}</span>
                          <span className="text-[9px] text-white/25">· {anime.year}</span>
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
                <div className="py-16 text-center border border-dashed border-white/5 rounded-[3rem]">
                  <p className="text-white/20 text-sm font-black uppercase tracking-widest">No anime in this category</p>
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
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
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
                  <span key={`d-${idx}`} className="text-white/20 px-1 text-xs">…</span>
                ) : (
                  <button key={n}
                    onClick={() => { setPage(n as number); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                      page === n ? "bg-amber-500 text-black shadow-[0_0_16px_rgba(245,158,11,0.4)]"
                        : "bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                    }`}
                  >{n}</button>
                )
              )
            })()}

            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
            >
              Next <ChevronRight size={14} className="inline -mt-0.5" />
            </button>

            <span className="w-full text-center text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">
              Page {page} of {totalPages.toLocaleString()} — {totalAnime.toLocaleString()} total
            </span>
          </div>
        )}
      </div>

      <AnimeModal isOpen={selected !== null} onClose={() => setSelected(null)} anime={selected} />
    </div>
  )
}
