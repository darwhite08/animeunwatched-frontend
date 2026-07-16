"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { Search, BookOpen, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import * as ep from "@/lib/api/endpoints"
import { ui } from "@/lib/design/tokens"
import type { MangaDTO } from "@/lib/api/types"

const DEMOGRAPHICS = ["Shounen", "Shoujo", "Seinen", "Josei"]
const STATUSES = ["Publishing", "Finished", "On Hiatus"]
// Curated genre chips shown up front (incl. the specifically requested BL);
// the full list comes from /manga/genres.
const FEATURED_GENRES = ["Action", "Romance", "Fantasy", "Comedy", "Drama", "Horror", "Boys Love", "Girls Love", "Slice of Life", "Sports"]

export default function MangaBrowsePage() {
  // useSearchParams requires a Suspense boundary during prerender.
  return (
    <Suspense fallback={null}>
      <MangaBrowse />
    </Suspense>
  )
}

function MangaBrowse() {
  const searchParams = useSearchParams()
  const [q, setQ] = useState("")
  const [genre, setGenre] = useState<string | null>(searchParams.get("genre"))
  const [demographic, setDemographic] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const searching = q.trim().length >= 2

  // Fuzzy catalog search (typo/romaji/synonym tolerant) when typing;
  // filtered browse otherwise.
  const { data: searchData, isFetching: searchFetching } = useQuery({
    queryKey: ["manga/search", q.trim()],
    queryFn: () => ep.searchMangaCatalog(q.trim()),
    enabled: searching,
    staleTime: 60_000,
  })

  const browseParams = useMemo(() => ({
    ...(genre ? { genre } : {}),
    ...(demographic ? { demographic } : {}),
    ...(status ? { status } : {}),
    page,
    limit: 24,
  }), [genre, demographic, status, page])

  const { data: browseData, isLoading: browseLoading } = useQuery({
    queryKey: ["manga/browse", browseParams],
    queryFn: () => ep.browseManga(browseParams),
    enabled: !searching,
    placeholderData: keepPreviousData,
  })

  const items: MangaDTO[] = searching ? (searchData?.data ?? []) : (browseData?.data ?? [])
  const pages = searching ? 1 : (browseData?.meta?.pages ?? 1)
  const loading = searching ? searchFetching : browseLoading

  const setFilter = (kind: "genre" | "demographic" | "status", value: string) => {
    setPage(1)
    if (kind === "genre") setGenre(v => (v === value ? null : value))
    if (kind === "demographic") setDemographic(v => (v === value ? null : value))
    if (kind === "status") setStatus(v => (v === value ? null : value))
  }

  return (
    <div className={`max-w-[1440px] mx-auto ${ui.screenX} py-8 sm:py-12 space-y-8 pb-32`}>
      {/* HEADER */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-3">
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-accent-bright font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[10px]">
            The Stacks{!searching && browseData?.meta?.total ? ` • ${browseData.meta.total.toLocaleString()} titles` : ""}
          </motion.p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-foreground leading-none">
            Manga<span className="text-accent">.</span>
          </h1>
        </div>

        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle group-focus-within:text-accent-bright transition-colors" size={18} />
          <input type="text" placeholder="Search manga — typos welcome…" value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full pl-11 pr-10 min-h-11 py-3 rounded-2xl bg-surface border border-border text-foreground text-base sm:text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 transition-all" />
          {searchFetching && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-accent" />}
        </div>
      </header>

      {/* FILTER CHIPS (hidden while searching) */}
      {!searching && (
        <div className="space-y-3">
          <FilterRow label="Genre"
            options={genre && !FEATURED_GENRES.includes(genre) ? [genre, ...FEATURED_GENRES] : FEATURED_GENRES}
            active={genre} onPick={v => setFilter("genre", v)} />
          <FilterRow label="Demographic" options={DEMOGRAPHICS} active={demographic} onPick={v => setFilter("demographic", v)} />
          <FilterRow label="Status" options={STATUSES} active={status} onPick={v => setFilter("status", v)} />
        </div>
      )}

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-surface/40 aspect-[2/3] animate-pulse" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-5">
          {items.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.4) }}>
              <Link href={`/manga/${m.malId}`}
                className="group block rounded-2xl border border-border bg-background overflow-hidden hover:border-white/30 active:scale-[0.98] transition-all">
                <div className="relative aspect-[2/3] bg-surface overflow-hidden">
                  {m.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={m.imageUrl} alt={m.title} referrerPolicy="no-referrer" loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-subtle"><BookOpen size={28} /></div>
                  )}
                  {m.score != null && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-[10px] font-black text-accent-bright tabular-nums">
                      ★ {m.score.toFixed(1)}
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-0.5">
                  <p className="text-xs font-black text-foreground leading-tight line-clamp-2">{m.titleEnglish || m.title}</p>
                  <p className="text-[9px] text-subtle uppercase tracking-widest truncate">
                    {[m.type, m.demographic, m.chapters ? `${m.chapters} ch` : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-border rounded-3xl bg-white/[0.01]">
          <div className="h-14 w-14 rounded-2xl bg-surface border border-border grid place-items-center mb-5 text-accent-bright">
            <BookOpen size={24} />
          </div>
          <p className="max-w-xs text-subtle font-black uppercase tracking-[0.25em] text-[11px] italic leading-relaxed">
            {searching ? `Nothing matched "${q.trim()}" — even fuzzily.` : "No manga match these filters yet — the catalog is still filling."}
          </p>
          {searching && (
            <button
              onClick={async () => { try { await ep.requestMangaTitle(q.trim()) } catch { /* best-effort */ } }}
              className={`mt-6 inline-flex items-center gap-2 px-5 ${ui.touch} rounded-2xl bg-accent text-black font-black text-[11px] uppercase tracking-widest active:scale-95 transition-transform`}>
              Request this title
            </button>
          )}
        </div>
      )}

      {/* PAGINATION */}
      {!searching && pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} aria-label="Previous page"
            className="h-11 w-11 rounded-xl bg-surface border border-border grid place-items-center text-muted hover:text-foreground disabled:opacity-40 active:scale-95 transition-all">
            <ChevronLeft size={16} />
          </button>
          <span className="text-[11px] font-black uppercase tracking-widest text-subtle tabular-nums">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} aria-label="Next page"
            className="h-11 w-11 rounded-xl bg-surface border border-border grid place-items-center text-muted hover:text-foreground disabled:opacity-40 active:scale-95 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

function FilterRow({ label, options, active, onPick }: {
  label: string; options: string[]; active: string | null; onPick: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide">
      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle shrink-0 w-24">{label}</span>
      {options.map(opt => (
        <button key={opt} onClick={() => onPick(opt)}
          className={`px-4 min-h-9 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap active:scale-95 transition-all ${
            active === opt ? "bg-accent text-black" : "bg-surface text-muted hover:text-foreground border border-border"
          }`}>
          {opt}
        </button>
      ))}
    </div>
  )
}
