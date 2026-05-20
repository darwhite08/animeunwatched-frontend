"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { MagnifyingGlass, Lightning, Star, ArrowRight, Clock } from "@phosphor-icons/react"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import { useRouter } from "next/navigation"
import { useSearchAnimeApi } from "@/hooks/useAnime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return {
    id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "",
    rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes,
    type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV",
    status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished",
    studio: a.studios[0] ?? "Unknown", genres: a.genres,
    synopsis: a.synopsis ?? "", image: a.imageUrl ?? "",
    tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i + 1,
  }
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const QUICK_ACTIONS = [
  { icon: Lightning, label: "AI Discover", href: "/ai-discover", cmd: "G + D" },
  { icon: Star,      label: "Best Anime List", href: "/bestanimelist", cmd: "G + T" },
  { icon: Clock,     label: "My Watchlist", href: "/watchlist", cmd: "G + W" },
]

const RECENT = ["Frieren", "Chainsaw Man", "Solo Leveling", "Monster"]

type UserSuggestion = { username: string; displayName: string }

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([])
  const [cursor, setCursor] = useState(-1)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const suggestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: searchData } = useSearchAnimeApi(query.trim())
  const results = useMemo(() => (searchData?.data ?? []).slice(0, 6).map(mapDTO), [searchData])

  // Debounce cursor reset on query change
  useEffect(() => {
    if (!query.trim()) { setUserSuggestions([]); setCursor(-1); return }
    setCursor(-1)

    // Debounced backend suggestions for users
    if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current)
    suggestTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/search/suggestions?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json() as { anime: unknown[]; users: UserSuggestion[] }
          setUserSuggestions(data.users?.slice(0, 2) ?? [])
        }
      } catch { /* backend may not be running in dev — silently ignore */ }
    }, 350)

    return () => { if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current) }
  }, [query])

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80)
      setQuery("")
      setCursor(-1)
    }
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const listLen = results.length || RECENT.length
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, listLen - 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor(c => Math.max(c - 1, -1)) }
    else if (e.key === "Escape") onClose()
    else if (e.key === "Enter") {
      if (cursor >= 0 && results.length > 0) setSelectedAnime(results[cursor])
      else if (query.trim()) { onClose(); router.push(`/search?q=${encodeURIComponent(query)}`) }
    }
  }, [results, cursor, onClose])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-start justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.96, y: -16, opacity: 0 }}
              animate={{ scale: 1, y: 80, opacity: 1 }}
              exit={{ scale: 0.96, y: -16, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#0c0c0c]/95 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Input */}
              <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
                <MagnifyingGlass size={20} weight="bold" className={`shrink-0 transition-colors ${query ? "text-amber-400" : "text-white/30"}`} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search anime, genres, or tags…"
                  className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-white placeholder:text-white/20"
                />
                {query ? (
                  <button onClick={() => setQuery("")} className="text-white/30 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-white/20 uppercase tracking-tighter shrink-0">
                    ⌘ K
                  </div>
                )}
              </div>

              {/* Results */}
              <div className="p-3 max-h-[420px] overflow-y-auto no-scrollbar">
                {!query.trim() ? (
                  <>
                    {/* Quick actions */}
                    <p className="px-4 py-2 text-[9px] font-black text-amber-400 uppercase tracking-[0.2em]">Quick Navigate</p>
                    <div className="space-y-0.5 mb-3">
                      {QUICK_ACTIONS.map((item, i) => (
                        <a
                          key={item.label}
                          href={item.href}
                          onClick={onClose}
                          className={`group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all ${cursor === i ? "bg-white/5" : ""}`}
                        >
                          <div className="flex items-center gap-3 text-white/50 group-hover:text-white">
                            <item.icon size={14} className="text-amber-500/70 group-hover:text-amber-400" />
                            <span className="text-sm font-bold uppercase tracking-tight">{item.label}</span>
                          </div>
                          <span className="text-[9px] font-mono text-white/10 group-hover:text-white/30">{item.cmd}</span>
                        </a>
                      ))}
                    </div>

                    {/* Recent / trending */}
                    <p className="px-4 py-2 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Neural Trending</p>
                    <div className="space-y-0.5">
                      {RECENT.map((term, i) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-indigo-600/10 transition-all border border-transparent hover:border-indigo-500/20 ${cursor === QUICK_ACTIONS.length + i ? "bg-indigo-600/10 border-indigo-500/20" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-hover:text-amber-400">
                              <ArrowRight size={12} />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-tight text-white/40 group-hover:text-white transition-colors">{term}</span>
                          </div>
                          <span className="text-[9px] font-black text-amber-500 italic opacity-0 group-hover:opacity-100">Search</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : results.length > 0 || userSuggestions.length > 0 ? (
                  <>
                    {results.length > 0 && (
                      <>
                        <p className="px-4 py-2 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                          {results.length} Archive{results.length !== 1 ? "s" : ""} Found
                        </p>
                        <div className="space-y-0.5">
                          {results.map((anime, i) => (
                            <button
                              key={anime.id}
                              onClick={() => setSelectedAnime(anime)}
                              className={`group w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-left ${cursor === i ? "bg-white/5" : ""}`}
                            >
                              <div className="relative h-10 w-8 shrink-0 rounded-lg overflow-hidden bg-white/10">
                                {anime.image && <img src={anime.image} alt={anime.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-white/80 group-hover:text-white truncate uppercase tracking-tight">
                                  {anime.title}
                                </p>
                                <p className="text-[9px] text-white/30 uppercase tracking-wider">
                                  {anime.year} · {anime.type} · ★ {anime.rating}
                                </p>
                              </div>
                              <span className="text-[9px] font-black text-amber-500 italic opacity-0 group-hover:opacity-100 shrink-0">Open</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {userSuggestions.length > 0 && (
                      <>
                        <p className="px-4 py-2 mt-2 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Users</p>
                        <div className="space-y-0.5">
                          {userSuggestions.map(u => (
                            <a
                              key={u.username}
                              href={`/u/${u.username}`}
                              onClick={onClose}
                              className="group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all"
                            >
                              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-black shrink-0">
                                {u.displayName[0]}
                              </div>
                              <div>
                                <p className="text-sm font-black text-white/70 group-hover:text-white">{u.displayName}</p>
                                <p className="text-[9px] text-white/30">@{u.username}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-white/20 text-xs font-black uppercase tracking-widest">No archives matched</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-white/5 bg-black/30 flex items-center justify-between">
                <div className="flex gap-4 text-[9px] font-black text-white/10 uppercase tracking-widest">
                  <span>↑↓ navigate</span>
                  <span>↵ open</span>
                  <span>esc close</span>
                </div>
                <div className="text-[9px] font-black text-amber-500/40 uppercase tracking-widest animate-pulse">
                  {query ? `${results.length} matches` : "Neural_Link_Ready"}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline anime modal from search */}
      <AnimeModal
        isOpen={selectedAnime !== null}
        onClose={() => { setSelectedAnime(null); onClose() }}
        anime={selectedAnime}
      />
    </>
  )
}
