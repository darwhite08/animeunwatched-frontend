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
import { ForYouSection } from "@/components/discover/ForYouSection"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
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

// Genres + studios come from the live catalog. Empty arrays initially
// while the queries load — the page handles the empty case gracefully.
type Genre = string

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
      className="group relative flex gap-0 bg-surface rounded-2xl border border-border hover:border-white/20 overflow-hidden transition-all duration-500"
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
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--app-bg)]" />
        {/* Rank */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur border border-accent/30 rounded-lg text-[9px] font-black text-accent-bright uppercase italic">
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
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
              <Star size={10} fill="var(--app-accent)" className="text-accent-bright" />
              <span className="text-[10px] font-black text-accent-bright">{anime.rating.toFixed(1)}</span>
            </div>
            <span className="text-[9px] font-black text-subtle uppercase tracking-widest">
              {anime.studio}
            </span>
            <span className="text-[9px] font-black text-subtle uppercase">{anime.year}</span>
          </div>

          <h3 className="text-base font-black text-foreground uppercase italic tracking-tighter leading-tight line-clamp-2 group-hover:text-foreground transition-colors duration-300">
            {anime.title}
          </h3>

          <div className="flex flex-wrap gap-1">
            {anime.genres.map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded-full bg-surface border border-border text-[8px] font-black uppercase tracking-wider text-muted"
              >
                {g}
              </span>
            ))}
          </div>

          <p className="text-muted text-xs leading-relaxed line-clamp-2 hidden sm:block">
            {anime.synopsis}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={handleToggle}
            className={`flex items-center gap-1.5 min-h-11 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 ${
              inList
                ? "bg-emerald-600 text-foreground hover:bg-emerald-700"
                : "bg-white text-black hover:bg-accent hover:text-black"
            }`}
          >
            {inList ? <><Check size={12} /> In List</> : <><Plus size={12} /> Add to List</>}
          </button>
          <Link
            href={`/anime/${anime.id}`}
            className="flex items-center gap-1.5 min-h-11 px-4 py-2 rounded-xl border border-border bg-surface text-muted hover:bg-surface hover:text-foreground transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest"
          >
            <ArrowRight size={12} /> View Details
          </Link>
          <button
            onClick={() => onPreview(anime)}
            className="flex items-center gap-1.5 min-h-11 px-4 py-2 rounded-xl border border-accent/20 bg-accent/5 text-accent-bright hover:bg-white/10 transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest"
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
          ? "bg-accent/10 border-accent/40"
          : "bg-surface border-border hover:border-border"
      }`}
    >
      {selected && (
        <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-2xl pointer-events-none" />
      )}
      <div className="relative">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center">
            <Film size={18} className={selected ? "text-accent-bright" : "text-subtle"} />
          </div>
          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${selected ? "bg-accent/20 text-accent-bright" : "bg-surface text-subtle"}`}>
            {count} anime
          </span>
        </div>
        <h4 className={`text-sm font-black uppercase italic tracking-tighter ${selected ? "text-foreground" : "text-muted"}`}>
          {studio}
        </h4>
        <p className="text-[10px] text-subtle mt-1 leading-relaxed">{description}</p>
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

  // Real genres + studios from /anime/genres + /anime/studios — top 6 each
  const { data: genresData }  = useQuery({
    queryKey: ["catalog-genres"],
    queryFn:  () => api<{ data: Array<{ name: string; count: number }> }>("/anime/genres?limit=6"),
    staleTime: 60_000,
  })
  const { data: studiosData } = useQuery({
    queryKey: ["catalog-studios"],
    queryFn:  () => api<{ data: Array<{ name: string; count: number }> }>("/anime/studios?limit=6"),
    staleTime: 60_000,
  })
  const GENRES: Genre[] = (genresData?.data ?? []).map(g => g.name)
  const studioCounts = (studiosData?.data ?? []).map(s => ({
    name:        s.name,
    description: `${s.count} title${s.count === 1 ? "" : "s"} in catalog`,
    count:       animeList.filter((a) => a.studio === s.name).length || s.count,
  }))

  const openModal = (anime: Anime) => {
    setModalAnime(anime)
    setModalOpen(true)
  }

  return (
    <main className="min-h-screen bg-background pt-24 sm:pt-32 pb-20 sm:pb-24">
      {/* Mobile uses 14-unit gap so the page doesn't feel like a slideshow
          of one-section screens; desktop keeps the deliberate 24-unit
          breathing room between major sections. */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14 sm:space-y-24">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">
            Catalogue
          </p>
          <h1 className="text-5xl sm:text-7xl font-black uppercase italic tracking-tighter text-foreground leading-none">
            Browse<span style={{color:"var(--app-accent)"}}>.</span>
          </h1>
          <p className="text-muted text-sm max-w-lg leading-relaxed">
            Curated anime for every mood. Trending picks, hidden gems, genre deep-dives, and studio spotlights — all in one place.
          </p>
        </motion.div>

        {/* ══ For You — personalised, top of fold for authenticated viewers ══ */}
        <ForYouSection limit={12} />

        {/* ══ Section 1 — Trending This Week ══════════════════════════ */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-accent">Section 01</p>
              <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-foreground">
                Trending This Week
              </h2>
            </div>
            <div className="h-px flex-1 mx-6 bg-surface" />
            <span className="text-[10px] font-black text-subtle uppercase tracking-widest">
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
              <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-foreground">
                Hidden Gems
              </h2>
            </div>
            <div className="h-px flex-1 mx-6 bg-surface" />
            <span className="text-[10px] font-black text-subtle uppercase tracking-widest">
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
              <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-foreground">
                By Genre
              </h2>
            </div>
            <div className="h-px flex-1 mx-6 bg-surface" />
            <span className="text-[10px] font-black text-subtle uppercase tracking-widest">
              {genreAnime.length} titles
            </span>
          </div>

          {/* Genre pills — horizontally scrollable on phones to avoid wrap cramp */}
          <div className="flex sm:flex-wrap gap-2 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide [-webkit-overflow-scrolling:touch] sm:overflow-visible">
            {GENRES.map((genre) => (
              <motion.button
                key={genre}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedGenre(genre)}
                className={`shrink-0 min-h-11 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  selectedGenre === genre
                    ? "bg-accent text-black shadow-[0_0_20px_color-mix(in srgb, var(--app-accent) 40%, transparent)]"
                    : "bg-surface border border-border text-muted hover:text-foreground hover:bg-surface"
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
            <div className="text-center py-16 text-subtle text-sm font-black uppercase tracking-widest">
              No anime found for {selectedGenre}
            </div>
          )}
        </section>

        {/* ══ Section 4 — Top Studios ══════════════════════════════════ */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-pink-500">Section 04</p>
              <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-foreground">
                Top Studios
              </h2>
            </div>
            <div className="h-px flex-1 mx-6 bg-surface" />
            {selectedStudio && (
              <button
                onClick={() => setSelectedStudio(null)}
                className="text-[10px] font-black text-subtle uppercase tracking-widest hover:text-foreground transition-colors"
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
              <p className="text-[10px] font-black uppercase tracking-widest text-subtle">
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
                <div className="text-center py-12 text-subtle text-sm font-black uppercase tracking-widest">
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
