"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Star, Plus, Check, ArrowRight, Film } from "lucide-react"
import type { Anime } from "@/lib/data/anime"
import { useWatchlist } from "@/stores/watchlist.store"
import { useToast } from "@/stores/toast.store"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"

const mapDTO = (a: AnimeDTO, i: number): Anime => ({
  id: String(a.malId),
  title: a.title,
  titleJapanese: a.titleJapanese ?? "",
  rating: a.score ?? 0,
  year: a.year ?? 0,
  episodes: a.episodes,
  type: (["TV", "Movie", "OVA"] as const).includes(a.type as any) ? a.type as any : "TV",
  status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished",
  studio: a.studios[0] ?? "Unknown",
  genres: a.genres,
  synopsis: a.synopsis ?? "",
  image: a.imageUrl ?? "",
  tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")),
  category: "all",
  rank: i + 1,
})

/* ── Data slices are computed inside the component from API data ── */

const GENRES = ["Action", "Psychological", "Romance", "Fantasy", "Sci-Fi"] as const
type Genre = (typeof GENRES)[number]

const STUDIOS = [
  { name: "MAPPA",    description: "Cinematic powerhouse behind AOT & JJK"   },
  { name: "Madhouse", description: "Legendary studio of HxH, Death Note & Monster" },
  { name: "Bones",    description: "Action legends behind FMA:B & Mob Psycho" },
] as const

