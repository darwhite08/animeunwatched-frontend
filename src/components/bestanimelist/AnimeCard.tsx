"use client"

import { motion } from "framer-motion"
import { Star, Play, Plus, Check } from "lucide-react"
import Image from "next/image"
import type { Anime } from "@/lib/data/anime"
import { useWatchlist } from "@/stores/watchlist.store"
import { useToast } from "@/stores/toast.store"

interface AnimeCardProps {
  anime: Anime
  index: number
  onClick: (anime: Anime) => void
}

export default function AnimeCard({ anime, index, onClick }: AnimeCardProps) {
  const { add, remove, has } = useWatchlist()
  const { push } = useToast()
  const inList = has(anime.id)

  const handleToggleList = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inList) {
      remove(anime.id)
      push(`Removed "${anime.title}" from watchlist`, "info")
    } else {
      add(anime)
      push(`Added "${anime.title}" to watchlist`, "success")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.04, 0.5) }}
      onClick={() => onClick(anime)}
      className="group relative aspect-[2/3] w-full cursor-pointer"
    >
      <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative h-full w-full bg-[#0a0a0a] rounded-[1.8rem] overflow-hidden border border-white/5 hover:border-white/15 transition-colors duration-500">
        {anime.image ? (
          <Image
            src={anime.image}
            alt={anime.title}
            fill
            className="object-cover transition-all duration-700 scale-105 group-hover:scale-110 brightness-[0.7] group-hover:brightness-50"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
            priority={index < 5}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-purple-900/20 flex items-center justify-center">
            <span className="text-3xl font-black text-white/10">{anime.title[0]}</span>
          </div>
        )}

        {/* Rank badge */}
        <div className="absolute top-4 left-4">
          <div className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[9px] font-black text-indigo-400 uppercase italic">
            #{anime.rank}
          </div>
        </div>

        {/* Watchlist toggle */}
        <button
          onClick={handleToggleList}
          className={`absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full transition-all duration-300 ${
            inList
              ? "bg-emerald-500 opacity-100 translate-x-0"
              : "bg-indigo-600 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"
          }`}
        >
          {inList ? <Check size={14} className="text-white" /> : <Plus size={16} className="text-white" />}
        </button>

        {/* Status badge */}
        {anime.status === "airing" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[8px] font-black text-emerald-400 uppercase tracking-wider">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
        )}

        {/* Bottom metadata */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <div className="flex items-center gap-2 mb-1.5">
            <Star size={11} fill="#6366f1" className="text-indigo-500" />
            <span className="text-xs font-black text-white">{anime.rating.toFixed(1)}</span>
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">{anime.year}</span>
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <span className="text-[9px] font-bold text-white/40 uppercase">{anime.type}</span>
          </div>

          <h3 className="text-sm font-black text-white uppercase italic tracking-tighter leading-tight mb-3 line-clamp-2">
            {anime.title}
          </h3>

          <div className="flex flex-wrap gap-1 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {anime.genres.slice(0, 2).map(g => (
              <span key={g} className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-white/10 rounded-full text-white/60">
                {g}
              </span>
            ))}
          </div>

          <button className="w-full py-2.5 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity delay-75 hover:bg-indigo-400 hover:text-white">
            <Play size={11} fill="currentColor" /> View Details
          </button>
        </div>
      </div>
    </motion.div>
  )
}
