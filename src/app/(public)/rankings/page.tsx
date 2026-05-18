"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"
import { BarChart3, Star, TrendingUp, Award, Zap, Loader2 } from "lucide-react"
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

const CATEGORIES = [
  { id: "score",   label: "Highest Rated", icon: Star,       desc: "Ranked purely by community score",  filter: (a: Anime) => true,              sort: (a: Anime, b: Anime) => b.rating - a.rating },
  { id: "airing",  label: "Top Airing",    icon: Zap,        desc: "Best currently airing series",      filter: (a: Anime) => a.status==="airing", sort: (a: Anime, b: Anime) => b.rating - a.rating },
  { id: "movie",   label: "Best Movies",   icon: Award,      desc: "Highest rated anime films",         filter: (a: Anime) => a.type==="Movie",    sort: (a: Anime, b: Anime) => b.rating - a.rating },
  { id: "classic", label: "Classic Picks", icon: TrendingUp, desc: "Best anime from before 2010",       filter: (a: Anime) => a.year > 0 && a.year < 2010, sort: (a: Anime, b: Anime) => b.rating - a.rating },
  { id: "new",     label: "Recent Best",   icon: BarChart3,  desc: "Top rated anime from 2020+",        filter: (a: Anime) => a.year >= 2020,      sort: (a: Anime, b: Anime) => b.rating - a.rating },
]

export default function RankingsPage() {
  const [cat, setCat] = useState("score")
  const [selected, setSelected] = useState<Anime | null>(null)

  const { data, isLoading } = useBrowseAnime({ limit: 50 })

  const allAnime = useMemo(() => {
    if (!data?.data) return []
    return data.data.map((a, i) => mapDTO(a, i + 1))
  }, [data])

  const active = CATEGORIES.find(c => c.id === cat)!
  const ranked = useMemo(() =>
    allAnime.filter(active.filter).sort(active.sort)
  , [allAnime, active])

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-10">
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60 mb-3">Neural Rankings</p>
        <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none mb-2">
          Rankings<span className="text-indigo-500">.</span>
        </h1>
        <p className="text-white/35 text-sm mb-10">Ranked by community credibility-weighted scores</p>

        {/* Category cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                cat === c.id ? "border-indigo-500/40 bg-indigo-500/10" : "border-white/8 bg-white/[0.02] hover:border-white/15"
              }`}>
              <c.icon size={16} className={cat === c.id ? "text-indigo-400" : "text-white/30"} />
              <p className={`font-black text-sm mt-2 ${cat === c.id ? "text-white" : "text-white/60"}`}>{c.label}</p>
              <p className="text-[9px] text-white/25 mt-0.5 leading-tight">{c.desc}</p>
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Top 3 podium */}
            {ranked.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[1, 0, 2].map((pos, i) => {
                  const anime = ranked[pos]
                  if (!anime) return null
                  const medals = ["🥈", "🥇", "🥉"]
                  return (
                    <motion.div key={anime.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      onClick={() => setSelected(anime)}
                      className={`group p-5 rounded-2xl border cursor-pointer transition-all hover:border-indigo-500/30 ${
                        pos === 0 ? "border-amber-500/30 bg-amber-500/5" : "border-white/8 bg-white/[0.02]"
                      }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{medals[i]}</span>
                        <span className="text-[10px] font-black text-white/30 font-mono">#{pos + 1}</span>
                      </div>
                      <p className="font-black text-white/90 group-hover:text-white text-sm leading-tight line-clamp-2">{anime.title}</p>
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

            {/* Full grid */}
            {ranked.length > 3 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {ranked.slice(3).map((a, i) => (
                  <AnimeCard key={a.id} anime={a} index={i + 3} onClick={setSelected} />
                ))}
              </div>
            )}

            {ranked.length === 0 && (
              <div className="py-16 text-center border border-dashed border-white/5 rounded-[3rem]">
                <p className="text-white/20 text-sm font-black uppercase tracking-widest">No anime in this category yet</p>
              </div>
            )}
          </>
        )}
      </div>
      <AnimeModal isOpen={selected !== null} onClose={() => setSelected(null)} anime={selected} />
    </div>
  )
}
