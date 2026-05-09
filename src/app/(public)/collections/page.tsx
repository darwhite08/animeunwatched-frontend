"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ANIME_DB } from "@/lib/data/anime"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import { Layers, ChevronRight } from "lucide-react"

type Collection = {
  id: string
  name: string
  description: string
  filter: (a: Anime) => boolean
  accent: string
  bg: string
  border: string
}

const COLLECTIONS: Collection[] = [
  {
    id: "psychological",
    name: "Mind-Bending Masterpieces",
    description: "Anime that rewires how you think about reality, morality, and what it means to be human.",
    filter: a => a.genres.includes("Psychological") && a.rating >= 8.5,
    accent: "text-purple-400", bg: "from-purple-900/40 to-purple-950/10", border: "border-purple-500/20",
  },
  {
    id: "hidden-gems",
    name: "Hidden Gems",
    description: "Criminally underrated anime that deserve 10x more attention than they get.",
    filter: a => a.rank > 8 && a.rating >= 8.6,
    accent: "text-amber-400", bg: "from-amber-900/40 to-amber-950/10", border: "border-amber-500/20",
  },
  {
    id: "short-watch",
    name: "Binge in a Weekend",
    description: "Complete series under 25 episodes. Maximum impact, minimum time investment.",
    filter: a => (a.episodes ?? 999) <= 25 && a.rating >= 8.6,
    accent: "text-emerald-400", bg: "from-emerald-900/40 to-emerald-950/10", border: "border-emerald-500/20",
  },
  {
    id: "dark-fantasy",
    name: "Dark Fantasy",
    description: "Brutal, beautiful, and unrelenting. For when you want your anime to hurt.",
    filter: a => (a.genres.includes("Seinen") || a.genres.includes("Horror")) && a.rating >= 8.5,
    accent: "text-rose-400", bg: "from-rose-900/40 to-rose-950/10", border: "border-rose-500/20",
  },
  {
    id: "scifi",
    name: "Sci-Fi & Cyberpunk",
    description: "Time travel, mechs, post-human futures, and the weight of technology on the soul.",
    filter: a => a.genres.includes("Sci-Fi"),
    accent: "text-sky-400", bg: "from-sky-900/40 to-sky-950/10", border: "border-sky-500/20",
  },
  {
    id: "emotional",
    name: "Emotional Devastators",
    description: "Warning: keep tissues nearby. These will break you, then rebuild you.",
    filter: a => a.tags.some(t => ["emotional", "tragedy", "grief"].includes(t)),
    accent: "text-indigo-400", bg: "from-indigo-900/40 to-indigo-950/10", border: "border-indigo-500/20",
  },
]

export default function CollectionsPage() {
  const [active, setActive] = useState<string | null>(null)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)

  const activeCollection = COLLECTIONS.find(c => c.id === active)
  const filtered = activeCollection ? ANIME_DB.filter(activeCollection.filter) : []

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <Layers size={20} className="text-indigo-400" />
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60">Curated Collections</p>
        </div>
        <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase italic text-white leading-none mb-4">
          Collections<span className="text-indigo-500">.</span>
        </h1>
        <p className="text-white/35 text-lg max-w-xl">
          Hand-picked anime grouped by mood, theme, and what they'll do to your soul.
        </p>
      </div>

      {/* Collection grid */}
      <div className="max-w-7xl mx-auto px-6 space-y-4">
        {COLLECTIONS.map((col, i) => {
          const items = ANIME_DB.filter(col.filter).slice(0, 4)
          const isActive = active === col.id

          return (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              {/* Collection header */}
              <button
                onClick={() => setActive(isActive ? null : col.id)}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                  isActive
                    ? `bg-gradient-to-br ${col.bg} ${col.border}`
                    : "bg-white/[0.02] border-white/8 hover:border-white/15 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className={`text-lg font-black ${isActive ? col.accent : "text-white/80"}`}>
                      {col.name}
                    </h2>
                    <span className="text-[9px] font-black text-white/25 font-mono">
                      {ANIME_DB.filter(col.filter).length} anime
                    </span>
                  </div>
                  <p className="text-sm text-white/40">{col.description}</p>
                </div>

                {/* Preview covers */}
                <div className="flex -space-x-3 shrink-0 hidden sm:flex">
                  {items.map((a, idx) => (
                    <div key={a.id} className="relative h-10 w-8 rounded-lg overflow-hidden border-2 border-[#020202]" style={{ zIndex: 4 - idx }}>
                      <Image src={a.image} alt={a.title} fill className="object-cover" sizes="32px" />
                    </div>
                  ))}
                </div>

                <motion.div animate={{ rotate: isActive ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight size={18} className={isActive ? col.accent : "text-white/20"} />
                </motion.div>
              </button>

              {/* Expanded grid */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 pb-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {ANIME_DB.filter(col.filter).map((a, idx) => (
                        <AnimeCard key={a.id} anime={a} index={idx} onClick={setSelectedAnime} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      <AnimeModal isOpen={selectedAnime !== null} onClose={() => setSelectedAnime(null)} anime={selectedAnime} />
    </div>
  )
}
