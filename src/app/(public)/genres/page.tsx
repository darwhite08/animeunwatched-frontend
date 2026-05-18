"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Layers } from "lucide-react"
import Image from "next/image"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"
import { useBrowseAnime } from "@/hooks/useAnime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

// ─── Genre config ────────────────────────────────────────────────────────────

const GENRES = [
  "Action",
  "Psychological",
  "Seinen",
  "Shonen",
  "Thriller",
  "Romance",
  "Fantasy",
  "Sci-Fi",
  "Horror",
  "Comedy",
  "Historical",
] as const

type Genre = (typeof GENRES)[number]

const GENRE_GRADIENT: Record<Genre, string> = {
  Action:       "from-red-900/40 to-red-950/10",
  Psychological:"from-purple-900/40 to-purple-950/10",
  Seinen:       "from-blue-900/40 to-blue-950/10",
  Shonen:       "from-orange-900/40 to-orange-950/10",
  Thriller:     "from-slate-900/40 to-slate-950/10",
  Romance:      "from-pink-900/40 to-pink-950/10",
  Fantasy:      "from-emerald-900/40 to-emerald-950/10",
  "Sci-Fi":     "from-cyan-900/40 to-cyan-950/10",
  Horror:       "from-red-950/40 to-black/40",
  Comedy:       "from-yellow-900/40 to-yellow-950/10",
  Historical:   "from-amber-900/40 to-amber-950/10",
}

const GENRE_ACCENT: Record<Genre, string> = {
  Action:       "text-red-400",
  Psychological:"text-purple-400",
  Seinen:       "text-blue-400",
  Shonen:       "text-orange-400",
  Thriller:     "text-slate-400",
  Romance:      "text-pink-400",
  Fantasy:      "text-emerald-400",
  "Sci-Fi":     "text-cyan-400",
  Horror:       "text-red-500",
  Comedy:       "text-yellow-400",
  Historical:   "text-amber-400",
}

const GENRE_BORDER: Record<Genre, string> = {
  Action:       "border-red-900/30",
  Psychological:"border-purple-900/30",
  Seinen:       "border-blue-900/30",
  Shonen:       "border-orange-900/30",
  Thriller:     "border-slate-800/30",
  Romance:      "border-pink-900/30",
  Fantasy:      "border-emerald-900/30",
  "Sci-Fi":     "border-cyan-900/30",
  Horror:       "border-red-950/30",
  Comedy:       "border-yellow-900/30",
  Historical:   "border-amber-900/30",
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GenresPage() {
  const [activeGenre, setActiveGenre] = useState<Genre | null>(null)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const { data: browseData } = useBrowseAnime({ limit: 50 })
  const allAnime = (browseData?.data ?? []).map(mapDTO)

  const genreMap = useMemo(() => {
    const map: Record<Genre, Anime[]> = {} as Record<Genre, Anime[]>
    for (const g of GENRES) {
      map[g] = allAnime.filter((a) => a.genres.includes(g))
    }
    return map
  }, [allAnime])

  const handleGenreClick = (genre: Genre) => {
    setActiveGenre((prev) => (prev === genre ? null : genre))
  }

  return (
    <div className="min-h-screen bg-[#020202] pb-40">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-14">
        <motion.p
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] mb-4"
        >
          <Layers size={13} /> Browse By Category
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-white italic leading-none"
        >
          Genre<span className="text-indigo-500">.</span>
          <br />
          <span className="text-white/20">Explorer</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-white/30 text-sm font-medium"
        >
          {GENRES.length} genres · {allAnime.length} titles in the archive
        </motion.p>
      </div>

      {/* Genre grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {GENRES.map((genre, i) => {
            const animeInGenre = genreMap[genre]
            const isOpen = activeGenre === genre
            const samples = animeInGenre.slice(0, 3)

            return (
              <div key={genre}>
                <motion.button
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleGenreClick(genre)}
                  className={`w-full text-left relative rounded-2xl border overflow-hidden transition-all duration-300 ${
                    GENRE_BORDER[genre]
                  } ${isOpen ? "ring-1 ring-indigo-500/30" : ""}`}
                >
                  <div
                    className={`bg-gradient-to-br ${GENRE_GRADIENT[genre]} p-5 h-full`}
                  >
                    {/* Sample thumbnails */}
                    <div className="flex gap-1.5 mb-4">
                      {samples.map((a) => (
                        <div
                          key={a.id}
                          className="relative w-10 h-14 rounded-lg overflow-hidden border border-white/10 shrink-0"
                        >
                          <Image
                            src={a.image}
                            alt={a.title}
                            fill
                            className="object-cover brightness-75"
                            sizes="40px"
                          />
                        </div>
                      ))}
                      {Array.from({ length: Math.max(0, 3 - samples.length) }).map(
                        (_, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-14 rounded-lg bg-white/5 border border-white/10 shrink-0"
                          />
                        )
                      )}
                    </div>

                    {/* Genre name */}
                    <h2
                      className={`text-xl font-black uppercase italic tracking-tight ${GENRE_ACCENT[genre]}`}
                    >
                      {genre}
                    </h2>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">
                      {animeInGenre.length} title{animeInGenre.length !== 1 ? "s" : ""}
                    </p>

                    {/* Chevron */}
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute top-4 right-4 text-white/20"
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </div>
                </motion.button>

                {/* Accordion panel — rendered inline below card on mobile */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      key="panel-inline"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden col-span-2 md:hidden"
                    >
                      <GenrePanel
                        genre={genre}
                        animeList={animeInGenre}
                        onAnimeClick={setSelectedAnime}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Expanded panel — desktop full-width below grid */}
        <AnimatePresence>
          {activeGenre && (
            <motion.div
              key={activeGenre}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden hidden md:block mt-6"
            >
              <GenrePanel
                genre={activeGenre}
                animeList={genreMap[activeGenre]}
                onAnimeClick={setSelectedAnime}
              />
            </motion.div>
          )}
        </AnimatePresence>
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

// ─── Genre expanded panel ─────────────────────────────────────────────────────

function GenrePanel({
  genre,
  animeList,
  onAnimeClick,
}: {
  genre: Genre
  animeList: Anime[]
  onAnimeClick: (a: Anime) => void
}) {
  return (
    <div className="mt-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h3
          className={`text-2xl font-black uppercase italic tracking-tight ${GENRE_ACCENT[genre]}`}
        >
          {genre}
        </h3>
        <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">
          {animeList.length} titles
        </span>
      </div>

      {animeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
          No anime in this genre yet
        </p>
      )}
    </div>
  )
}
