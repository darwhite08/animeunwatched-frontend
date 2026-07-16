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
import { Avatar } from "@/components/ui/Avatar"

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

type UserSuggestion = { username: string; displayName: string; avatarUrl?: string | null }

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  // Debounced query drives the anime search request so we don't fire one per
  // keystroke — predictive results update ~300ms after typing stops.
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([])
  const [cursor, setCursor] = useState(-1)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const suggestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  const { data: searchData } = useSearchAnimeApi(debouncedQuery)
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
      setDebouncedQuery("")
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
            className="fixed inset-0 z-[200] flex items-start justify-center p-0 sm:p-6 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.98, y: -8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: -8, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 340 }}
              onClick={e => e.stopPropagation()}
              className="w-full h-[100dvh] sm:h-auto sm:mt-20 max-w-2xl flex flex-col bg-background/95 backdrop-blur-3xl rounded-none sm:rounded-3xl border-x-0 border-t-0 sm:border border-border shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden pt-safe sm:pt-0"
            >
              {/* Input */}
              <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 min-h-14 border-b border-border">
                <MagnifyingGlass size={20} weight="bold" className={`shrink-0 transition-colors ${query ? "text-accent-bright" : "text-subtle"}`} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search anime, genres, or tags…"
                  className="flex-1 min-h-11 bg-transparent border-none outline-none text-base sm:text-lg font-medium text-foreground placeholder:text-muted"
                />
                {query ? (
                  <button onClick={() => setQuery("")} className="shrink-0 h-11 w-11 -mr-2 flex items-center justify-center rounded-xl text-subtle hover:text-foreground active:scale-95 transition-all">
                    <X size={18} />
                  </button>
                ) : (
                  <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-surface border border-border text-[9px] font-black text-subtle uppercase tracking-tighter shrink-0">
                    ⌘ K
                  </div>
                )}
              </div>

              {/* Results */}
              <div className="p-3 flex-1 sm:flex-none sm:max-h-[60vh] overflow-y-auto [-webkit-overflow-scrolling:touch] no-scrollbar pb-safe sm:pb-3">
                {!query.trim() ? (
                  <>
                    {/* Quick actions */}
                    <p className="px-4 py-2 text-[9px] font-black text-accent-bright uppercase tracking-[0.2em]">Quick Navigate</p>
                    <div className="space-y-0.5 mb-3">
                      {QUICK_ACTIONS.map((item, i) => (
                        <a
                          key={item.label}
                          href={item.href}
                          onClick={onClose}
                          className={`group flex items-center justify-between min-h-11 px-4 py-3 rounded-xl hover:bg-surface cursor-pointer transition-all active:scale-[0.98] ${cursor === i ? "bg-surface" : ""}`}
                        >
                          <div className="flex items-center gap-3 text-muted group-hover:text-foreground">
                            <item.icon size={14} className="text-accent/70 group-hover:text-foreground" />
                            <span className="text-sm font-bold uppercase tracking-tight">{item.label}</span>
                          </div>
                          <span className="text-[9px] font-mono text-subtle group-hover:text-subtle">{item.cmd}</span>
                        </a>
                      ))}
                    </div>

                    {/* Recent / trending */}
                    <p className="px-4 py-2 text-[9px] font-black text-subtle uppercase tracking-[0.2em]">Neural Trending</p>
                    <div className="space-y-0.5">
                      {RECENT.map((term, i) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className={`group w-full flex items-center justify-between min-h-11 px-4 py-3 rounded-xl hover:bg-white/10 transition-all active:scale-[0.98] border border-transparent hover:border-white/20 ${cursor === QUICK_ACTIONS.length + i ? "bg-accent/10 border-accent/20" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 rounded-lg bg-surface flex items-center justify-center text-subtle group-hover:text-foreground">
                              <ArrowRight size={12} />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-tight text-muted group-hover:text-foreground transition-colors">{term}</span>
                          </div>
                          <span className="text-[9px] font-black text-accent italic opacity-0 group-hover:opacity-100">Search</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : results.length > 0 || userSuggestions.length > 0 ? (
                  <>
                    {results.length > 0 && (
                      <>
                        <p className="px-4 py-2 text-[9px] font-black text-subtle uppercase tracking-[0.2em]">
                          {results.length} Archive{results.length !== 1 ? "s" : ""} Found
                        </p>
                        <div className="space-y-0.5">
                          {results.map((anime, i) => (
                            <button
                              key={anime.id}
                              onClick={() => setSelectedAnime(anime)}
                              className={`group w-full flex items-center gap-4 min-h-11 px-4 py-3 rounded-xl hover:bg-surface transition-all active:scale-[0.98] text-left ${cursor === i ? "bg-surface" : ""}`}
                            >
                              <div className="relative h-10 w-8 shrink-0 rounded-lg overflow-hidden bg-surface">
                                {anime.image && <img loading="lazy" decoding="async" src={anime.image} alt={anime.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-muted group-hover:text-foreground truncate uppercase tracking-tight">
                                  {anime.title}
                                </p>
                                <p className="text-[9px] text-subtle uppercase tracking-wider">
                                  {anime.year} · {anime.type} · ★ {anime.rating}
                                </p>
                              </div>
                              <span className="text-[9px] font-black text-accent italic opacity-0 group-hover:opacity-100 shrink-0">Open</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {userSuggestions.length > 0 && (
                      <>
                        <p className="px-4 py-2 mt-2 text-[9px] font-black text-subtle uppercase tracking-[0.2em]">Users</p>
                        <div className="space-y-0.5">
                          {userSuggestions.map(u => (
                            <a
                              key={u.username}
                              href={`/u/${u.username}`}
                              onClick={onClose}
                              className="group w-full flex items-center gap-3 min-h-11 px-4 py-2.5 rounded-xl hover:bg-surface transition-all active:scale-[0.98]"
                            >
                              <Avatar src={u.avatarUrl} name={u.displayName} size={32} />

                              <div>
                                <p className="text-sm font-black text-muted group-hover:text-foreground">{u.displayName}</p>
                                <p className="text-[9px] text-subtle">@{u.username}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-subtle text-xs font-black uppercase tracking-widest">No archives matched</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-border bg-black/30 flex items-center justify-between">
                <div className="flex gap-4 text-[10px] font-black text-subtle uppercase tracking-widest">
                  <span>↑↓ navigate</span>
                  <span>↵ open</span>
                  <span>esc close</span>
                </div>
                <div className="text-[10px] font-black text-accent/40 uppercase tracking-widest animate-pulse">
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
