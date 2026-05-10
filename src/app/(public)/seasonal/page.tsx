"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ANIME_DB } from "@/lib/data/anime"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import { CalendarDays, Star, ChevronRight } from "lucide-react"

const SEASONS = ["winter","spring","summer","fall"] as const
const SEASON_DATA = {
  winter: { emoji:"❄️", months:"Jan–Mar", color:"from-blue-900/30 to-slate-900/10", accent:"text-blue-400" },
  spring: { emoji:"🌸", months:"Apr–Jun", color:"from-pink-900/30 to-rose-900/10",  accent:"text-pink-400"  },
  summer: { emoji:"☀️", months:"Jul–Sep", color:"from-amber-900/30 to-orange-900/10",accent:"text-amber-400"},
  fall:   { emoji:"🍂", months:"Oct–Dec", color:"from-orange-900/30 to-red-900/10",  accent:"text-orange-400"},
}

const YEARS = [2024, 2023, 2022]

export default function SeasonalPage() {
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const currentYear = 2024

  // Group by year × season
  const grid = YEARS.map(year => ({
    year,
    seasons: SEASONS.map(s => ({
      season: s,
      anime: ANIME_DB.filter(a => a.year === year).slice(0, 4),
    })),
  }))

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* Header */}
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
        <div className={`p-8 rounded-[2rem] bg-gradient-to-br ${SEASON_DATA.fall.color} border border-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-6`}>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-orange-400/70 mb-2">Now Airing</p>
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              {SEASON_DATA.fall.emoji} Fall {currentYear}
            </h2>
            <p className="text-white/35 text-sm mt-1">{SEASON_DATA.fall.months} · {ANIME_DB.filter(a=>a.status==="airing").length} anime airing</p>
          </div>
          <Link href={`/anime/season/${currentYear}/fall`}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-sm font-black uppercase tracking-widest text-white transition-all shrink-0"
          >
            Browse Fall {currentYear} <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Year grids */}
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {grid.map(({ year, seasons }) => (
          <div key={year}>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-black tracking-tighter text-white/80 uppercase italic">{year}</h2>
              <div className="flex-1 h-px bg-white/5" />
              <Link href={`/anime/season/${year}/fall`}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
              >All seasons →</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {seasons.map(({ season, anime }) => {
                const s = SEASON_DATA[season]
                return (
                  <motion.div key={season} initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
                    <Link href={`/anime/season/${year}/${season}`}
                      className={`group block p-5 rounded-2xl bg-gradient-to-br ${s.color} border border-white/8 hover:border-white/20 transition-all space-y-3`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl">{s.emoji}</span>
                          <p className={`text-sm font-black uppercase ${s.accent} mt-1`}>{season}</p>
                          <p className="text-[9px] text-white/30">{s.months}</p>
                        </div>
                        <ChevronRight size={14} className="text-white/20 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>

                      {/* Mini preview covers */}
                      <div className="flex -space-x-2">
                        {anime.slice(0,4).map(a => (
                          <div key={a.id} className="relative h-8 w-6 rounded overflow-hidden border border-black/40 shrink-0">
                            <img src={a.image} alt={a.title} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>

                      <p className="text-[9px] text-white/25 font-mono">
                        {ANIME_DB.filter(a=>a.year===year).length} in archive
                      </p>
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
