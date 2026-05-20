"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"

interface SimilarAnimeProps {
  currentId: string
  genres: string[]
}

function mapDTO(a: AnimeDTO, i: number) {
  return { id: String(a.malId), title: a.title, rating: a.score ?? 0, studio: a.studios[0] ?? "Unknown", image: a.imageUrl ?? "", genres: a.genres }
}

export default function SimilarAnime({ currentId, genres }: SimilarAnimeProps) {
  const { data, isLoading } = useBrowseAnime({ limit: 12 })
  const similar = (data?.data ?? [])
    .map(mapDTO)
    .filter(a => a.id !== currentId && a.genres.some(g => genres.includes(g)))
    .slice(0, 4)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase italic tracking-widest text-white/40">More Like This</h3>
        <div className="flex items-center justify-center h-20">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (similar.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase italic tracking-widest text-white/40">
        More Like This
      </h3>

      <div className="space-y-3">
        {similar.map((anime, i) => (
          <motion.div
            key={anime.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Link
              href={`/anime/${anime.id}`}
              className="group flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition-all duration-300"
            >
              {/* Cover thumbnail */}
              <div className="relative h-14 w-10 flex-shrink-0 rounded-lg overflow-hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-b from-indigo-500/30 to-purple-500/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Image
                  src={anime.image}
                  alt={anime.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="40px"
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-white uppercase italic tracking-tighter leading-tight truncate group-hover:text-indigo-300 transition-colors duration-300">
                  {anime.title}
                </p>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-wider mt-0.5 truncate">
                  {anime.studio}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={9} fill="#f59e0b" className="text-amber-400 flex-shrink-0" />
                  <span className="text-[9px] font-black text-white/60">
                    {anime.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
