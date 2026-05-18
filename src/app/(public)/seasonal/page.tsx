"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"
import { CalendarDays, ChevronRight, Loader2 } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"

const SEASONS = ["winter", "spring", "summer", "fall"] as const
const SEASON_DATA = {
  winter: { emoji: "❄️", months: "Jan–Mar", color: "from-blue-900/30 to-slate-900/10",   border: "border-blue-500/20",   accent: "text-blue-400",   cta: "bg-blue-700 hover:bg-blue-600" },
  spring: { emoji: "🌸", months: "Apr–Jun", color: "from-pink-900/30 to-rose-900/10",    border: "border-pink-500/20",   accent: "text-pink-400",   cta: "bg-pink-700 hover:bg-pink-600" },
  summer: { emoji: "☀️", months: "Jul–Sep", color: "from-amber-900/30 to-orange-900/10", border: "border-amber-500/20",  accent: "text-amber-400",  cta: "bg-amber-700 hover:bg-amber-600" },
  fall:   { emoji: "🍂", months: "Oct–Dec", color: "from-orange-900/30 to-red-900/10",   border: "border-orange-500/20", accent: "text-orange-400", cta: "bg-orange-700 hover:bg-orange-600" },
}

const YEARS = [2024, 2023, 2022, 2021]

function mapDTO(a: AnimeDTO, i: number): Anime {
  return {
    id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "",
    rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes,
    type: (["TV","Movie","OVA"] as const).includes(a.type as "TV"|"Movie"|"OVA") ? (a.type as "TV"|"Movie"|"OVA") : "TV",
    status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished",
    studio: a.studios[0] ?? "Unknown", genres: a.genres,
    synopsis: a.synopsis ?? "", image: a.imageUrl ?? "",
    tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i + 1,
  }
}

export default function SeasonalPage() {
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const { data, isLoading } = useBrowseAnime({ limit: 50 })

  const allAnime = data?.data?.map(mapDTO) ?? []
  const airingCount = allAnime.filter(a => a.status === "airing").length
  const currentYear = 2024

  const grid = YEARS.map(year => ({
    year,
    seasons: SEASONS.map(s => ({
      season: s,
      anime: allAnime.filter(a => a.year === year).slice(0, 4),
      count: allAnime.filter(a => a.year === year).length,
    })),
  }))

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <CalendarDays size={18} className="text-indigo-400" />
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60">Seasonal Archive</p>
        </div>
        <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none mb-3">
          Seasonal<span className="text-indigo-500">.</span>
        </h1>
        <p className="text-white/35 text-sm mb-8">Browse anime by airing season — every year, every quarter.</p>

        {/* Current season hero */}
        <div className={`p-8 rounded-[2rem] bg-gradient-to-br ${SEASON_DATA.fall.color} ${SEASON_DATA.fall.border} border flex flex-col md:flex-row items-center justify-between gap-6`}>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-orange-400/70 mb-2">Now Airing</p>
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              {SEASON_DATA.fall.emoji} Fall {currentYear}
            </h2>
            <p className="text-white/35 text-sm mt-1">{SEASON_DATA.fall.months} · {airingCount} anime airing</p>
          </div>
          <Link href={`/anime/season/${currentYear}/fall`}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl ${SEASON_DATA.fall.cta} text-sm font-black uppercase tracking-widest text-white transition-all shrink-0`}>
            Browse Fall {currentYear} <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>
      )}

      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {grid.map(({ year, seasons }) => (
          <div key={year}>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-black tracking-tighter text-white/80 uppercase italic">{year}</h2>
              <div className="flex-1 h-px bg-white/5" />
              <Link href={`/anime/season/${year}/fall`}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
                All seasons →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {seasons.map(({ season, anime, count }) => {
                const s = SEASON_DATA[season]
                return (
                  <motion.div key={season} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <Link href={`/anime/season/${year}/${season}`}
                      className={`group block p-5 rounded-2xl bg-gradient-to-br ${s.color} ${s.border} border hover:border-white/20 transition-all space-y-3`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl">{s.emoji}</span>
                          <p className={`text-sm font-black uppercase ${s.accent} mt-1`}>{season}</p>
                          <p className="text-[9px] text-white/30">{s.months}</p>
                        </div>
                        <ChevronRight size={14} className="text-white/20 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="flex -space-x-2">
                        {anime.slice(0, 4).map(a => (
                          <div key={a.id} className="relative h-8 w-6 rounded overflow-hidden border border-black/40 shrink-0 bg-white/10">
                            {a.image && <img src={a.image} alt={a.title} className="w-full h-full object-cover" />}
                          </div>
                        ))}
                        {anime.length === 0 && (
                          <div className="h-8 w-6 rounded bg-white/5 border border-white/10" />
                        )}
                      </div>
                      <p className="text-[9px] text-white/25 font-mono">{count} in archive</p>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <AnimeModal isOpen={selectedAnime !== null} onClose={() => setSelectedAnime(null)} anime={selectedAnime} />
    </div>
  )
}
