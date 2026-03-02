"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import Image from "next/image"
import { useEffect } from "react"

type Anime = {
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

type Props = {
  anime: Anime | null
  onClose: () => void
}

export default function AnimeModal({ anime, onClose }: Props) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  return (
    <AnimatePresence>
      {anime && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-neutral-900/80 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute right-6 top-6 z-10 rounded-lg bg-white/10 p-2 hover:bg-white/20 transition"
              >
                <X size={18} />
              </button>

              <div className="grid md:grid-cols-2 gap-8 p-8">
                {/* Poster */}
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden">
                  <Image
                    src={anime.image}
                    alt={anime.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-6 text-white">
                  <div>
                    <span className="text-sm text-indigo-400 font-medium">
                      Rank #{anime.rank}
                    </span>
                    <h2 className="text-3xl font-bold mt-2">
                      {anime.title}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
                    <div>
                      <p className="text-white/40">Studio</p>
                      <p>{anime.studio}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Episodes</p>
                      <p>{anime.episodes}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Status</p>
                      <p>{anime.status}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Rating</p>
                      <p>{anime.rating}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-white/40 mb-2">Synopsis</p>
                    <p className="text-white/70 leading-relaxed">
                      {anime.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}