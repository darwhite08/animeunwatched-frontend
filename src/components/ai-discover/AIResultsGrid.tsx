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
}

export default function AIResultsGrid({ results, hasSearched, query }: AIResultsGridProps) {
  const { add, remove, has } = useWatchlist()
  const { push } = useToast()
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)

  if (!hasSearched) {
    // Default teaser grid
    return (
      <section className="py-24 bg-[#030303] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
              Neural Matches<span style={{color:"#f59e0b"}}>.</span>
            </h2>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
              Submit a query to activate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-30 pointer-events-none select-none">
            {[1,2,3].map(i => (
              <div key={i} className="aspect-[16/10] bg-white/5 rounded-[2rem] border border-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-24 bg-[#030303] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black text-white italic uppercase tracking-tighter"
              >
                Neural Matches<span style={{color:"#f59e0b"}}>.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-2"
              >
                Query: "{query.slice(0, 60)}{query.length > 60 ? "…" : ""}"
              </motion.p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Results Processed: 0.0042s</p>
              <p className="text-lg font-black text-indigo-400 font-mono mt-1">{results.length} Matches</p>
            </div>
          </div>

          {results.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center border border-dashed border-white/5 rounded-[3rem]"
            >
              <Sparkles size={32} className="mx-auto mb-4 text-white/20" />
              <p className="text-white/30 font-black uppercase tracking-widest text-sm">No matches found — try different keywords</p>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {results.map((anime, i) => {
                  const inList = has(anime.id)
                  const synchRate = Math.min(99, 85 + Math.floor(Math.random() * 14))

                  return (
                    <motion.div
                      key={anime.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ y: -8 }}
                      onClick={() => setSelectedAnime(anime)}
                      className="group relative aspect-[16/10] bg-white/5 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 overflow-hidden p-1 cursor-pointer transition-colors duration-300"
                    >
                      <div className="relative h-full w-full rounded-[1.8rem] overflow-hidden flex flex-col justify-end p-5">
                        <img
                          src={anime.image}
                          alt={anime.title}
                          className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 brightness-50 group-hover:brightness-75"
                        />

                        {/* Synch rate scanner */}
                        <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{ repeat: Infinity, duration: 3, delay: i * 0.4, ease: "linear" }}
                          className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent pointer-events-none"
                        />

                        {/* Add to list */}
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            if (inList) { remove(anime.id); push(`Removed "${anime.title}"`, "info") }
                            else { add(anime); push(`Added "${anime.title}" to watchlist!`, "success") }
                          }}
                          className={`absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                            inList
                              ? "bg-emerald-500 opacity-100"
                              : "bg-black/40 border border-white/20 opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          {inList ? <Check size={13} className="text-white" /> : <Plus size={14} className="text-white" />}
                        </button>

                        <div className="relative z-10 flex items-end justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mb-1">
                              {synchRate}% Synch Rate
                            </p>
                            <h3 className="text-lg font-black text-white uppercase italic leading-tight truncate">
                              {anime.title}
                            </h3>
                            <p className="text-[9px] text-white/40 uppercase tracking-wider mt-1">
                              {anime.year} · {anime.studio}
                            </p>
                          </div>
                          <div className="flex flex-col items-center gap-1 bg-black/50 backdrop-blur-md p-2 rounded-xl border border-white/10 shrink-0">
                            <Star size={13} fill="#6366f1" className="text-indigo-500" />
                            <span className="text-[10px] font-black text-white">{anime.rating.toFixed(1)}</span>
                          </div>
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
