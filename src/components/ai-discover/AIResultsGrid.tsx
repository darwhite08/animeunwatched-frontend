"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Star, Zap, Plus, Check, Sparkles } from "lucide-react"
import type { Anime } from "@/lib/data/anime"
import { useWatchlist } from "@/stores/watchlist.store"
import { useToast } from "@/stores/toast.store"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import { useState } from "react"

interface AIResultsGridProps {
  results: Anime[]
  hasSearched: boolean
  query: string
  /** Real per-result match% + reason from the backend, keyed by anime id (malId). */
  meta?: Record<string, { match: number; reason?: string }>
  loading?: boolean
}

export default function AIResultsGrid({ results, hasSearched, query, meta = {}, loading = false }: AIResultsGridProps) {
  const { add, remove, has } = useWatchlist()
  const { push } = useToast()
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)

  if (!hasSearched) {
    // Default teaser grid
    return (
      <section className="py-12 sm:py-24 bg-background px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground italic uppercase tracking-tighter">
              Neural Matches<span style={{color:"var(--app-accent)"}}>.</span>
            </h2>
            <p className="text-[10px] font-black text-subtle uppercase tracking-widest text-right">
              Submit a query to activate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 opacity-30 pointer-events-none select-none">
            {[1,2,3].map(i => (
              <div key={i} className="aspect-[16/10] bg-surface rounded-[1.5rem] sm:rounded-[2rem] border border-border animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-12 sm:py-24 bg-background px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 sm:mb-12">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl font-black text-foreground italic uppercase tracking-tighter"
              >
                Neural Matches<span style={{color:"var(--app-accent)"}}>.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[10px] font-black text-subtle uppercase tracking-widest mt-2"
              >
                Query: "{query.slice(0, 60)}{query.length > 60 ? "…" : ""}"
              </motion.p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-subtle uppercase tracking-widest">Results Processed: 0.0042s</p>
              <p className="text-lg font-black text-accent-bright font-mono mt-1">{results.length} Matches</p>
            </div>
          </div>

          {loading && results.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-[16/10] bg-surface rounded-[1.5rem] sm:rounded-[2rem] border border-border animate-pulse" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center border border-dashed border-border rounded-[3rem]"
            >
              <Sparkles size={32} className="mx-auto mb-4 text-subtle" />
              <p className="text-subtle font-black uppercase tracking-widest text-sm">No matches in our catalog — try rephrasing your request</p>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              <AnimatePresence>
                {results.map((anime, i) => {
                  const inList = has(anime.id)
                  // Real match% from the backend rerank; fall back to a rating-derived
                  // estimate only if the backend didn't score this one.
                  const m = meta[anime.id]
                  const synchRate = m?.match ?? Math.min(95, Math.round((anime.rating || 7) * 10))
                  const reason = m?.reason

                  const meterColor = synchRate >= 90 ? "var(--app-accent-bright)" : synchRate >= 75 ? "var(--app-accent)" : "#a78bfa"
                  return (
                    <motion.div
                      key={anime.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -6 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => setSelectedAnime(anime)}
                      className="group relative aspect-[16/10] rounded-[1.4rem] sm:rounded-[1.8rem] overflow-hidden border border-border hover:border-accent/40 cursor-pointer transition-colors duration-300 bg-surface"
                    >
                      <img loading="lazy" decoding="async"
                        src={anime.image}
                        alt={anime.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      />
                      {/* Legibility gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-black/10" />

                      {/* Top row: rank + match, and add-to-list */}
                      <div className="absolute top-3 left-3 right-3 z-10 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="grid place-items-center h-6 min-w-[24px] px-1.5 rounded-lg bg-black/55 backdrop-blur-md text-[11px] font-black text-white/90 tabular-nums">{i + 1}</span>
                          <span
                            className="inline-flex items-center h-6 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-black"
                            style={{ background: meterColor }}
                          >
                            {synchRate}% match
                          </span>
                        </div>
                        <button
                          aria-label={inList ? "Remove from watchlist" : "Add to watchlist"}
                          onClick={e => {
                            e.stopPropagation()
                            if (inList) { remove(anime.id); push(`Removed "${anime.title}"`, "info") }
                            else { add(anime); push(`Added "${anime.title}" to watchlist!`, "success") }
                          }}
                          className={`h-9 w-9 rounded-full grid place-items-center transition-all active:scale-90 ${
                            inList
                              ? "bg-emerald-500"
                              : "bg-black/45 backdrop-blur-md border border-white/15 hover:bg-black/70"
                          }`}
                        >
                          {inList ? <Check size={14} className="text-white" /> : <Plus size={15} className="text-white" />}
                        </button>
                      </div>

                      {/* Bottom content */}
                      <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
                        <div className="flex items-center gap-2 mb-1.5">
                          {anime.rating > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-300">
                              <Star size={11} fill="currentColor" /> {anime.rating.toFixed(1)}
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-white/55 uppercase tracking-wider truncate">
                            {[anime.type, anime.year || null, anime.studio !== "Unknown" ? anime.studio : null].filter(Boolean).join(" · ")}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white leading-tight line-clamp-2">
                          {anime.title}
                        </h3>
                        {reason && (
                          <p className="text-[11px] text-accent-bright/95 leading-snug mt-1 line-clamp-2">
                            {reason}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {anime.genres.slice(0, 3).map(g => (
                            <span key={g} className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm text-[9px] font-bold text-white/75 uppercase tracking-wide">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      <AnimeModal
        isOpen={selectedAnime !== null}
        onClose={() => setSelectedAnime(null)}
        anime={selectedAnime}
      />
    </>
  )
}
