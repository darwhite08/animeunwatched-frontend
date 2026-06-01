"use client"

import { use, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { type Anime } from "@/lib/data/anime"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

/* ── Category config ── */
type CategoryMeta = {
  emoji: string
  title: string
  description: string
  accentClass: string
  filter: (a: Anime) => boolean
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  trending: {
    emoji: "🔥",
    title: "Trending",
    description: "The anime everyone is talking about right now. Don't miss out.",
    accentClass: "text-accent-bright",
    filter: (a) => a.category === "trending",
  },
  "hidden-gems": {
    emoji: "💎",
    title: "Hidden Gems",
    description: "Masterpieces that flew under the radar. Your next obsession is in here.",
    accentClass: "text-emerald-400",
    filter: (a) => a.rating >= 8.5 && a.rank > 10,
  },
  psychological: {
    emoji: "🧠",
    title: "Psychological",
    description: "Anime that rewires your brain. Mind-bending narratives, unreliable realities.",
    accentClass: "text-violet-400",
    filter: (a) => a.genres.includes("Psychological"),
  },
  action: {
    emoji: "⚔️",
    title: "Action",
    description: "Visceral fights, explosive animation, and power systems that go hard.",
    accentClass: "text-red-400",
    filter: (a) => a.genres.includes("Action"),
  },
  romance: {
    emoji: "💙",
    title: "Romance",
    description: "Love stories that hit different. From gentle to devastating.",
    accentClass: "text-pink-400",
    filter: (a) => a.genres.includes("Romance"),
  },
  "sci-fi": {
    emoji: "🚀",
    title: "Sci-Fi",
    description: "Space operas, cyberpunk worlds, and futures that feel uncomfortably close.",
    accentClass: "text-sky-400",
    filter: (a) => a.genres.includes("Sci-Fi"),
  },
  "dark-fantasy": {
    emoji: "🌑",
    title: "Dark Fantasy",
    description: "Brutal worlds, moral ambiguity, and the kind of darkness that stays with you.",
    accentClass: "text-purple-400",
    filter: (a) => a.genres.includes("Horror") || a.tags.some((t) => t.includes("dark fantasy") || t.includes("dark")),
  },
}

const FALLBACK_META: CategoryMeta = {
  emoji: "📺",
  title: "Discover",
  description: "A curated selection from the Kaiveron catalogue.",
  accentClass: "text-accent-bright",
  filter: () => true,
}

/* ── Filter types ── */
type RatingFilter = "all" | "8+" | "8.5+" | "9+"
type TypeFilter = "all" | "TV" | "Movie" | "OVA"
type StatusFilter = "all" | "finished" | "airing"

const RATING_THRESHOLDS: Record<RatingFilter, number> = {
  "all": 0,
  "8+": 8,
  "8.5+": 8.5,
  "9+": 9,
}

/* ── FilterPill ── */
function FilterPill<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {options.map((opt) => (
        <motion.button
          key={opt}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
            value === opt
              ? "bg-accent text-black shadow-[0_0_16px_color-mix(in srgb, var(--app-accent) 40%, transparent)]"
              : "bg-surface border border-border text-muted hover:text-foreground hover:border-border"
          }`}
        >
          {opt}
        </motion.button>
      ))}
    </div>
  )
}

/* ── Page ── */
export default function CategoryDiscoverPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = use(params)

  const meta = CATEGORY_META[category] ?? FALLBACK_META

  const [modalAnime, setModalAnime] = useState<Anime | null>(null)
  const [modalOpen, setModalOpen]   = useState(false)
  const [ratingFilter, setRatingFilter]   = useState<RatingFilter>("all")
  const [typeFilter, setTypeFilter]       = useState<TypeFilter>("all")
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>("all")

  const { data: browseData, isLoading } = useBrowseAnime({ limit: 24 })
  const animeList = useMemo(() => (browseData?.data ?? []).map(mapDTO), [browseData])

  const openModal = (anime: Anime) => {
    setModalAnime(anime)
    setModalOpen(true)
  }

  const filtered = useMemo(() => animeList.filter((a) => {
    const ratingOk = a.rating >= RATING_THRESHOLDS[ratingFilter]
    const typeOk   = typeFilter === "all"   || a.type === typeFilter
    const statusOk = statusFilter === "all" || a.status === statusFilter
    return ratingOk && typeOk && statusOk
  }), [animeList, ratingFilter, typeFilter, statusFilter])

  const displayTitle = meta.title.charAt(0).toUpperCase() + meta.title.slice(1)

  return (
    <main className="min-h-screen bg-background text-foreground pb-32">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-[50%] h-[70%] bg-indigo-700/12 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] bg-violet-900/8 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10 pb-16">

        {/* Back */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted hover:text-muted transition-colors group"
          >
            <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
            Browse
          </Link>
        </motion.div>

        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 space-y-3"
        >
          <span className="text-4xl" role="img" aria-label={displayTitle}>
            {meta.emoji}
          </span>
          <h1 className="text-5xl sm:text-7xl font-black uppercase italic tracking-tighter text-foreground leading-none">
            {displayTitle}
            <span className={`${meta.accentClass}`}>.</span>
          </h1>
          <p className="text-muted text-sm max-w-lg leading-relaxed">
            {meta.description}
          </p>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="flex flex-col gap-4 mb-8 p-5 rounded-2xl bg-surface border border-border"
        >
          <div className="flex flex-wrap gap-6">
            {/* Rating */}
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">Rating</p>
              <FilterPill
                options={["all", "8+", "8.5+", "9+"] as RatingFilter[]}
                value={ratingFilter}
                onChange={setRatingFilter}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">Type</p>
              <FilterPill
                options={["all", "TV", "Movie", "OVA"] as TypeFilter[]}
                value={typeFilter}
                onChange={setTypeFilter}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">Status</p>
              <FilterPill
                options={["all", "finished", "airing"] as StatusFilter[]}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>
          </div>
        </motion.div>

        {/* Result count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-subtle mb-6"
        >
          {isLoading ? "Loading…" : `${filtered.length} title${filtered.length !== 1 ? "s" : ""}`}
        </motion.p>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={`${ratingFilter}-${typeFilter}-${statusFilter}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
            >
              {filtered.map((anime, i) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  index={i}
                  onClick={openModal}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-4"
            >
              <span className="text-5xl">{meta.emoji}</span>
              <p className="text-lg font-black uppercase italic text-subtle">
                No results for these filters
              </p>
              <p className="text-xs text-subtle">Try relaxing the rating or type filter</p>
              <button
                onClick={() => {
                  setRatingFilter("all")
                  setTypeFilter("all")
                  setStatusFilter("all")
                }}
                className="mt-2 px-5 py-2.5 rounded-xl bg-accent/20 border border-accent/20 text-xs font-black uppercase tracking-widest text-accent-bright hover:bg-accent/30 transition-all"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
