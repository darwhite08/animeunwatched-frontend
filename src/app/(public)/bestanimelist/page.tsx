"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import BestAnimeListHeader from "@/components/bestanimelist/BestAnimeListHeader"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import CategoryTabs from "@/components/bestanimelist/CategoryTabs"
import FilterDrawer from "@/components/bestanimelist/FilterDrawer"
import { ListFilter, Search, X, Loader2 } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"

/* Map API AnimeDTO → local Anime type that UI components expect */
function mapDTO(a: AnimeDTO, rank: number): Anime {
  const status: "finished" | "airing" = a.status?.toLowerCase().includes("airing") ? "airing" : "finished"
  const type = (["TV", "Movie", "OVA"] as const).includes(a.type as "TV" | "Movie" | "OVA")
    ? (a.type as "TV" | "Movie" | "OVA")
    : "TV"
  return {
    id: String(a.malId),
    title: a.title,
    titleJapanese: a.titleJapanese ?? "",
    rating: a.score ?? 0,
    year: a.year ?? 0,
    episodes: a.episodes,
    type,
    status,
    studio: a.studios[0] ?? "Unknown",
    genres: a.genres,
    synopsis: a.synopsis ?? "",
    image: a.imageUrl ?? "/assets/png/tanjiro.png",
    tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")),
    category: "all",
    rank,
  }
}

export default function BestAnimeListPage() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const [category, setCategory] = useState("all")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState("")
  const [query, setQuery] = useState("")

  // Build API params
  const apiParams = useMemo(() => {
    const params: Parameters<typeof useBrowseAnime>[0] = { limit: 50 }
    if (query.trim()) params.q = query.trim()
    if (selectedType) params.type = selectedType
    return params
  }, [query, selectedType])

  const { data, isLoading, isError } = useBrowseAnime(apiParams)

  const allAnime: Anime[] = useMemo(() => {
    if (!data?.data) return []
    return data.data.map((a, i) => mapDTO(a, i + 1))
  }, [data])

  // Client-side genre + category filter
  const filtered = useMemo(() => {
    let results = allAnime
    if (category !== "all") {
      if (category === "airing") results = results.filter(a => a.status === "airing")
      else if (category === "movie") results = results.filter(a => a.type === "Movie")
      else if (category === "top-rated") results = results.filter(a => a.rating >= 8.5)
    }
    if (selectedGenres.length > 0) {
      results = results.filter(a =>
        selectedGenres.every(g => a.genres.some(ag => ag.toLowerCase().includes(g.toLowerCase())))
      )
    }
    return results
  }, [allAnime, category, selectedGenres])

  const handleGenreToggle = useCallback((id: string) => {
    const labelMap: Record<string, string> = {
      action: "Action", psychological: "Psychological", seinen: "Seinen",
      shonen: "Shonen", thriller: "Thriller", drama: "Drama", fantasy: "Fantasy",
    }
    const label = labelMap[id] ?? id
    setSelectedGenres(prev => prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label])
  }, [])

  const handleTypeToggle = useCallback((id: string) => {
    const typeMap: Record<string, string> = { tv: "TV", movie: "Movie", ova: "OVA" }
    const type = typeMap[id] ?? id
    setSelectedType(prev => prev === type ? "" : type)
  }, [])

  const handleReset = useCallback(() => {
    setSelectedGenres([])
    setSelectedType("")
    setCategory("all")
    setQuery("")
  }, [])

  const activeFilterCount = selectedGenres.length + (selectedType ? 1 : 0)

  return (
    <div className="min-h-screen bg-[#020202] pb-40">
      <BestAnimeListHeader />

      <div className="max-w-7xl mx-auto px-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 py-4 border-b border-white/5">
          <CategoryTabs active={category} onChange={setCategory} />
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search anime…"
                className="pl-8 pr-8 py-2 bg-white/5 border border-white/10 rounded-full text-[11px] font-medium text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 w-44 focus:w-64 transition-all duration-300" />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={11} className="text-white/30 hover:text-white" />
                </button>
              )}
            </div>
            <button onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all relative">
              <ListFilter size={13} className="text-indigo-500" />
              Refine
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-[8px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-[1.8rem] bg-white/[0.04] animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="py-32 text-center">
            <p className="text-white/30 font-black uppercase tracking-widest text-xs mb-4">Failed to load archives</p>
            <button onClick={handleReset} className="text-xs text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-widest">
              Try again
            </button>
          </div>
        )}

        {/* Result info */}
        {!isLoading && !isError && (query || activeFilterCount > 0) && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
            <button onClick={handleReset} className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">
              Clear all
            </button>
          </motion.div>
        )}

        {/* Grid */}
        {!isLoading && !isError && filtered.length > 0 && (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((anime, i) => (
                <AnimeCard key={anime.id} anime={anime} index={i} onClick={setSelectedAnime} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty */}
        {!isLoading && !isError && filtered.length === 0 && allAnime.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-32 text-center border border-dashed border-white/5 rounded-[3rem]">
            <p className="text-white/20 font-black uppercase tracking-widest text-xs">No archives match your query</p>
            <button onClick={handleReset} className="mt-6 text-xs text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-widest">Clear filters</button>
          </motion.div>
        )}
      </div>

      <FilterDrawer isOpen={filterOpen} onClose={() => setFilterOpen(false)}
        selectedGenres={selectedGenres} onGenreToggle={handleGenreToggle}
        selectedType={selectedType} onTypeToggle={handleTypeToggle}
        onReset={handleReset} resultCount={filtered.length} />

      <AnimeModal isOpen={selectedAnime !== null} onClose={() => setSelectedAnime(null)} anime={selectedAnime} />
    </div>
  )
}
