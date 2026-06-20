"use client"

import React, { useState, useMemo, useCallback } from "react"
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

/* ── Advanced filter constants ── */
const DECADE_OPTIONS = [
  { label: "1960s", start: "1960-01-01", end: "1969-12-31" },
  { label: "1970s", start: "1970-01-01", end: "1979-12-31" },
  { label: "1980s", start: "1980-01-01", end: "1989-12-31" },
  { label: "1990s", start: "1990-01-01", end: "1999-12-31" },
  { label: "2000s", start: "2000-01-01", end: "2009-12-31" },
  { label: "2010s", start: "2010-01-01", end: "2019-12-31" },
  { label: "2020s", start: "2020-01-01", end: "2029-12-31" },
] as const

const SCORE_OPTIONS = [
  { label: "7+",   min: 7.0 },
  { label: "8+",   min: 8.0 },
  { label: "8.5+", min: 8.5 },
  { label: "9+",   min: 9.0 },
] as const

const STATUS_OPTIONS = ["Airing", "Finished", "Upcoming"] as const
const SEASON_OPTIONS = ["Winter", "Spring", "Summer", "Fall"] as const

type EpisodeRange = "short" | "medium" | "long" | "movie"
const EPISODE_OPTIONS: { label: string; key: EpisodeRange }[] = [
  { label: "Short (<12)",  key: "short" },
  { label: "Medium (12–26)", key: "medium" },
  { label: "Long (>26)",   key: "long" },
  { label: "Movies",       key: "movie" },
]

function episodeFilter(a: Anime, range: EpisodeRange): boolean {
  if (range === "movie") return a.type === "Movie"
  if (range === "short") return a.episodes !== undefined && a.episodes !== null && a.episodes > 0 && a.episodes < 12
  if (range === "medium") return a.episodes !== undefined && a.episodes !== null && a.episodes >= 12 && a.episodes <= 26
  if (range === "long") return a.episodes !== undefined && a.episodes !== null && a.episodes > 26
  return true
}

