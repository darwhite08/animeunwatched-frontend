"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Building2, Star } from "lucide-react"
import Image from "next/image"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"
import { useBrowseAnime } from "@/hooks/useAnime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

// ─── Studio config ────────────────────────────────────────────────────────────

const STUDIOS = [
  "MAPPA",
  "Madhouse",
  "Bones",
  "Gainax",
  "Sunrise",
  "White Fox",
  "OLM",
  "A-1 Pictures",
  "ufotable",
  "Wit Studio",
  "Artland",
  "Trigger",
  "Shaft",
  "Kyoto Animation",
] as const

type Studio = (typeof STUDIOS)[number]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function StudiosPage() {
  const [activeStudio, setActiveStudio] = useState<Studio | null>(null)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const { data: browseData } = useBrowseAnime({ limit: 50 })
  const allAnime = (browseData?.data ?? []).map(mapDTO)

  const studioMap = useMemo(() => {
    const map: Record<string, Anime[]> = {}
    for (const studio of STUDIOS) {
      map[studio] = allAnime.filter((a) => a.studio === studio)
    }
    return map
  }, [allAnime])

  const handleStudioClick = (studio: Studio) => {
    setActiveStudio((prev) => (prev === studio ? null : studio))
  }

  const avgRating = (animeList: Anime[]) => {
    if (animeList.length === 0) return 0
    const sum = animeList.reduce((acc, a) => acc + a.rating, 0)
    return sum / animeList.length
  }

  return (
    <div className="min-h-screen bg-[#020202] pb-40">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-14">
        <motion.p
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-violet-400 font-black uppercase tracking-[0.4em] text-[10px] mb-4"
        >
          <Building2 size={13} /> Production Houses
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-white italic leading-none"
        >
          Studio<span className="text-violet-500">.</span>
          <br />
          <span className="text-white/20">Archive</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-white/30 text-sm font-medium"
        >
          {STUDIOS.length} studios · {allAnime.length} titles catalogued
        </motion.p>
      </div>

      {/* Studio grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STUDIOS.map((studio, i) => {
            const animeList = studioMap[studio] ?? []
            const isOpen = activeStudio === studio
            const featured = animeList[0]
            const avg = avgRating(animeList)

            return (
              <div key={studio} className="flex flex-col">
                <motion.button
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleStudioClick(studio)}
                  className={`w-full text-left rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] ${
                    isOpen ? "ring-1 ring-violet-500/30 border-violet-900/40" : ""
                  }`}
                >
                  <div className="flex items-stretch">
                    {/* Featured cover */}
                    <div className="relative w-24 shrink-0">
                      {featured ? (
                        <Image
                          src={featured.image}
                          alt={featured.title}
                          fill
                          className="object-cover brightness-60"
                          sizes="96px"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-white/5" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]/80" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-5 min-w-0">
                      <h2 className="text-base font-black uppercase italic tracking-tight text-white truncate mb-3">
                        {studio}
                      </h2>

                      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">
                            Titles
                          </span>
                          <span className="text-[11px] font-black text-white/70">
                            {animeList.length}
                          </span>
                        </div>
                        {animeList.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Star
                              size={10}
                              fill="#8b5cf6"
                              className="text-violet-400"
                            />
                            <span className="text-[11px] font-black text-white/70">
                              {avg.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Top titles preview */}
                      {animeList.length > 0 && (
                        <p className="mt-2.5 text-[9px] font-black text-white/25 uppercase tracking-widest truncate">
                          {animeList
                            .slice(0, 3)
                            .map((a) => a.title)
                            .join(" · ")}
                        </p>
                      )}
                    </div>

                    {/* Chevron */}
                    <div className="flex items-center pr-4 text-white/20">
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </div>
                  </div>
                </motion.button>

                {/* Accordion panel inline */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      key="studio-panel"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <StudioPanel
                        studio={studio}
                        animeList={animeList}
                        avgRating={avg}
                        onAnimeClick={setSelectedAnime}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      {/* Anime Modal */}
      <AnimeModal
        isOpen={selectedAnime !== null}
        onClose={() => setSelectedAnime(null)}
        anime={selectedAnime}
      />
    </div>
  )
}

// ─── Studio expanded panel ────────────────────────────────────────────────────

function StudioPanel({
  studio,
  animeList,
  avgRating,
  onAnimeClick,
}: {
  studio: Studio
  animeList: Anime[]
  avgRating: number
  onAnimeClick: (a: Anime) => void
}) {
  return (
    <div className="mt-3 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black uppercase italic tracking-tight text-violet-400">
            {studio}
          </h3>
          <p className="text-[10px] font-black text-white/25 uppercase tracking-widest mt-0.5">
            {animeList.length} titles
            {animeList.length > 0 && (
              <span className="ml-3 text-white/20">
                avg {avgRating.toFixed(2)} ★
              </span>
            )}
          </p>
        </div>
      </div>

      {animeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {animeList.map((anime, i) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              index={i}
              onClick={onAnimeClick}
            />
          ))}
        </div>
      ) : (
        <p className="text-white/20 font-black uppercase text-xs tracking-widest py-10 text-center">
          No titles from this studio in the archive yet
        </p>
      )}
    </div>
  )
}
