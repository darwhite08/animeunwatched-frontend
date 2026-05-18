"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Star } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"

function mapDTO(a: AnimeDTO, i: number) {
  return { id: String(a.malId), title: a.title, rating: a.score ?? 0, image: a.imageUrl ?? "" }
}

export default function RecommendationCard() {
  const { data, isLoading } = useBrowseAnime({ limit: 10 })
  const PICKS = [...(data?.data ?? [])]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3)
    .map(mapDTO)
  if (isLoading) {
    return (
      <div className="p-8 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] relative overflow-hidden h-48 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] relative overflow-hidden group">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/8 blur-[60px] rounded-full pointer-events-none group-hover:bg-indigo-600/14 transition-colors duration-700" />

      <div className="relative z-10 flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Neural Oracle</span>
          </div>
          <h3 className="text-xl font-black tracking-tighter text-white">Recommended for You</h3>
          <p className="text-xs text-white/35 mt-1">Based on your Anime DNA profile</p>
        </div>
        <Link
          href="/ai-discover"
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Discover All <ArrowRight size={11} />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 relative z-10">
        {PICKS.map((anime, i) => (
          <motion.div
            key={anime.id}
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={`/anime/${anime.id}`} className="group/card block">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2">
                <img
                  src={anime.image}
                  alt={anime.title}
                  className="w-full h-full object-cover brightness-75 group-hover/card:brightness-90 transition-all duration-500 scale-105 group-hover/card:scale-100"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/50 to-transparent p-2">
                  <div className="flex items-center gap-1">
                    <Star size={9} fill="#f59e0b" className="text-amber-400" />
                    <span className="text-[9px] font-black text-white">{anime.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] font-black text-white/60 group-hover/card:text-white transition-colors line-clamp-2 leading-tight">
                {anime.title}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