/* ── Pill filter button ── */
function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-9 items-center px-3.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap shrink-0 active:scale-95 ${
        active
          ? "bg-accent/20 border-accent/50 text-accent-bright"
          : "bg-surface border-border text-muted hover:border-border hover:text-muted"
      }`}
    >
      {children}
    </button>
  )
}

export default function BestAnimeListPage() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const [category, setCategory] = useState("all")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const LIMIT = 24

  // Advanced filter state
  const [selectedDecade, setSelectedDecade] = useState<typeof DECADE_OPTIONS[number]["label"] | "">("")
  const [selectedScore, setSelectedScore] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<typeof STATUS_OPTIONS[number] | "">("")
  const [selectedSeason, setSelectedSeason] = useState<typeof SEASON_OPTIONS[number] | "">("")
  const [selectedEpisodeRange, setSelectedEpisodeRange] = useState<EpisodeRange | "">("")

  // Reset to page 1 when filters change
  const handleCategoryChange = useCallback((c: string) => { setCategory(c); setPage(1) }, [])
  const handleQueryChange = useCallback((q: string) => { setQuery(q); setPage(1) }, [])
  const handleTypeChange = useCallback((t: string) => { setSelectedType(t); setPage(1) }, [])

  // Build API params — pass page so backend paginates Jikan directly
  const apiParams = useMemo(() => {
    const params: Parameters<typeof useBrowseAnime>[0] = { limit: LIMIT, page }
    if (query.trim()) params.q = query.trim()
    if (selectedType) params.type = selectedType
    // Category maps to API filters (handled server-side via Jikan)
    if (category === "new") params.type = params.type || "TV"
    // Decade filter → start_date / end_date
    if (selectedDecade) {
      const decade = DECADE_OPTIONS.find(d => d.label === selectedDecade)
      if (decade) { params.start_date = decade.start; params.end_date = decade.end }
    }
    // Status filter
    if (selectedStatus) params.status = selectedStatus.toLowerCase()
    return params
  }, [query, selectedType, category, page, selectedDecade, selectedStatus])

  const { data, isLoading, isError } = useBrowseAnime(apiParams)

  const totalPages = data?.meta?.pages ?? 1
  const totalAnime = data?.meta?.total ?? 0

  const allAnime: Anime[] = useMemo(() => {
    if (!data?.data) return []
    return data.data.map((a, i) => mapDTO(a, (page - 1) * LIMIT + i + 1))
  }, [data, page])

  // Client-side category sort (top-rated / new) on top of server results
  const filtered = useMemo(() => {
    let results = [...allAnime]
    if (category === "top-rated") results = results.filter(a => a.rating >= 8.0)
    if (category === "new") results = [...results].sort((a, b) => b.year - a.year || b.rating - a.rating)
    if (selectedGenres.length > 0) {
      results = results.filter(a =>
        selectedGenres.every(g => a.genres.some(ag => ag.toLowerCase().includes(g.toLowerCase())))
      )
    }
    // Client-side score filter
    if (selectedScore !== null) results = results.filter(a => a.rating >= selectedScore)
    // Client-side episode range filter
    if (selectedEpisodeRange) results = results.filter(a => episodeFilter(a, selectedEpisodeRange))
    return results
  }, [allAnime, category, selectedGenres, selectedScore, selectedEpisodeRange])

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
    setSelectedDecade("")
    setSelectedScore(null)
    setSelectedStatus("")
    setSelectedSeason("")
    setSelectedEpisodeRange("")
  }, [])

  const advancedFilterCount = (selectedDecade ? 1 : 0) + (selectedScore !== null ? 1 : 0) +
    (selectedStatus ? 1 : 0) + (selectedSeason ? 1 : 0) + (selectedEpisodeRange ? 1 : 0)
  const activeFilterCount = selectedGenres.length + (selectedType ? 1 : 0) + advancedFilterCount

  return (
    <div className="min-h-screen bg-background pb-40">
      <BestAnimeListHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 mb-4 py-4 border-b border-border lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4">
          <CategoryTabs active={category} onChange={handleCategoryChange} />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative group flex-1 lg:flex-initial">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle group-focus-within:text-accent-bright transition-colors" />
              <input value={query} onChange={e => handleQueryChange(e.target.value)}
                placeholder="Search anime…"
                className="h-11 w-full pl-10 pr-9 bg-surface border border-border rounded-full text-base sm:text-sm font-medium text-foreground placeholder:text-muted outline-none focus:border-accent/50 transition-all duration-300 lg:w-48 lg:focus:w-64" />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-subtle hover:text-foreground active:scale-90 transition-all">
                  <X size={14} />
                </button>
              )}
            </div>
            <button onClick={() => setFilterOpen(true)}
              className="flex h-11 items-center gap-2 px-5 bg-surface border border-border rounded-full text-[10px] font-black text-foreground uppercase tracking-widest active:scale-95 transition-all relative shrink-0">
              <ListFilter size={14} className="text-accent" />
              Refine
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[8px] font-black text-black flex items-center justify-center" style={{background:"linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))"}}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Advanced filter chips — horizontally scrollable on phones */}
        <div className="flex items-center gap-2 mb-8 pb-4 border-b border-border overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 lg:flex-wrap lg:overflow-visible">
          {/* Decade */}
          <span className="text-[9px] font-black text-subtle uppercase tracking-widest mr-1 shrink-0">Era</span>
          {DECADE_OPTIONS.map(d => (
            <FilterPill key={d.label} active={selectedDecade === d.label}
              onClick={() => { setSelectedDecade(prev => prev === d.label ? "" : d.label); setPage(1) }}>
              {d.label}
            </FilterPill>
          ))}

          <div className="w-px h-4 bg-border mx-1 shrink-0" />

          {/* Score */}
          <span className="text-[9px] font-black text-subtle uppercase tracking-widest mr-1 shrink-0">Score</span>
          {SCORE_OPTIONS.map(s => (
            <FilterPill key={s.label} active={selectedScore === s.min}
              onClick={() => { setSelectedScore(prev => prev === s.min ? null : s.min) }}>
              {s.label}
            </FilterPill>
          ))}

          <div className="w-px h-4 bg-border mx-1 shrink-0" />

          {/* Status */}
          <span className="text-[9px] font-black text-subtle uppercase tracking-widest mr-1 shrink-0">Status</span>
          {STATUS_OPTIONS.map(st => (
            <FilterPill key={st} active={selectedStatus === st}
              onClick={() => { setSelectedStatus(prev => prev === st ? "" : st); setPage(1) }}>
              {st}
            </FilterPill>
          ))}

          <div className="w-px h-4 bg-border mx-1 shrink-0" />

          {/* Season */}
          <span className="text-[9px] font-black text-subtle uppercase tracking-widest mr-1 shrink-0">Season</span>
          {SEASON_OPTIONS.map(s => (
            <FilterPill key={s} active={selectedSeason === s}
              onClick={() => { setSelectedSeason(prev => prev === s ? "" : s) }}>
              {s}
            </FilterPill>
          ))}

          <div className="w-px h-4 bg-border mx-1 shrink-0" />

          {/* Episodes */}
          <span className="text-[9px] font-black text-subtle uppercase tracking-widest mr-1 shrink-0">Eps</span>
          {EPISODE_OPTIONS.map(e => (
            <FilterPill key={e.key} active={selectedEpisodeRange === e.key}
              onClick={() => { setSelectedEpisodeRange(prev => prev === e.key ? "" : e.key) }}>
              {e.label}
            </FilterPill>
          ))}

          {advancedFilterCount > 0 && (
            <>
              <div className="w-px h-4 bg-border mx-1 shrink-0" />
              <button onClick={handleReset}
                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all">
                Clear all
              </button>
            </>
          )}
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
            <p className="text-subtle font-black uppercase tracking-widest text-xs mb-4">Failed to load archives</p>
            <button onClick={handleReset} className="text-xs text-accent-bright hover:text-foreground font-black uppercase tracking-widest">
              Try again
            </button>
          </div>
        )}

        {/* Result info */}
        {!isLoading && !isError && (query || activeFilterCount > 0) && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-black text-subtle uppercase tracking-widest">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
            <button onClick={handleReset} className="text-[10px] font-black text-accent-bright hover:text-foreground uppercase tracking-widest">
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
            className="py-32 text-center border border-dashed border-border rounded-[3rem]">
            <p className="text-subtle font-black uppercase tracking-widest text-xs">No archives match your query</p>
            <button onClick={handleReset} className="mt-6 text-xs text-accent-bright hover:text-foreground font-black uppercase tracking-widest">Clear filters</button>
          </motion.div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────── */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8 pb-4 flex-wrap">
            {/* Prev */}
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-black text-muted hover:text-foreground hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
            >
              ← Prev
            </button>

            {/* Page numbers */}
            {(() => {
              const nums: (number | "...")[] = []
              const delta = 2
              for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
                  nums.push(i)
                } else if (nums[nums.length - 1] !== "...") {
                  nums.push("...")
                }
              }
              return nums.map((n, idx) =>
                n === "..." ? (
                  <span key={`dots-${idx}`} className="text-subtle px-1 text-xs">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => { setPage(n as number); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                      page === n
                        ? "bg-accent text-black shadow-[0_0_16px_color-mix(in srgb, var(--app-accent) 40%, transparent)]"
                        : "bg-surface border border-border text-muted hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    {n}
                  </button>
                )
              )
            })()}

            {/* Next */}
            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-black text-muted hover:text-foreground hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
            >
              Next →
            </button>

            {/* Total count */}
            <span className="w-full text-center text-[10px] text-subtle font-black uppercase tracking-widest mt-2">
              Page {page} of {totalPages.toLocaleString()} — {totalAnime.toLocaleString()} anime total
            </span>
          </div>
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
