"use client"

import { motion } from "framer-motion"
import { Plus, Check } from "lucide-react"
import { Star, Play } from "@phosphor-icons/react"
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.035, 0.4), ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onClick(anime)}
      className="group relative aspect-[2/3] w-full cursor-pointer"
    >
      {/* Premium glow on hover — gold tint */}
      <div className="absolute -inset-[3px] rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.25), rgba(99,102,241,0.20))", filter: "blur(12px)" }}
      />

      <div className="relative h-full w-full bg-[#0a0a12] rounded-[1.7rem] overflow-hidden border border-white/[0.07] group-hover:border-amber-500/25 transition-colors duration-500"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
      >
        {/* Poster image */}
        {anime.image ? (
          <Image
            src={anime.image}
            alt={anime.title}
            fill
            className="object-cover transition-all duration-700 scale-[1.04] group-hover:scale-110 brightness-[0.75] group-hover:brightness-[0.45]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 18vw"
            priority={index < 6}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-violet-900/30 flex items-center justify-center">
            <span className="text-4xl font-black text-white/10 uppercase">{anime.title[0]}</span>
          </div>
        )}

        {/* Score badge — gold */}
        {anime.rating > 0 && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-md"
              style={{
                background: "linear-gradient(135deg, rgba(245,158,11,0.3), rgba(245,158,11,0.15))",
                border: "1px solid rgba(245,158,11,0.4)",
                boxShadow: "0 2px 8px rgba(245,158,11,0.15)",
              }}
            >
              <Star size={9} weight="fill" className="text-amber-400" />
              <span className="text-[9px] font-black text-amber-300">{anime.rating.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Watchlist button */}
        <button
          onClick={handleToggleList}
          className={`absolute top-3 right-3 h-7 w-7 flex items-center justify-center rounded-full transition-all duration-300 shadow-lg ${
            inList
              ? "bg-emerald-500 opacity-100 scale-100"
              : "bg-amber-600/90 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
          }`}
        >
          {inList ? <Check size={12} className="text-white" /> : <Plus size={13} className="text-white" />}
        </button>

        {/* Live badge */}
        {anime.status === "airing" && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2">
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[7px] font-black text-emerald-400 uppercase tracking-wider backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
        )}

        {/* Bottom info panel — slides up on hover */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-400"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.85) 60%, transparent 100%)" }}
        >
          {/* Year + type meta */}
          <div className="flex items-center gap-1.5 mb-1.5 opacity-60 group-hover:opacity-80 transition-opacity">
            <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">{anime.year}</span>
            <span className="w-0.5 h-0.5 rounded-full bg-white/25" />
            <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">{anime.type}</span>
          </div>

          <h3 className="text-[11px] font-black text-white uppercase italic tracking-tight leading-tight mb-2.5 line-clamp-2">
            {anime.title}
          </h3>

          {/* Genre tags — appear on hover */}
          <div className="flex flex-wrap gap-1 mb-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
            {anime.genres.slice(0, 2).map(g => (
              <span key={g} className="text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.15)", color: "rgba(245,158,11,0.7)" }}>
                {g}
              </span>
            ))}
          </div>

          {/* CTA button — premium gold */}
          <button className="w-full py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.9), rgba(251,191,36,0.8))",
              color: "#000",
              boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
            }}
          >
            <Play size={10} weight="fill" /> View Details
          </button>
        </div>
      </div>
    </motion.div>
  )
}