/* ── Trending Card ────────────────────────────────────────────────────── */
function TrendingCard({
  anime,
  index,
  onPreview,
}: {
  anime: Anime
  index: number
  onPreview: (anime: Anime) => void
}) {
  const { add, remove, has } = useWatchlist()
  const { push } = useToast()
  const inList = has(anime.id)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    if (inList) {
      remove(anime.id)
      push(`Removed "${anime.title}" from watchlist`, "info")
    } else {
      add(anime)
      push(`Added "${anime.title}" to watchlist!`, "success")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group relative flex gap-0 bg-[#0a0a0a] rounded-2xl border border-white/5 hover:border-indigo-500/20 overflow-hidden transition-all duration-500"
    >
      {/* Glow */}
      <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Cover */}
      <div className="relative h-full w-36 flex-shrink-0">
        <Image
          src={anime.image}
          alt={anime.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105 brightness-75 group-hover:brightness-90"
          sizes="144px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]" />
        {/* Rank */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur border border-indigo-500/30 rounded-lg text-[9px] font-black text-amber-400 uppercase italic">
          #{anime.rank}
        </div>
        {anime.status === "airing" && (
          <div className="absolute bottom-3 left-3">
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[8px] font-black text-emerald-400 uppercase">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Star size={10} fill="#f59e0b" className="text-amber-400" />
              <span className="text-[10px] font-black text-amber-400">{anime.rating.toFixed(1)}</span>
            </div>
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
              {anime.studio}
            </span>
            <span className="text-[9px] font-black text-white/20 uppercase">{anime.year}</span>
          </div>

          <h3 className="text-base font-black text-white uppercase italic tracking-tighter leading-tight line-clamp-2 group-hover:text-amber-200 transition-colors duration-300">
            {anime.title}
          </h3>

          <div className="flex flex-wrap gap-1">
            {anime.genres.map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-wider text-white/40"
              >
                {g}
              </span>
            ))}
          </div>

          <p className="text-white/40 text-xs leading-relaxed line-clamp-2 hidden sm:block">
            {anime.synopsis}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={handleToggle}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              inList
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-white text-black hover:bg-amber-500 hover:text-black"
            }`}
          >
            {inList ? <><Check size={12} /> In List</> : <><Plus size={12} /> Add to List</>}
          </button>
          <Link
            href={`/anime/${anime.id}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <ArrowRight size={12} /> View Details
          </Link>
          <button
            onClick={() => onPreview(anime)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-amber-400 hover:bg-indigo-500/10 transition-all text-[10px] font-black uppercase tracking-widest"
          >
            Quick Preview
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Studio Card ──────────────────────────────────────────────────────── */
function StudioCard({
  studio,
  description,
  count,
  selected,
  onClick,
}: {
  studio: string
  description: string
  count: number
  selected: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative text-left p-5 rounded-2xl border transition-all duration-300 w-full ${
        selected
          ? "bg-indigo-600/10 border-indigo-500/40"
          : "bg-[#0a0a0a] border-white/5 hover:border-white/15"
      }`}
    >
      {selected && (
        <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-2xl pointer-events-none" />
      )}
      <div className="relative">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Film size={18} className={selected ? "text-amber-400" : "text-white/30"} />
          </div>
          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${selected ? "bg-indigo-500/20 text-amber-400" : "bg-white/5 text-white/30"}`}>
            {count} anime
          </span>
        </div>
        <h4 className={`text-sm font-black uppercase italic tracking-tighter ${selected ? "text-white" : "text-white/70"}`}>
          {studio}
        </h4>
        <p className="text-[10px] text-white/30 mt-1 leading-relaxed">{description}</p>
      </div>
    </motion.button>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function DiscoverPage() {
  const [selectedGenre, setSelectedGenre] = useState<Genre>("Action")
  const [selectedStudio, setSelectedStudio] = useState<string | null>(null)
  const [modalAnime, setModalAnime] = useState<Anime | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data: browseData, isLoading } = useBrowseAnime({ limit: 18 })
  const animeList = (browseData?.data ?? []).map(mapDTO)

  if (isLoading) return null

  const TRENDING = animeList.slice(0, 4)
  const HIDDEN_GEMS = animeList.filter((a) => a.rating >= 8.5 && a.rank > 10).slice(0, 4)

  const genreAnime = animeList.filter((a) => a.genres.includes(selectedGenre))

  const studioAnime = selectedStudio
    ? animeList.filter((a) => a.studio === selectedStudio)
    : []

  const studioCounts = STUDIOS.map((s) => ({
    ...s,
    count: animeList.filter((a) => a.studio === s.name).length,
  }))

  const openModal = (anime: Anime) => {
    setModalAnime(anime)
    setModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-[#020202] pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-24">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
            Catalogue
          </p>
          <h1 className="text-5xl sm:text-7xl font-black uppercase italic tracking-tighter text-white leading-none">
            Browse<span style={{color:"#f59e0b"}}>.</span>
          </h1>
          <p className="text-white/40 text-sm max-w-lg leading-relaxed">
            Curated anime for every mood. Trending picks, hidden gems, genre deep-dives, and studio spotlights — all in one place.
          </p>
        </motion.div>

        {/* ══ Section 1 — Trending This Week ══════════════════════════ */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500">Section 01</p>
              <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white">
                Trending This Week
              </h2>
            </div>
            <div className="h-px flex-1 mx-6 bg-white/5" />
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
              {TRENDING.length} picks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TRENDING.map((anime, i) => (
              <TrendingCard
                key={anime.id}
                anime={anime}
                index={i}
                onPreview={openModal}
              />
            ))}
          </div>
        </section>

        {/* ══ Section 2 — Hidden Gems ══════════════════════════════════ */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-violet-500">Section 02</p>
              <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white">
                Hidden Gems
              </h2>
            </div>
            <div className="h-px flex-1 mx-6 bg-white/5" />
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
              Rating ≥ 8.5
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {HIDDEN_GEMS.map((anime, i) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                index={i}
                onClick={openModal}
              />
            ))}
          </div>
        </section>

        {/* ══ Section 3 — By Genre ═════════════════════════════════════ */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-500">Section 03</p>
              <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white">
                By Genre
              </h2>
            </div>
            <div className="h-px flex-1 mx-6 bg-white/5" />
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
              {genreAnime.length} titles
            </span>
          </div>

          {/* Genre pills */}
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <motion.button
                key={genre}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedGenre(genre)}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  selectedGenre === genre
                    ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                    : "bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                }`}
              >
                {genre}
              </motion.button>
            ))}
          </div>

          {/* Genre grid */}
          <motion.div
            key={selectedGenre}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {genreAnime.map((anime, i) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                index={i}
                onClick={openModal}
              />
            ))}
          </motion.div>

          {genreAnime.length === 0 && (
            <div className="text-center py-16 text-white/20 text-sm font-black uppercase tracking-widest">
              No anime found for {selectedGenre}
            </div>
          )}
        </section>

        {/* ══ Section 4 — Top Studios ══════════════════════════════════ */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-pink-500">Section 04</p>
              <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white">
                Top Studios
              </h2>
            </div>
            <div className="h-px flex-1 mx-6 bg-white/5" />
            {selectedStudio && (
              <button
                onClick={() => setSelectedStudio(null)}
                className="text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Studio cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {studioCounts.map((s) => (
              <StudioCard
                key={s.name}
                studio={s.name}
                description={s.description}
                count={s.count}
                selected={selectedStudio === s.name}
                onClick={() =>
                  setSelectedStudio(selectedStudio === s.name ? null : s.name)
                }
              />
            ))}
          </div>

          {/* Studio anime grid */}
          {selectedStudio && (
            <motion.div
              key={selectedStudio}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                {studioAnime.length} title{studioAnime.length !== 1 ? "s" : ""} from {selectedStudio}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {studioAnime.map((anime, i) => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    index={i}
                    onClick={openModal}
                  />
                ))}
              </div>
              {studioAnime.length === 0 && (
                <div className="text-center py-12 text-white/20 text-sm font-black uppercase tracking-widest">
                  No anime in catalogue for {selectedStudio}
                </div>
              )}
            </motion.div>
          )}
        </section>
      </div>

      {/* Modal */}
      <AnimeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        anime={modalAnime}
      />
    </main>
  )
}
