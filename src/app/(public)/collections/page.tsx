"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Loader2 } from "lucide-react"
import { SquaresFour } from "@phosphor-icons/react"
import { useBrowseAnime } from "@/hooks/useAnime"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"

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

type CollectionDef = {
  id: string
  name: string
  description: string
  emoji: string
  accent: string
  borderStyle: React.CSSProperties
  params: Parameters<typeof useBrowseAnime>[0]
  clientFilter?: (a: Anime) => boolean
}

const COLLECTIONS: CollectionDef[] = [
  {
    id: "mind-bending",
    name: "Mind-Bending Masterpieces",
    description: "Anime that rewires how you think about reality, morality, and what it means to be human.",
    emoji: "🧠",
    accent: "text-purple-400",
    borderStyle: { borderColor: "rgba(168,85,247,0.2)" },
    params: { q: "Psychological", limit: 24 },
  },
  {
    id: "hidden-gems",
    name: "Hidden Gems",
    description: "Criminally underrated anime that deserve 10x more attention than they get.",
    emoji: "💎",
    accent: "text-accent-bright",
    borderStyle: { borderColor: "color-mix(in srgb, var(--app-accent) 25%, transparent)" },
    params: { limit: 24 },
    clientFilter: a => a.rating >= 8.5 && a.rank > 15,
  },
  {
    id: "binge-weekend",
    name: "Binge in a Weekend",
    description: "Complete series under 25 episodes. Maximum impact, minimum time investment.",
    emoji: "⚡",
    accent: "text-emerald-400",
    borderStyle: { borderColor: "rgba(16,185,129,0.2)" },
    params: { limit: 24 },
    clientFilter: a => (a.episodes ?? 999) <= 25 && a.rating >= 8.6,
  },
  {
    id: "dark-fantasy",
    name: "Dark Fantasy",
    description: "Brutal, beautiful, and unrelenting. For when you want your anime to hurt.",
    emoji: "🐉",
    accent: "text-rose-400",
    borderStyle: { borderColor: "rgba(244,63,94,0.2)" },
    params: { q: "Seinen", limit: 24 },
  },
  {
    id: "sci-fi",
    name: "Sci-Fi & Cyberpunk",
    description: "Time travel, mechs, post-human futures, and the weight of technology on the soul.",
    emoji: "🚀",
    accent: "text-sky-400",
    borderStyle: { borderColor: "rgba(14,165,233,0.2)" },
    params: { q: "Sci-Fi", limit: 24 },
  },
  {
    id: "emotional",
    name: "Emotional Devastators",
    description: "Warning: keep tissues nearby. These will break you, then rebuild you.",
    emoji: "💔",
    accent: "text-accent-bright",
    borderStyle: { borderColor: "rgba(99,102,241,0.2)" },
    params: { q: "Drama", limit: 24 },
  },
  {
    id: "action-peak",
    name: "Peak Action",
    description: "The most hype, jaw-dropping action sequences in the medium. Pure adrenaline.",
    emoji: "⚔️",
    accent: "text-red-400",
    borderStyle: { borderColor: "rgba(239,68,68,0.2)" },
    params: { q: "Action", limit: 24 },
    clientFilter: a => a.rating >= 8.0,
  },
  {
    id: "romance",
    name: "Romance That Hits Different",
    description: "Love stories that will make you feel things you forgot existed.",
    emoji: "🌸",
    accent: "text-pink-400",
    borderStyle: { borderColor: "rgba(236,72,153,0.2)" },
    params: { q: "Romance", limit: 24 },
  },
  {
    id: "airing-now",
    name: "Airing Right Now",
    description: "The best shows currently airing — ranked by community score.",
    emoji: "📡",
    accent: "text-green-400",
    borderStyle: { borderColor: "rgba(34,197,94,0.25)" },
    params: { status: "airing", limit: 24 },
  },
]

