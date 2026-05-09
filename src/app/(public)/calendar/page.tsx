"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ANIME_DB } from "@/lib/data/anime"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import type { Anime } from "@/lib/data/anime"
import Link from "next/link"

const SEASONS = ["winter", "spring", "summer", "fall"] as const
type Season = typeof SEASONS[number]

const CURRENT_YEAR = 2024
const SEASON_MONTHS: Record<Season, string> = { winter: "Jan–Mar", spring: "Apr–Jun", summer: "Jul–Sep", fall: "Oct–Dec" }
const SEASON_EMOJI: Record<Season, string> = { winter: "❄️", spring: "🌸", summer: "☀️", fall: "🍂" }

export default function CalendarPage() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const [activeSeason, setActiveSeason] = useState<Season>("fall")
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)

  const filtered = ANIME_DB
    .filter(a => a.year === year)
    .sort((a, b) => b.rating - a.rating)

  const airing  = filtered.filter(a => a.status === "airing")
  const finished = filtered.filter(a => a.status === "finished")

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">

      {/* Hero */}
      <div className="border-b border-white/5 bg-[#020202]/80 backdrop-blur-md sticky top-[72px] z-30">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-indigo-400" />
                <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60">Seasonal Calendar</p>
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
                Anime Schedule<span className="text-indigo-500">.</span>
              </h1>
            </div>

            {/* Year nav */}
            <div className="flex items-center gap-3">
              <button onClick={() => setYear(y => y - 1)} className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-2xl font-black tracking-tighter text-white w-16 text-center">{year}</span>
              <button onClick={() => setYear(y => y + 1)} className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Season tabs */}
          <div className="flex items-center gap-2 mt-4">
            {SEASONS.map(s => (
              <button
                key={s}
                onClick={() => setActiveSeason(s)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeSeason === s
                    ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                    : "bg-white/5 text-white/35 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                <span>{SEASON_EMOJI[s]}</span>
                {s.charAt(0).toUpperCase() + s.slice(1)}
                <span className="text-[8px] opacity-60">{SEASON_MONTHS[s]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">

        {/* Currently Airing */}
        {airing.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Currently Airing — {year}
              </span>
              <span className="text-xs text-white/30">{airing.length} series</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {airing.map((anime, i) => (
                <AnimeCard key={anime.id} anime={anime} index={i} onClick={setSelectedAnime} />
              ))}
            </div>
          </div>
        )}

        {/* Finished this year */}
        {finished.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-wider">
                Finished — {year}
              </span>
              <span className="text-xs text-white/30">{finished.length} series</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {finished.map((anime, i) => (
                <AnimeCard key={anime.id} anime={anime} index={i} onClick={setSelectedAnime} />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center border border-dashed border-white/5 rounded-[3rem]">
            <Calendar size={28} className="mx-auto mb-3 text-white/15" />
            <p className="text-white/20 font-black uppercase tracking-widest text-sm">No anime in archive for {year}</p>
            <p className="text-white/15 text-xs mt-2">Try <button onClick={() => setYear(2024)} className="text-indigo-400 hover:underline">2024</button></p>
          </motion.div>
        )}
      </div>

      <AnimeModal isOpen={selectedAnime !== null} onClose={() => setSelectedAnime(null)} anime={selectedAnime} />
    </div>
  )
}
