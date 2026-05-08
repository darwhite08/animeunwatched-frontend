"use client"

import { use, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ANIME_DB, type Anime } from "@/lib/data/anime"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import Link from "next/link"

const SEASONS = ["winter", "spring", "summer", "fall"] as const
type Season = typeof SEASONS[number]

const SEASON_MONTHS: Record<Season, string> = {
  winter: "Jan – Mar",
  spring: "Apr – Jun",
  summer: "Jul – Sep",
  fall:   "Oct – Dec",
}

const SEASON_GRADIENTS: Record<Season, string> = {
  winter: "from-blue-900/40 to-slate-800/20",
  spring: "from-pink-900/40 to-rose-800/20",
  summer: "from-amber-900/40 to-orange-800/20",
  fall:   "from-orange-900/40 to-red-800/20",
}

export default function SeasonPage({ params }: { params: Promise<{ year: string; season: string }> }) {
  const { year: yearStr, season } = use(params)
  const year = parseInt(yearStr, 10)
  const seasonLower = season.toLowerCase() as Season
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)

  // Filter ANIME_DB by year (and optionally season)
  const animeList = useMemo(() =>
    ANIME_DB.filter(a => a.year === year).sort((a, b) => b.rating - a.rating)
  , [year])

  // Navigation — prev/next season
  const seasonIdx = SEASONS.indexOf(seasonLower)
  const prevSeason = seasonIdx > 0
    ? { year, season: SEASONS[seasonIdx - 1] }
    : { year: year - 1, season: "fall" as Season }
  const nextSeason = seasonIdx < 3
    ? { year, season: SEASONS[seasonIdx + 1] }
    : { year: year + 1, season: "winter" as Season }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* Hero */}
      <div className={`relative bg-gradient-to-br ${SEASON_GRADIENTS[seasonLower] ?? "from-indigo-900/40 to-slate-800/20"} border-b border-white/5`}>
        <div className="max-w-6xl mx-auto px-6 py-20 pt-32">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/30 mb-3">
                <Calendar size={11} className="inline mr-1.5" />
                {SEASON_MONTHS[seasonLower]} · {year}
              </p>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white leading-none">
                {seasonLower.charAt(0).toUpperCase() + seasonLower.slice(1)}
                <span className="text-indigo-500">.</span>
                <br />
                <span className="text-white/40">{year}</span>
              </h1>
              <p className="text-white/35 text-sm mt-4">
                {animeList.length} anime in the neural archive for this season
              </p>
            </div>

            {/* Season navigation */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/anime/season/${prevSeason.year}/${prevSeason.season}`}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <ChevronLeft size={13} /> Prev
              </Link>
              <Link
                href={`/anime/season/${nextSeason.year}/${nextSeason.season}`}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                Next <ChevronRight size={13} />
              </Link>
            </div>
          </div>

          {/* Season tabs */}
          <div className="flex items-center gap-2 mt-8">
            {SEASONS.map(s => (
              <Link
                key={s}
                href={`/anime/season/${year}/${s}`}
                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  s === seasonLower
                    ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                    : "bg-white/5 text-white/35 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Anime grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {animeList.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            <AnimatePresence>
              {animeList.map((anime, i) => (
                <AnimeCard key={anime.id} anime={anime} index={i} onClick={setSelectedAnime} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-24 text-center border border-dashed border-white/5 rounded-[3rem]">
            <p className="text-white/20 font-black uppercase tracking-widest text-sm">
              No anime in the archive for {seasonLower} {year}
            </p>
            <p className="text-white/15 text-xs mt-2">
              Try <Link href={`/anime/season/${year - 1}/fall`} className="text-indigo-400 hover:underline">Fall {year - 1}</Link> or <Link href="/bestanimelist" className="text-indigo-400 hover:underline">browse all anime</Link>
            </p>
          </div>
        )}
      </div>

      <AnimeModal isOpen={selectedAnime !== null} onClose={() => setSelectedAnime(null)} anime={selectedAnime} />
    </div>
  )
}
