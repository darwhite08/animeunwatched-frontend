"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Layers, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"
import { useBrowseAnime } from "@/hooks/useAnime"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return {
    id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "",
    rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes,
    type: (["TV","Movie","OVA"] as const).includes(a.type as "TV"|"Movie"|"OVA") ? (a.type as "TV"|"Movie"|"OVA") : "TV",
    status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished",
    studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "",
    image: a.imageUrl ?? "/assets/png/tanjiro.png",
    tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i + 1,
  }
}

type GenreBrand = { name: string; gradient: string; border: string; accent: string; emoji: string }

const GENRE_BRAND_LIST: GenreBrand[] = [
  { name: "Action",       gradient: "from-red-900/40 to-red-950/10",        border: "border-red-900/30",      accent: "text-red-400",      emoji: "⚔️" },
  { name: "Adventure",    gradient: "from-green-900/40 to-green-950/10",    border: "border-green-900/30",    accent: "text-green-400",    emoji: "🗺️" },
  { name: "Avant Garde",  gradient: "from-fuchsia-900/40 to-fuchsia-950/10",border: "border-fuchsia-900/30",  accent: "text-fuchsia-400",  emoji: "🎭" },
  { name: "Comedy",       gradient: "from-yellow-900/40 to-yellow-950/10",  border: "border-yellow-900/30",   accent: "text-yellow-400",   emoji: "😂" },
  { name: "Drama",        gradient: "from-rose-900/40 to-rose-950/10",      border: "border-rose-900/30",     accent: "text-rose-400",     emoji: "🎬" },
  { name: "Fantasy",      gradient: "from-emerald-900/40 to-emerald-950/10",border: "border-emerald-900/30",  accent: "text-emerald-400",  emoji: "🐉" },
  { name: "Girls Love",   gradient: "from-pink-900/40 to-pink-950/10",      border: "border-pink-900/30",     accent: "text-pink-400",     emoji: "🌸" },
  { name: "Boys Love",    gradient: "from-violet-900/40 to-violet-950/10",  border: "border-violet-900/30",   accent: "text-violet-400",   emoji: "💜" },
  { name: "Gourmet",      gradient: "from-orange-900/40 to-orange-950/10",  border: "border-orange-900/30",   accent: "text-orange-400",   emoji: "🍜" },
  { name: "Horror",       gradient: "from-red-950/50 to-zinc-950/30",       border: "border-red-950/30",      accent: "text-red-300",      emoji: "👹" },
  { name: "Mystery",      gradient: "from-slate-900/40 to-slate-950/10",    border: "border-border",    accent: "text-muted",    emoji: "🔍" },
  { name: "Romance",      gradient: "from-pink-800/40 to-pink-950/10",      border: "border-pink-800/30",     accent: "text-pink-300",     emoji: "💕" },
  { name: "Sci-Fi",       gradient: "from-cyan-900/40 to-cyan-950/10",      border: "border-cyan-900/30",     accent: "text-cyan-400",     emoji: "🚀" },
  { name: "Slice of Life",gradient: "from-teal-900/40 to-teal-950/10",      border: "border-teal-900/30",     accent: "text-teal-400",     emoji: "🌿" },
  { name: "Sports",       gradient: "from-lime-900/40 to-lime-950/10",      border: "border-lime-900/30",     accent: "text-lime-400",     emoji: "🏆" },
  { name: "Supernatural", gradient: "from-indigo-900/40 to-indigo-950/10",  border: "border-indigo-900/30",   accent: "text-accent-bright",   emoji: "👁️" },
  { name: "Suspense",     gradient: "from-zinc-900/40 to-zinc-950/10",      border: "border-border",     accent: "text-muted",     emoji: "🔪" },
  { name: "Ecchi",        gradient: "from-red-800/40 to-pink-950/10",       border: "border-red-800/30",      accent: "text-red-300",      emoji: "🔞" },
  { name: "Mecha",        gradient: "from-blue-900/40 to-blue-950/10",      border: "border-blue-900/30",     accent: "text-blue-400",     emoji: "🤖" },
  { name: "Military",     gradient: "from-stone-900/40 to-stone-950/10",    border: "border-border",    accent: "text-muted",    emoji: "🎖️" },
  { name: "Music",        gradient: "from-purple-900/40 to-purple-950/10",  border: "border-purple-900/30",   accent: "text-purple-400",   emoji: "🎵" },
  { name: "Parody",       gradient: "from-amber-800/40 to-amber-950/10",    border: "border-amber-800/30",    accent: "text-accent-bright",    emoji: "🤡" },
  { name: "Psychological",gradient: "from-purple-950/50 to-zinc-950/30",    border: "border-purple-900/30",   accent: "text-purple-300",   emoji: "🧠" },
  { name: "Racing",       gradient: "from-red-800/40 to-orange-950/10",     border: "border-red-800/30",      accent: "text-orange-300",   emoji: "🏎️" },
  { name: "School",       gradient: "from-sky-900/40 to-sky-950/10",        border: "border-sky-900/30",      accent: "text-sky-400",      emoji: "🏫" },
  { name: "Seinen",       gradient: "from-blue-900/40 to-blue-950/10",      border: "border-blue-900/30",     accent: "text-blue-400",     emoji: "📖" },
  { name: "Shoujo",       gradient: "from-pink-900/40 to-rose-950/10",      border: "border-pink-900/30",     accent: "text-pink-400",     emoji: "🌷" },
  { name: "Shounen",      gradient: "from-orange-900/40 to-orange-950/10",  border: "border-orange-900/30",   accent: "text-orange-400",   emoji: "🔥" },
  { name: "Space",        gradient: "from-indigo-950/50 to-blue-950/20",    border: "border-indigo-900/30",   accent: "text-accent-bright",   emoji: "🌌" },
  { name: "Vampire",      gradient: "from-red-900/50 to-zinc-950/30",       border: "border-red-900/30",      accent: "text-red-400",      emoji: "🧛" },
  { name: "Historical",   gradient: "from-amber-900/40 to-amber-950/10",    border: "border-amber-900/30",    accent: "text-accent-bright",    emoji: "🏯" },
]

