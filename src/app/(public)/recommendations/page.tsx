"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Dna, Gem, Clapperboard, TrendingUp, ArrowRight, Brain } from "lucide-react"
import Link from "next/link"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

/* ── Recommendation modes ── */
type ModeId = "dna" | "gems" | "similar" | "trending"

const MODES: { id: ModeId; label: string; sub: string; icon: typeof Dna; accent: string }[] = [
  {
    id:     "dna",
    label:  "Based on Your DNA",
    sub:    "Action · Psychological · Top genres",
    icon:   Dna,
    accent: "from-indigo-600/30 to-violet-600/20 border-indigo-500/25",
  },
  {
    id:     "gems",
    label:  "Hidden Gems",
    sub:    "Rating ≥ 8.5 · Under the radar",
    icon:   Gem,
    accent: "from-amber-600/20 to-orange-600/15 border-amber-500/25",
  },
  {
    id:     "similar",
    label:  "Similar to Watched",
    sub:    "MAPPA · Madhouse · Same studios",
    icon:   Clapperboard,
    accent: "from-violet-600/25 to-fuchsia-600/15 border-violet-500/25",
  },
  {
    id:     "trending",
    label:  "Currently Trending",
    sub:    "Airing now · High ratings",
    icon:   TrendingUp,
    accent: "from-emerald-600/20 to-teal-600/15 border-emerald-500/25",
  },
]

/* ── Per-mode anime slices ── */
function getAnimeForMode(mode: ModeId, allAnime: Anime[]): Anime[] {
  switch (mode) {
    case "dna":
      return allAnime.filter(a =>
        a.genres.some(g => ["Action", "Psychological"].includes(g))
      ).slice(0, 9)
    case "gems":
      return allAnime.filter(a => a.rating >= 8.5 && a.rank > 10).slice(0, 9)
    case "similar":
      return allAnime.filter(a => ["MAPPA", "Madhouse", "Bones"].includes(a.studio)).slice(0, 9)
    case "trending":
      return allAnime.filter(a => a.status === "airing" && a.rating >= 8.5).slice(0, 9)
    default:
      return allAnime.slice(0, 9)
  }
}

/* ── Match score seeds (deterministic by rank) ── */
function matchScore(anime: Anime, mode: ModeId): number {
  const base = Math.round(70 + (anime.rating - 8) * 15 + (25 - anime.rank) * 0.4)
  const offsets: Record<ModeId, number> = { dna: 5, gems: -3, similar: 2, trending: 7 }
  return Math.min(99, Math.max(71, base + offsets[mode]))
}

/* ── Animated counter ── */
function AnimatedCounter({ target }: { target: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let frame: number
    const start = performance.now()
    const duration = 800
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      setVal(Math.round(p * target))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return <>{val}</>
}

export default function RecommendationsPage() {
  const [mode, setMode] = useState<ModeId>("dna")
  const [modalAnime, setModalAnime] = useState<Anime | null>(null)
  const { data: browseData } = useBrowseAnime({ limit: 50 })
  const allAnime = (browseData?.data ?? []).map(mapDTO)
  const results = getAnimeForMode(mode, allAnime)

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      {/* ── Cinematic header ── */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full" />
          <div className="absolute -top-16 right-1/3 w-72 h-72 bg-violet-600/8 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-12">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/15 border border-indigo-500/20">
              <Brain size={13} className="text-indigo-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400">Neural Oracle</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black tracking-tighter uppercase italic text-white leading-none mb-3"
          >
            What to Watch<br />
            <span className="text-indigo-400">Next</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-white/40 text-sm max-w-lg"
          >
            Neural Oracle analyses your watch history, genre preferences, and behaviour
            patterns to surface exactly what you should watch next.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* ── Mode selector ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {MODES.map((m, i) => (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setMode(m.id)}
              className={`relative p-5 rounded-2xl border text-left transition-all duration-300 overflow-hidden group ${
                mode === m.id
                  ? `bg-gradient-to-br ${m.accent} scale-[1.02] shadow-lg shadow-black/40`
                  : "bg-white/[0.02] border-white/8 hover:border-white/15 hover:bg-white/[0.04]"
              }`}
            >
              {mode === m.id && (
                <motion.div
                  layoutId="mode-pill"
                  className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none"
                  transition={{ type: "spring", stiffness: 340, damping: 30 }}
                />
              )}
              <m.icon
                size={20}
                className={`mb-3 transition-colors ${
                  mode === m.id ? "text-white" : "text-white/30 group-hover:text-white/60"
                }`}
              />
              <p className={`text-sm font-black leading-tight mb-1 ${mode === m.id ? "text-white" : "text-white/70"}`}>
                {m.label}
              </p>
              <p className="text-[10px] text-white/30">{m.sub}</p>
            </motion.button>
          ))}
        </div>

        {/* ── Results grid + sidebar ── */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
                {results.length} results · {MODES.find(m => m.id === mode)?.label}
              </h2>
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-indigo-400/60">
                <Sparkles size={10} />
                AI curated
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {results.map((anime, idx) => (
                  <div key={anime.id} className="space-y-2">
                    {/* Match score badge */}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 border border-indigo-500/15 w-fit">
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                        <AnimatedCounter target={matchScore(anime, mode)} />% Match
                      </span>
                    </div>
                    <AnimeCard
                      anime={anime}
                      index={idx}
                      onClick={() => setModalAnime(anime)}
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* AI Oracle sidebar */}
          <aside className="xl:w-80 shrink-0">
            <div className="sticky top-6 space-y-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600/10 to-violet-600/8 border border-indigo-500/20 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-indigo-600/15 blur-[50px] rounded-full pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-xl bg-indigo-600/20">
                      <Brain size={16} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">AI Oracle</p>
                      <p className="text-[9px] text-white/30">Powered by Neural Engine</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed mb-5">
                    Tell Oracle exactly what you&apos;re in the mood for — genre, vibe, length, or emotional tone.
                  </p>
                  <Link
                    href="/ai-discover"
                    className="flex items-center justify-between w-full px-5 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 transition-colors text-xs font-black uppercase tracking-widest text-white"
                  >
                    Ask Oracle
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Stats card */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25 mb-4">Your DNA</p>
                {[
                  { label: "Action",       pct: 82 },
                  { label: "Psychological",pct: 74 },
                  { label: "Seinen",       pct: 61 },
                  { label: "Thriller",     pct: 55 },
                  { label: "Fantasy",      pct: 48 },
                ].map(({ label, pct }) => (
                  <div key={label} className="mb-3 last:mb-0">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-white/40 mb-1">
                      <span>{label}</span><span>{pct}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Minimal click-away modal */}
      <AnimatePresence>
        {modalAnime && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalAnime(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 max-w-md w-full"
            >
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-1">{modalAnime.studio}</p>
              <h3 className="text-2xl font-black tracking-tighter uppercase italic text-white mb-2">{modalAnime.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed mb-5">{modalAnime.synopsis.slice(0, 180)}…</p>
              <div className="flex gap-3">
                <Link
                  href={`/anime/${modalAnime.id}`}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black uppercase tracking-widest text-white text-center transition-colors"
                >
                  View Details
                </Link>
                <button
                  onClick={() => setModalAnime(null)}
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/60 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