function CollectionPanel({ col, onAnimeClick }: { col: CollectionDef; onAnimeClick: (a: Anime) => void }) {
  const { data, isLoading, isError } = useBrowseAnime(col.params)
  let anime = (data?.data ?? []).map(mapDTO)
  if (col.clientFilter) anime = anime.filter(col.clientFilter)

  return (
    <div className="pt-4 pb-2">
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--app-accent)" }} />
        </div>
      )}
      {isError && !isLoading && (
        <p className="text-subtle text-xs font-black uppercase tracking-widest py-10 text-center">
          Failed to load collection
        </p>
      )}
      {!isLoading && !isError && anime.length === 0 && (
        <p className="text-subtle text-xs font-black uppercase tracking-widest py-10 text-center">
          No anime found for this collection yet
        </p>
      )}
      {!isLoading && !isError && anime.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {anime.map((a, i) => (
            <AnimeCard key={a.id} anime={a} index={i} onClick={onAnimeClick} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CollectionsPage() {
  const [active, setActive] = useState<string | null>(null)
  const [selected, setSelected] = useState<Anime | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <SquaresFour size={18} weight="duotone" className="text-accent-bright" />
          <p className="text-[9px] font-mono uppercase tracking-[0.4em]" style={{ color: "color-mix(in srgb, var(--app-accent) 60%, transparent)" }}>
            Curated Collections
          </p>
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase italic text-foreground leading-none mb-4">
          Collections<span style={{ color: "var(--app-accent)" }}>.</span>
        </h1>
        <p className="text-subtle text-base sm:text-lg max-w-xl leading-relaxed">
          {COLLECTIONS.length} hand-picked collections — grouped by mood, theme, and what they'll do to your soul.
        </p>
        {/* Gold divider */}
        <div className="mt-8 h-px w-full"
          style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--app-accent) 50%, transparent), color-mix(in srgb, var(--app-accent) 20%, transparent) 40%, transparent)" }} />
      </div>

      {/* Collection list */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
        {COLLECTIONS.map((col, i) => {
          const isActive = active === col.id
          return (
            <motion.div key={col.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {/* Header button */}
              <button
                onClick={() => setActive(isActive ? null : col.id)}
                className="w-full text-left p-4 sm:p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 sm:gap-4 group active:scale-[0.99]"
                style={{
                  background: isActive
                    ? "linear-gradient(160deg, color-mix(in srgb, var(--app-accent) 8%, transparent), color-mix(in srgb, var(--app-accent) 3%, transparent))"
                    : "color-mix(in srgb, var(--app-fg) 2%, transparent)",
                  ...col.borderStyle,
                  ...(isActive ? {} : { borderColor: "color-mix(in srgb, var(--app-fg) 7%, transparent)" }),
                }}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Emoji badge */}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{
                      background: isActive ? "color-mix(in srgb, var(--app-accent) 15%, transparent)" : "color-mix(in srgb, var(--app-fg) 4%, transparent)",
                      border: isActive ? "1px solid color-mix(in srgb, var(--app-accent) 25%, transparent)" : "1px solid color-mix(in srgb, var(--app-fg) 7%, transparent)",
                    }}>
                    {col.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-0.5">
                      <h2 className={`text-[15px] font-black ${isActive ? col.accent : "text-muted group-hover:text-foreground"} transition-colors`}>
                        {col.name}
                      </h2>
                    </div>
                    <p className="text-sm text-subtle leading-snug line-clamp-1">{col.description}</p>
                  </div>
                </div>

                <motion.div animate={{ rotate: isActive ? 90 : 0 }} transition={{ duration: 0.2 }}
                  className="shrink-0">
                  <ChevronRight size={18} className={isActive ? "text-accent-bright" : "text-subtle group-hover:text-muted"} />
                </motion.div>
              </button>

              {/* Expanded panel */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    className="overflow-hidden"
                  >
                    <CollectionPanel col={col} onAnimeClick={setSelected} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      <AnimeModal isOpen={selected !== null} onClose={() => setSelected(null)} anime={selected} />
    </div>
  )
}
