"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Zap, Heart, Brain, Flame, Laugh, Ghost, Sword, Coffee, Sun } from "lucide-react"
import Link from "next/link"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import { useQuery } from "@tanstack/react-query"
import { discoverMood } from "@/lib/api/endpoints"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"

// Frontend mood id → backend mood enum
const MOOD_MAP: Record<string, "uplifting" | "melancholic" | "intense" | "cozy" | "thrilling" | "romantic" | "thought-provoking" | "epic" | "lighthearted" | "dark"> = {
  "hype":      "intense",
  "emotional": "melancholic",
  "mind":      "thought-provoking",
  "cozy":      "cozy",
  "dark":      "dark",
  "fun":       "lighthearted",
  "romance":   "romantic",
  "adventure": "epic",
  "fight":     "thrilling",
}

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

const MOODS = [
  {
    id: "hype",
    label: "I want HYPE",
    emoji: "⚡",
    desc: "Adrenaline. Power-ups. Epic moments.",
    icon: Zap,
    color: "from-orange-500/20 to-red-600/15",
    border: "border-orange-500/30",
    accent: "text-orange-400",
    params: { q: "Action", status: "airing" },
  },
  {
    id: "emotional",
    label: "Make me cry",
    emoji: "💔",
    desc: "Tragic. Beautiful. Unforgettable.",
    icon: Heart,
    color: "from-pink-500/20 to-rose-600/15",
    border: "border-pink-500/30",
    accent: "text-pink-400",
    params: { q: "Drama" },
  },
  {
    id: "mind",
    label: "Blow my mind",
    emoji: "🧠",
    desc: "Twists. Philosophy. Deep plots.",
    icon: Brain,
    color: "from-violet-500/20 to-purple-600/15",
    border: "border-violet-500/30",
    accent: "text-violet-400",
    params: { q: "Psychological" },
  },
  {
    id: "cozy",
    label: "Something cozy",
    emoji: "☕",
    desc: "Slow life. Healing. Just vibes.",
    icon: Coffee,
    color: "from-accent/20 to-yellow-600/15",
    border: "border-accent/30",
    accent: "text-accent-bright",
    params: { q: "Slice of Life" },
  },
  {
    id: "dark",
    label: "Dark & gritty",
    emoji: "🌑",
    desc: "Horror. Seinen. No happy endings.",
    icon: Ghost,
    color: "from-slate-600/20 to-zinc-800/15",
    border: "border-border",
    accent: "text-muted",
    params: { q: "Horror" },
  },
  {
    id: "fun",
    label: "Just laugh",
    emoji: "😂",
    desc: "Comedy. Chaos. No brain cells needed.",
    icon: Laugh,
    color: "from-yellow-500/20 to-lime-600/15",
    border: "border-yellow-500/30",
    accent: "text-yellow-400",
    params: { q: "Comedy" },
  },
  {
    id: "romance",
    label: "Love story",
    emoji: "🌸",
    desc: "Romance. Butterflies. Slow burn.",
    icon: Heart,
    color: "from-rose-500/20 to-pink-600/15",
    border: "border-rose-500/30",
    accent: "text-rose-400",
    params: { q: "Romance" },
  },
  {
    id: "adventure",
    label: "Big adventure",
    emoji: "🗺️",
    desc: "Journey. World-building. Discovery.",
    icon: Sun,
    color: "from-emerald-500/20 to-teal-600/15",
    border: "border-emerald-500/30",
    accent: "text-emerald-400",
    params: { q: "Adventure" },
  },
  {
    id: "fight",
    label: "Epic battles",
    emoji: "⚔️",
    desc: "Fights. Power systems. Tournament arcs.",
    icon: Sword,
    color: "from-red-500/20 to-orange-600/15",
    border: "border-red-500/30",
    accent: "text-red-400",
    params: { q: "Action" },
  },
]

export default function MoodPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)

  const mood = MOODS.find(m => m.id === selected)
  const backendMood = selected ? MOOD_MAP[selected] : null

  const { data, isLoading } = useQuery({
    queryKey: ["discovery/mood", backendMood],
    queryFn:  () => backendMood ? discoverMood(backendMood, { limit: 12 }) : Promise.resolve(null),
    enabled:  !!backendMood,
    staleTime: 5 * 60_000,
  })

  const anime = useMemo<Anime[]>(() => {
    if (!data?.data) return []
    return data.data.map((r, i) => mapDTO(r.anime, i))
  }, [data])

  return (
    <div className="min-h-screen bg-background text-foreground pb-40">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-10 text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em]"
          style={{ background: "color-mix(in srgb, var(--app-accent) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--app-accent) 25%, transparent)", color: "var(--app-accent)" }}>
          <Sparkles size={11} /> Mood Matcher
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-none mb-4">
          How are you
          <span className="italic" style={{
            backgroundImage: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}> feeling?</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
          className="text-muted text-lg">
          Pick your vibe — we'll find the perfect anime.
        </motion.p>
      </div>

      {/* Mood Grid */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
          {MOODS.map((m, i) => {
            const Icon = m.icon
            const active = selected === m.id
            return (
              <motion.button key={m.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(active ? null : m.id)}
                className={`relative text-left p-5 rounded-2xl border transition-all duration-300 group ${
                  active ? `bg-gradient-to-br ${m.color} ${m.border} scale-[1.02]` : "bg-surface border-border hover:border-border hover:bg-surface"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{m.emoji}</span>
                  {active && (
                    <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--app-accent)" }} />
                  )}
                </div>
                <p className={`text-sm font-black ${active ? m.accent : "text-muted group-hover:text-foreground"} transition-colors`}>
                  {m.label}
                </p>
                <p className="text-[10px] text-subtle mt-0.5">{m.desc}</p>
              </motion.button>
            )
          })}
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div key={selected}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{mood?.emoji}</span>
                <div>
                  <h2 className={`text-xl font-black ${mood?.accent}`}>{mood?.label}</h2>
                  <p className="text-[10px] text-subtle uppercase tracking-widest">
                    {isLoading ? "Finding matches…" : `${anime.length} perfect matches`}
                  </p>
                </div>
              </div>

              {isLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-[2/3] rounded-[1.6rem] bg-white/[0.04] animate-pulse"
                      style={{ animationDelay: `${i * 50}ms` }} />
                  ))}
                </div>
              )}

              {!isLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {anime.map((a, i) => (
                    <AnimeCard key={a.id} anime={a} index={i} onClick={setSelectedAnime} />
                  ))}
                </div>
              )}

              {!isLoading && anime.length === 0 && (
                <div className="py-20 text-center border border-dashed border-border rounded-[3rem]">
                  <p className="text-subtle font-black uppercase tracking-widest text-xs">No matches — try another mood</p>
                </div>
              )}

              <div className="mt-8 text-center">
                <Link href="/ai-discover"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-black transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}>
                  <Flame size={14} /> Get AI-powered picks instead
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-center py-16 text-subtle text-sm">
            ↑ Pick a mood above to get started
          </motion.div>
        )}
      </div>

      <AnimeModal isOpen={selectedAnime !== null} onClose={() => setSelectedAnime(null)} anime={selectedAnime} />
    </div>
  )
}
