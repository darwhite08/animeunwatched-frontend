"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Star, ChevronRight } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"

function mapDTO(a: AnimeDTO, i: number) {
  return { id: String(a.malId), title: a.title, rating: a.score ?? 0, studio: a.studios[0] ?? "Unknown", image: a.imageUrl ?? "" }
}

/* ── Score dot colour ── */
function scoreColour(score: number) {
  if (score >= 9.5) return "text-amber-400"
  if (score >= 9)   return "text-amber-400"
  return "text-white/60"
}

/* ── Component ── */
export default function TopAnimeCard() {
  const { data, isLoading } = useBrowseAnime({ limit: 5 })
  const TOP_FIVE = (data?.data ?? []).map(mapDTO)

  if (isLoading) {
    return (
      <div className="p-8 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] relative overflow-hidden h-48 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-8 -right-8 w-40 h-40 bg-amber-500/5 blur-[60px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-7 relative z-10">
        <div className="flex items-center gap-2">
          <Star size={14} className="text-amber-400" fill="currentColor" />
          <h4 className="text-xs font-black uppercase tracking-[0.28em] text-white/30">Your Top Anime</h4>
        </div>
        <Link
          href="/rate"
          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-400/60 hover:text-amber-400 transition-colors"
        >
          Rate Another <ChevronRight size={10} />
        </Link>
      </div>

      {/* Ranked list */}
      <ol className="space-y-2 relative z-10">
        {TOP_FIVE.map((anime, i) => {
          const personal = anime.rating

          return (
            <motion.li
              key={anime.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                href={`/anime/${anime.id}`}
                className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/[0.03] transition-colors"
              >
                {/* Rank */}
                <span className={`w-5 text-center text-xs font-black shrink-0 ${
                  i === 0 ? "text-amber-400" : "text-white/20"
                }`}>
                  #{i + 1}
                </span>

                {/* Cover thumbnail */}
                <div className="h-10 w-8 rounded-xl overflow-hidden shrink-0 bg-white/5">
                  <img
                    src={anime.image}
                    alt={anime.title}
                    className="w-full h-full object-cover brightness-75 group-hover:brightness-90 transition-all"
                  />
                </div>

                {/* Title + studio */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white/80 group-hover:text-white transition-colors truncate leading-tight">
                    {anime.title}
                  </p>
                  <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5 truncate">
                    {anime.studio}
                  </p>
                </div>

                {/* Personal score */}
                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  <span className={`text-base font-black leading-none ${scoreColour(personal)}`}>
                    {personal.toFixed(1)}
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-white/20">
                    Personal
                  </span>
                </div>
              </Link>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
