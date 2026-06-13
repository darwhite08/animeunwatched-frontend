"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Star, Loader2 } from "lucide-react"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import Link from "next/link"
import Image from "next/image"
import { useSearchAnimeApi, useBrowseAnime } from "@/hooks/useAnime"
import { useLeaderboard } from "@/hooks/useLeaderboard"
import { useDiscover } from "@/hooks/usePosts"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return {
    id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "",
    rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes,
    type: (["TV","Movie","OVA"] as const).includes(a.type as "TV"|"Movie"|"OVA") ? (a.type as "TV"|"Movie"|"OVA") : "TV",
    status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished",
    studio: a.studios[0] ?? "Unknown", genres: a.genres,
    synopsis: a.synopsis ?? "", image: a.imageUrl ?? "/assets/png/tanjiro.png",
    tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i + 1,
  }
}

type Tab = "anime" | "users" | "posts"

const MOCK_USERS = [
  { id: "u1", name: "Otaku_Arch",    bio: "Legendary Shinobi • Level 99",    archived: 312 },
  { id: "u2", name: "ShadowWatcher", bio: "Arch-Mage • Psychological fanatic", archived: 208 },
  { id: "u3", name: "NeuralBot_X",   bio: "Elite Jonin • Shonen completionist", archived: 145 },
]

function SearchContent() {
  const sp = useSearchParams()
  const initial = sp.get("q") ?? ""

  const [query,  setQuery]  = useState(initial)
  const [tab,    setTab]    = useState<Tab>("anime")
  const [modal,  setModal]  = useState<Anime | null>(null)

  const searchQ = query.trim()
  const { data: searchData, isLoading: searchLoading } = useSearchAnimeApi(searchQ)
  const { data: browseData } = useBrowseAnime({ limit: 20 })
  const { data: lbData } = useLeaderboard(20)
  const { data: discoverPosts } = useDiscover()

  const animeResults = useMemo(() => {
    if (searchQ.length >= 2) return (searchData?.data ?? []).map(mapDTO)
    return (browseData?.data ?? []).map(mapDTO)
  }, [searchQ, searchData, browseData])

  const apiUsers = (lbData?.data ?? []).map(u => ({ id: u.username, name: u.displayName, bio: `Level ${u.level} Shinobi`, archived: u.archived }))
  const userResults = useMemo(() => {
    const base = apiUsers.length > 0 ? apiUsers : MOCK_USERS
    return base.filter(u => !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.id.toLowerCase().includes(query.toLowerCase()))
  }, [query, apiUsers])

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: "anime", label: "Anime",   count: animeResults.length },
    { id: "users", label: "Users",   count: userResults.length  },
    { id: "posts", label: "Posts",   count: (discoverPosts?.pages[0]?.data ?? []).length || 0 },
  ]

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-24 sm:pb-32 space-y-8 sm:space-y-10">

        {/* Header */}
        <div>
          <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-accent-bright/60 mb-2">
            Neural Archive Search
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground uppercase italic mb-6 sm:mb-8">
            Search<span style={{color:"var(--app-accent)"}}>.</span>
          </h1>

          {/* Search box */}
          <div className="relative group">
            <Search
              size={18}
              className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${
                query ? "text-accent-bright" : "text-subtle"
              }`}
            />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              placeholder="Search anime, users, tags…"
              className="w-full min-h-12 pl-13 pr-12 py-4 text-base sm:text-lg font-medium bg-white/[0.04] border border-border rounded-2xl text-foreground placeholder:text-subtle outline-none focus:border-accent/50 focus:bg-white/[0.06] transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-xl text-subtle hover:text-foreground active:scale-95 transition-all"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide [-webkit-overflow-scrolling:touch]">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative shrink-0 min-h-11 px-5 py-3 text-sm font-black uppercase tracking-wider transition-colors active:scale-95 ${
                tab === t.id ? "text-foreground" : "text-subtle hover:text-muted"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className="ml-2 text-[9px] font-black text-subtle">{t.count}</span>
              )}
              {tab === t.id && (
                <motion.div
                  layoutId="search-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{background:"var(--app-accent)"}}
                />
              )}
            </button>
          ))}
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {tab === "anime" && (
            <motion.div key="anime" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {searchLoading && searchQ.length >= 2 && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-accent-bright" />
                </div>
              )}
              {!searchLoading && animeResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
                  {animeResults.map((anime, i) => (
                    <motion.div
                      key={anime.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setModal(anime)}
                      className="group aspect-[2/3] relative cursor-pointer"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-b from-indigo-500/0 to-indigo-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative h-full w-full rounded-[1.4rem] overflow-hidden border border-border group-hover:border-border transition-colors">
                        <Image
                          src={anime.image}
                          alt={anime.title}
                          fill
                          className="object-cover brightness-75 group-hover:brightness-90 transition-all duration-500 scale-105 group-hover:scale-100"
                          sizes="200px"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
                          <p className="text-xs font-black text-foreground uppercase tracking-tight leading-tight line-clamp-2">
                            {anime.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Star size={10} fill="var(--app-accent)" className="text-accent-bright" />
                            <span className="text-[10px] font-black text-muted">{anime.rating.toFixed(1)}</span>
                            <span className="text-[9px] text-subtle">{anime.year}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState query={query} tab="anime" />
              )}
            </motion.div>
          )}

          {tab === "users" && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {userResults.length > 0 ? userResults.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-surface border border-border hover:border-border hover:bg-surface transition-all group cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg font-black shrink-0">
                    {u.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-foreground group-hover:text-accent-bright transition-colors">{u.name}</p>
                    <p className="text-xs text-subtle mt-0.5">{u.bio}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-foreground">{u.archived}</p>
                    <p className="text-[9px] text-subtle uppercase tracking-wider">Archived</p>
                  </div>
                </motion.div>
              )) : <EmptyState query={query} tab="users" />}
            </motion.div>
          )}

          {tab === "posts" && (
            <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {query ? (
                <div className="space-y-3">
                  {(discoverPosts?.pages[0]?.data ?? []).filter(p => !query || p.content.toLowerCase().includes(query.toLowerCase())).slice(0, 6).map((post, i) => {
                    const author = post.author?.displayName ?? post.author?.username ?? "Anonymous"
                    const d = Date.now() - new Date(post.createdAt).getTime()
                    const timeStr = d < 3600000 ? `${Math.floor(d/60000)}m ago` : d < 86400000 ? `${Math.floor(d/3600000)}h ago` : `${Math.floor(d/86400000)}d ago`
                    return (
                      <motion.div key={post.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileTap={{ scale: 0.98 }}
                        className="p-4 sm:p-5 rounded-2xl bg-surface border border-border hover:border-border transition-all cursor-pointer">
                        <p className="font-bold text-muted hover:text-foreground line-clamp-2">{post.content.slice(0, 100)}…</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-subtle">
                          <span>@{author}</span>
                          <span>{timeStr}</span>
                          <span>{post._count?.likes ?? 0} likes</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : <EmptyState query="" tab="posts" />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimeModal isOpen={modal !== null} onClose={() => setModal(null)} anime={modal} />
    </>
  )
}

function EmptyState({ query, tab }: { query: string; tab: string }) {
  return (
    <div className="py-20 text-center border border-dashed border-border rounded-[3rem]">
      <Search size={28} className="mx-auto mb-3 text-subtle" />
      <p className="text-subtle text-sm font-black uppercase tracking-widest">
        {query ? `No ${tab} matched "${query}"` : `Type something to search ${tab}`}
      </p>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <div className="min-h-screen bg-background text-foreground">
        <SearchContent />
      </div>
    </Suspense>
  )
}
