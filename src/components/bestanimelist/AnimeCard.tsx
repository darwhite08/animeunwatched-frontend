"use client"

import { motion } from "framer-motion"

interface Props {
  anime: {
    id: number
    rank: number
    title: string
    genres: string[]
    status: string
    format: string
    rating: number
    studio: string
    episodes: number
    description: string
    image: string
  }
  onMoreInfo: () => void
}

export default function AnimeCard({
  anime,
  onMoreInfo,
}: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="group relative flex overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur"
    >
      {/* Poster */}
      <div className="relative h-48 w-36 shrink-0 overflow-hidden">
        <img
          src={anime.image}
          alt={anime.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <h2 className="text-xl font-semibold">
            #{anime.rank} {anime.title}
          </h2>

          <p className="mt-2 text-sm text-white/60">
            {anime.genres.join(", ")}
          </p>

          <p className="mt-2 text-sm text-white/60">
            Episodes: {anime.episodes} | Studio: {anime.studio}
          </p>

          <p className="mt-4 line-clamp-3 text-sm text-white/70">
            {anime.description}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-lg font-semibold text-yellow-400">
            {anime.rating} ★
          </div>

          <div className="flex gap-3">
            <button
              onClick={onMoreInfo}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              More Info
            </button>

            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm hover:bg-indigo-500 transition">
              Watch Now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}