const GENRE_BRAND: Record<string, GenreBrand> = Object.fromEntries(
  GENRE_BRAND_LIST.map(g => [g.name, g]),
)

const DEFAULT_GENRE_BRAND: GenreBrand = {
  name:     "",
  gradient: "from-slate-900/40 to-slate-950/10",
  border:   "border-border",
  accent:   "text-muted",
  emoji:    "✨",
}

function brandForGenre(name: string): GenreBrand {
  return GENRE_BRAND[name] ?? { ...DEFAULT_GENRE_BRAND, name }
}

type GenreName = string

const LIMIT = 24

function GenrePanel({ genre, onAnimeClick }: { genre: GenreName; onAnimeClick: (a: Anime) => void }) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useBrowseAnime({ q: genre, limit: LIMIT, page })
  const anime = (data?.data ?? []).map(mapDTO)
  const totalPages = data?.meta?.pages ?? 1
  const totalAnime = data?.meta?.total ?? 0
  const g = brandForGenre(genre)

  return (
    <div className="mt-4 p-6 rounded-2xl bg-surface border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-2xl font-black uppercase italic tracking-tight ${g.accent}`}>
          {g.emoji} {genre}
        </h3>
        {!isLoading && (
          <span className="text-[10px] font-black text-subtle uppercase tracking-widest">
            {totalAnime.toLocaleString()} titles
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-accent-bright" />
        </div>
      )}

      {isError && !isLoading && (
        <p className="text-subtle text-xs font-black uppercase tracking-widest py-10 text-center">
          Failed to load {genre} anime
        </p>
      )}

      {!isLoading && !isError && anime.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {anime.map((a, i) => (
              <AnimeCard key={a.id} anime={a} index={i} onClick={onAnimeClick} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 flex-wrap">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-xl bg-surface border border-border text-muted hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-black text-muted px-3">
                {page} / {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="p-2 rounded-xl bg-surface border border-border text-muted hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}

      {!isLoading && !isError && anime.length === 0 && (
        <p className="text-subtle font-black uppercase text-xs tracking-widest py-10 text-center">
          No {genre} anime found
        </p>
      )}
    </div>
  )
}

export default function GenresPage() {
  const [activeGenre, setActiveGenre] = useState<GenreName | null>(null)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)

  // Live catalog genres — top 32 by anime count. Each gets curated branding
  // when available, otherwise the default slate treatment.
  const { data: genresData } = useQuery({
    queryKey: ["catalog-genres", 32],
    queryFn:  () => api<{ data: Array<{ name: string; count: number }> }>("/anime/genres?limit=32"),
    staleTime: 60_000,
  })
  const GENRES: GenreBrand[] = (genresData?.data ?? []).map(g => brandForGenre(g.name))

  function toggleGenre(name: GenreName) {
    setActiveGenre(prev => prev === name ? null : name)
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-14">
        <motion.p initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-accent-bright font-black uppercase tracking-[0.4em] text-[10px] mb-4"
        >
          <Layers size={13} /> Browse By Category
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-foreground italic leading-none"
        >
          Genre<span style={{color:"var(--app-accent)"}}>.</span>
          <br /><span className="text-subtle">Explorer</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="mt-4 text-subtle text-sm font-medium"
        >
          {GENRES.length} genres · click any to explore
        </motion.p>
      </div>

      {/* Genre grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {GENRES.map((g, i) => {
            const isOpen = activeGenre === g.name
            return (
              <div key={g.name}>
                <motion.button
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => toggleGenre(g.name)}
                  className={`w-full text-left relative rounded-2xl border overflow-hidden transition-all duration-300 ${g.border} ${isOpen ? "ring-1 ring-indigo-500/30" : ""}`}
                >
                  <div className={`bg-gradient-to-br ${g.gradient} p-6 h-full`}>
                    <span className="text-3xl block mb-3">{g.emoji}</span>
                    <h2 className={`text-xl font-black uppercase italic tracking-tight ${g.accent}`}>
                      {g.name}
                    </h2>
                    <p className="text-[9px] font-black text-subtle uppercase tracking-widest mt-1">
                      Explore {g.name} →
                    </p>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}
                      className="absolute top-4 right-4 text-subtle"
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </div>
                </motion.button>

                {/* Mobile inline panel */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      key="panel-inline"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden md:hidden"
                    >
                      <GenrePanel genre={g.name} onAnimeClick={setSelectedAnime} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Desktop expanded panel */}
        <AnimatePresence>
          {activeGenre && (
            <motion.div key={activeGenre}
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden hidden md:block mt-6"
            >
              <GenrePanel genre={activeGenre} onAnimeClick={setSelectedAnime} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimeModal isOpen={selectedAnime !== null} onClose={() => setSelectedAnime(null)} anime={selectedAnime} />
    </div>
  )
}
