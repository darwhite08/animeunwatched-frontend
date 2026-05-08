"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Star, Filter } from "lucide-react"
import { searchAnime, ANIME_DB, type Anime } from "@/lib/data/anime"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import Link from "next/link"
import Image from "next/image"

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

  const animeResults = useMemo(() => searchAnime(query).slice(0, 20), [query])
  const userResults  = useMemo(() =>
    MOCK_USERS.filter(u =>
      !query || u.name.toLowerCase().includes(query.toLowerCase())
    ), [query])

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: "anime", label: "Anime",   count: animeResults.length },
    { id: "users", label: "Users",   count: userResults.length  },
    { id: "posts", label: "Posts",   count: query ? 4 : 0       },
  ]

  return (
    <>
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-32 space-y-10">

        {/* Header */}
        <div>
          <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-indigo-400/60 mb-2">
            Neural Archive Search
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic mb-8">
            Search<span className="text-indigo-500">.</span>
          </h1>

          {/* Search box */}
          <div className="relative group">
            <Search
              size={18}
              className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${
                query ? "text-indigo-400" : "text-white/25"
              }`}
            />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              placeholder="Search anime, users, tags…"
              className="w-full pl-13 pr-12 py-4 text-lg font-medium bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-white/5 pb-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-5 py-3 text-sm font-black uppercase tracking-wider transition-colors ${
                tab === t.id ? "text-white" : "text-white/35 hover:text-white/60"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className="ml-2 text-[9px] font-black text-white/25">{t.count}</span>
              )}
              {tab === t.id && (
                <motion.div
                  layoutId="search-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {tab === "anime" && (
            <motion.div key="anime" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {animeResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                  {animeResults.map((anime, i) => (
                    <motion.div
                      key={anime.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setModal(anime)}
                      className="group aspect-[2/3] relative cursor-pointer"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-b from-indigo-500/0 to-indigo-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative h-full w-full rounded-[1.4rem] overflow-hidden border border-white/5 group-hover:border-white/15 transition-colors">
                        <Image
                          src={anime.image}
                          alt={anime.title}
                          fill
                          className="object-cover brightness-75 group-hover:brightness-90 transition-all duration-500 scale-105 group-hover:scale-100"
                          sizes="200px"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
                          <p className="text-xs font-black text-white uppercase tracking-tight leading-tight line-clamp-2">
                            {anime.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Star size={10} fill="#f59e0b" className="text-amber-400" />
                            <span className="text-[10px] font-black text-white/70">{anime.rating.toFixed(1)}</span>
                            <span className="text-[9px] text-white/30">{anime.year}</span>
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
                  className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 hover:bg-white/[0.04] transition-all group cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg font-black shrink-0">
                    {u.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-white group-hover:text-indigo-300 transition-colors">{u.name}</p>
                    <p className="text-xs text-white/35 mt-0.5">{u.bio}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-white">{u.archived}</p>
                    <p className="text-[9px] text-white/25 uppercase tracking-wider">Archived</p>
                  </div>
                </motion.div>
              )) : <EmptyState query={query} tab="users" />}
            </motion.div>
          )}

          {tab === "posts" && (
            <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {query ? (
                <div className="space-y-3">
                  {["Why Frieren is the anime of the decade", "Gojo's Infinity — a physics breakdown", "Top 10 underrated gems of 2024", "Chainsaw Man season 2 predictions"].map((title, i) => (
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-all cursor-pointer"
                    >
                      <p className="font-bold text-white/80 hover:text-white">{title}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-white/25">
                        <span>Otaku_Arch</span>
                        <span>3h ago</span>
                        <span>142 likes</span>
                      </div>
                    </motion.div>
                  ))}
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
    <div className="py-20 text-center border border-dashed border-white/5 rounded-[3rem]">
      <Search size={28} className="mx-auto mb-3 text-white/15" />
      <p className="text-white/25 text-sm font-black uppercase tracking-widest">
        {query ? `No ${tab} matched "${query}"` : `Type something to search ${tab}`}
      </p>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020202]" />}>
      <div className="min-h-screen bg-[#020202] text-white">
        <SearchContent />
      </div>
    </Suspense>
  )
}
