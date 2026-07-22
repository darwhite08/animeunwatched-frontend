"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Search, ArrowRight, Star, Pencil, Play, X, Bookmark, Sparkles } from "lucide-react"
import { discoverAI } from "@/lib/api/endpoints"
import { useWatchlist } from "@/stores/watchlist.store"
import { useToast } from "@/stores/toast.store"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

/* ── Static copy ── */
const SUGGESTIONS = [
  "Overpowered MC who hides their strength",
  "Dark psychological thriller under 24 eps",
  "Romance with a devastating ending",
  "Underrated hidden gems from the 2000s",
  "Like Demon Slayer but darker",
]

const MODES = [
  { key: "mood",   label: "Mood-based",     hint: "Focus on mood and emotional tone." },
  { key: "genre",  label: "Genre matching", hint: "Prioritize strong genre fit." },
  { key: "gems",   label: "Hidden gems",    hint: "Prefer underrated, lesser-known titles." },
  { key: "studio", label: "Studio",         hint: "Weigh studio and production quality." },
  { key: "era",    label: "Era",            hint: "Consider era and time period." },
] as const
type ModeKey = typeof MODES[number]["key"]

/* ── Result shape ── */
type Item = {
  malId: number
  title: string
  image: string | null
  score: number | null
  year: number | null
  episodes: number | null
  studio: string
  genres: string[]
  reason?: string
  synopsis: string
  matchPct: number
  youtubeId: string | null
}

function toItem(a: AnimeDTO, match: number, reason?: string): Item {
  return {
    malId: a.malId,
    title: a.titleEnglish || a.title,
    image: a.imageUrl,
    score: a.score,
    year: a.year,
    episodes: a.episodes,
    studio: a.studios[0] ?? "Unknown",
    genres: a.genres,
    reason,
    synopsis: a.synopsis ?? "",
    matchPct: match,
    youtubeId: a.trailerYoutubeId,
  }
}

/* Map an Item → the local Anime type the watchlist store expects. */
function itemToAnime(it: Item): Anime {
  return {
    id: String(it.malId), title: it.title, titleJapanese: "",
    rating: it.score ?? 0, year: it.year ?? 0, episodes: it.episodes,
    type: "TV", status: "finished", studio: it.studio, genres: it.genres,
    synopsis: it.synopsis, image: it.image ?? "", tags: it.genres.map(g => g.toLowerCase().replace(/\s/g, "-")),
    category: "all", rank: 0,
  }
}

export default function AIDiscoverPage() {
  const [query, setQuery] = useState("")
  const [submitted, setSubmitted] = useState("")
  const [searchHint, setSearchHint] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [focused, setFocused] = useState(false)
  const [modes, setModes] = useState<Record<ModeKey, boolean>>({ mood: true, genre: false, gems: false, studio: false, era: false })
  const [sortBy, setSortBy] = useState<"match" | "score" | "year">("match")
  const [genreFilter, setGenreFilter] = useState("All")
  const [trailer, setTrailer] = useState<Item | null>(null)

  const { add, remove, has } = useWatchlist()
  const { push } = useToast()

  const { data, isFetching } = useQuery({
    queryKey: ["discovery/ai", submitted, searchHint],
    queryFn: () => discoverAI(searchHint ? `${submitted} (${searchHint})` : submitted, 24),
    enabled: hasSearched && submitted.length >= 3,
    staleTime: 5 * 60_000,
  })

  const runSearch = (raw?: string) => {
    const q = (raw ?? query).trim()
    if (q.length < 3) return
    const hint = MODES.filter(m => modes[m.key]).map(m => m.hint).join(" ")
    setSubmitted(q)
    setSearchHint(hint)
    setGenreFilter("All")
    setHasSearched(true)
  }

  const view: "search" | "loading" | "results" =
    !hasSearched ? "search" : isFetching ? "loading" : data ? "results" : "loading"

  const items = useMemo<Item[]>(
    () => (data?.data ?? []).map(r => toItem(r.anime, r.match, r.reason)),
    [data],
  )

  const genreList = useMemo(() => {
    const set = new Set<string>()
    items.forEach(it => it.genres.forEach(g => set.add(g)))
    return ["All", ...Array.from(set).slice(0, 8)]
  }, [items])

  const sorted = useMemo(() => {
    const f = items.filter(it => genreFilter === "All" || it.genres.includes(genreFilter))
    return [...f].sort((a, b) =>
      sortBy === "score" ? (b.score ?? 0) - (a.score ?? 0)
      : sortBy === "year" ? (b.year ?? 0) - (a.year ?? 0)
      : b.matchPct - a.matchPct,
    )
  }, [items, genreFilter, sortBy])

  const top = sorted[0]
  const rest = sorted.slice(1)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{`
        @keyframes slideSeg{0%{transform:translateX(-105%)}100%{transform:translateX(360%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>
      {view === "search" && (
        <SearchView
          query={query} setQuery={setQuery}
          focused={focused} setFocused={setFocused}
          modes={modes} setModes={setModes}
          onDiscover={() => runSearch()} onSuggest={(t) => { setQuery(t); runSearch(t) }}
        />
      )}

      {view === "loading" && <LoadingView query={submitted} />}

      {view === "results" && (
        <div className="mx-auto max-w-[1200px] px-5 sm:px-11 pb-28 pt-9 animate-[fadeUp_.45s_ease_both]">
          {/* Header */}
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">Results</div>
              <h2 className="text-4xl font-black leading-none tracking-tight text-foreground">
                Matches<span className="text-accent">.</span>
              </h2>
            </div>
            <div className="text-right text-[13px] text-subtle">
              <span className="font-semibold text-foreground">{sorted.length}</span> titles
            </div>
          </div>

          {/* Refine bar + sort */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => { setQuery(submitted); setFocused(true); setHasSearched(false) }}
              className="inline-flex h-11 max-w-[440px] items-center gap-2.5 rounded-xl border border-border bg-surface pl-4 pr-2 text-sm text-foreground hover:border-white/20 transition-colors"
            >
              <Search size={15} className="shrink-0 text-subtle" />
              <span className="truncate">{submitted}</span>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-muted"><Pencil size={13} /></span>
            </button>
            <button
              onClick={() => { setHasSearched(false); setQuery("") }}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-transparent px-4 text-[13.5px] font-semibold text-muted hover:text-foreground hover:border-white/20 transition-colors"
            >
              New search
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-subtle">Sort</span>
              <div className="flex gap-0.5 rounded-[10px] border border-border bg-white/[0.04] p-[3px]">
                {([["match", "Best match"], ["score", "Rating"], ["year", "Newest"]] as const).map(([k, label]) => (
                  <button key={k} onClick={() => setSortBy(k)}
                    className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                      sortBy === k ? "bg-white/10 text-foreground" : "text-subtle hover:text-foreground"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Genre chips */}
          {genreList.length > 1 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {genreList.map(g => (
                <button key={g} onClick={() => setGenreFilter(g)}
                  className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-all ${
                    genreFilter === g
                      ? "border-accent/40 bg-accent/[0.12] text-accent-bright"
                      : "border-border bg-transparent text-muted hover:text-foreground hover:border-white/20"
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          )}

          {/* Top match */}
          {top && (
            <div className="mt-7 grid gap-7 rounded-[18px] border border-border bg-surface p-5 sm:grid-cols-[260px_1fr]">
              <Link href={`/anime/${top.malId}`} className="relative block aspect-[3/4] overflow-hidden rounded-[13px] border border-border max-sm:max-w-[240px]">
                {top.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={top.image} alt={top.title} className="absolute inset-0 h-full w-full object-cover" />
                ) : <div className="absolute inset-0 grid place-items-center text-subtle"><Sparkles size={28} /></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute left-3 top-3 rounded-lg border border-accent/40 bg-accent/[0.16] px-2.5 py-1.5 text-[12px] font-bold text-accent-bright backdrop-blur">
                  {top.matchPct}% match
                </span>
              </Link>
              <div className="flex min-w-0 flex-col">
                <span className="mb-3 self-start rounded-md bg-accent/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-accent">Top match</span>
                <h3 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-foreground">{top.title}</h3>
                <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-[13px] text-muted">
                  {top.score != null && <span className="inline-flex items-center gap-1 font-semibold text-foreground"><Star size={13} className="fill-accent text-accent" />{top.score.toFixed(1)}</span>}
                  {top.year && <><Dot /><span>{top.year}</span></>}
                  {top.episodes && <><Dot /><span>{top.episodes} episodes</span></>}
                  {top.studio !== "Unknown" && <><Dot /><span>{top.studio}</span></>}
                </div>
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {top.genres.slice(0, 4).map(g => (
                    <span key={g} className="rounded-full border border-border bg-white/[0.05] px-2.5 py-1 text-[12px] text-muted">{g}</span>
                  ))}
                </div>
                {top.reason && (
                  <div className="mt-4 rounded-[11px] border border-accent/[0.16] bg-accent/[0.06] px-4 py-3">
                    <div className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-accent">Why it matched</div>
                    <div className="text-[14.5px] leading-snug text-foreground/90">{top.reason}</div>
                  </div>
                )}
                {top.synopsis && <p className="mt-3.5 line-clamp-4 text-[14.5px] leading-relaxed text-muted">{top.synopsis}</p>}
                <div className="flex-1 min-h-4" />
                <div className="flex flex-wrap gap-2.5">
                  <SaveButton size="lg" saved={has(String(top.malId))} onClick={() => toggleSave(top)} />
                  {top.youtubeId ? (
                    <button onClick={() => setTrailer(top)} className="inline-flex h-11 items-center gap-2 rounded-[11px] border border-white/[0.12] bg-white/[0.05] px-5 text-sm font-semibold text-foreground hover:bg-white/[0.09] transition-colors">
                      <Play size={14} className="fill-current" /> Watch trailer
                    </button>
                  ) : null}
                  <Link href={`/anime/${top.malId}`} className="inline-flex h-11 items-center rounded-[11px] border border-white/[0.12] px-5 text-sm font-semibold text-muted hover:text-foreground hover:border-white/25 transition-colors">Details</Link>
                </div>
              </div>
            </div>
          )}

          {/* More matches */}
          {rest.length > 0 && (
            <>
              <div className="mt-9 flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle">More matches</div>
                <div className="text-[12.5px] text-subtle max-sm:hidden">Hover a poster for details</div>
              </div>
              <div className="mt-4 grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>
                {rest.map(it => (
                  <MatchCard key={it.malId} it={it} saved={has(String(it.malId))} onSave={() => toggleSave(it)} onWatch={() => it.youtubeId && setTrailer(it)} />
                ))}
              </div>
            </>
          )}

          {sorted.length === 0 && (
            <div className="mt-16 rounded-[24px] border border-dashed border-border py-24 text-center">
              <Sparkles size={30} className="mx-auto mb-4 text-subtle" />
              <p className="text-sm font-semibold text-subtle">No matches in our catalog for this filter — try a different genre or a new search.</p>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-11 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-border bg-surface px-7 py-6">
            <div className="min-w-0">
              <div className="text-lg font-bold tracking-tight text-foreground">Not quite what you pictured?</div>
              <div className="mt-1 text-sm text-muted">Add a mood, a decade or a studio and let the engine re-rank your matches.</div>
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => { setQuery(submitted); setFocused(true); setHasSearched(false) }} className="inline-flex h-11 items-center gap-2 rounded-[11px] bg-accent px-5 text-[13.5px] font-bold text-black hover:brightness-105 transition-all">
                <Pencil size={14} /> Refine search
              </button>
              <button onClick={() => { setHasSearched(false); setQuery("") }} className="inline-flex h-11 items-center rounded-[11px] border border-white/[0.14] px-5 text-[13.5px] font-semibold text-muted hover:text-foreground hover:border-white/25 transition-colors">Start over</button>
            </div>
          </div>
        </div>
      )}

      {trailer?.youtubeId && <TrailerModal title={trailer.title} youtubeId={trailer.youtubeId} malId={trailer.malId} onClose={() => setTrailer(null)} />}
    </div>
  )

  function toggleSave(it: Item) {
    if (has(String(it.malId))) { remove(String(it.malId)); push(`Removed "${it.title}"`, "info") }
    else { add(itemToAnime(it)); push(`Added "${it.title}" to your list`, "success") }
  }
}

/* ── Dot separator ── */
function Dot() { return <span className="h-[3px] w-[3px] rounded-full bg-white/25" /> }

/* ── Save button ── */
function SaveButton({ saved, onClick, size }: { saved: boolean; onClick: () => void; size: "sm" | "lg" }) {
  const lg = size === "lg"
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick() }}
      className={`pointer-events-auto inline-flex items-center justify-center gap-2 font-bold transition-all ${lg ? "h-11 rounded-[11px] px-5 text-sm" : "h-9 flex-1 rounded-[9px] px-3 text-[12.5px]"} ${
        saved
          ? "border border-accent/40 bg-accent/[0.12] text-accent-bright"
          : "bg-accent text-black hover:brightness-105"
      }`}
    >
      <Bookmark size={lg ? 15 : 13} className={saved ? "fill-current" : ""} /> {saved ? (lg ? "Saved to list" : "Saved") : (lg ? "Add to list" : "Save")}
    </button>
  )
}

/* ── Match grid card ── */
function MatchCard({ it, saved, onSave, onWatch }: { it: Item; saved: boolean; onSave: () => void; onWatch: () => void }) {
  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-[14px] border border-border bg-surface-2 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/35 hover:shadow-[0_26px_50px_-26px_rgba(0,0,0,0.9)]">
      <Link href={`/anime/${it.malId}`} className="absolute inset-0">
        {it.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={it.image} alt={it.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        ) : <div className="absolute inset-0 grid place-items-center text-subtle"><Sparkles size={24} /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/[0.94] via-black/30 to-transparent" />
      </Link>
      <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-md border border-accent/[0.38] bg-accent/[0.16] px-2 py-1 text-[11px] font-bold text-accent-bright backdrop-blur">{it.matchPct}%</span>
      {it.score != null && (
        <span className="pointer-events-none absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-md border border-white/[0.12] bg-black/60 px-1.5 py-1 text-[11.5px] font-bold text-foreground backdrop-blur">
          <Star size={10} className="fill-accent text-accent" />{it.score.toFixed(1)}
        </span>
      )}
      {/* Base label */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3.5 transition-opacity group-hover:opacity-0">
        <h4 className="line-clamp-2 text-[16px] font-black leading-tight text-foreground">{it.title}</h4>
        <div className="mt-1 text-[12px] text-muted">{[it.year, it.episodes ? `${it.episodes} eps` : null].filter(Boolean).join(" · ")}</div>
      </div>
      {/* Hover overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/[0.97] via-black/[0.88] to-black/40 p-3.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <h4 className="truncate text-[16px] font-black leading-tight text-foreground">{it.title}</h4>
        <div className="mt-1 text-[11.5px] text-subtle">{[it.year, it.episodes ? `${it.episodes} eps` : null].filter(Boolean).join(" · ")}</div>
        {it.reason && (
          <div className="mt-2.5 line-clamp-2 rounded-[9px] border border-accent/[0.18] bg-accent/[0.08] px-2.5 py-2 text-[12px] leading-snug text-foreground/90">{it.reason}</div>
        )}
        <div className="mt-3 flex gap-2">
          <SaveButton size="sm" saved={saved} onClick={onSave} />
          {it.youtubeId ? (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWatch() }} className="pointer-events-auto inline-flex h-9 items-center justify-center gap-1.5 rounded-[9px] border border-white/[0.16] px-3 text-[12.5px] font-semibold text-foreground/80 hover:text-foreground hover:border-white/30 transition-colors">
              <Play size={12} className="fill-current" /> Watch
            </button>
          ) : (
            <Link href={`/anime/${it.malId}`} className="pointer-events-auto inline-flex h-9 items-center justify-center rounded-[9px] border border-white/[0.16] px-3 text-[12.5px] font-semibold text-foreground/80 hover:text-foreground hover:border-white/30 transition-colors">Details</Link>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Search (hero) view ── */
function SearchView({ query, setQuery, focused, setFocused, modes, setModes, onDiscover, onSuggest }: {
  query: string; setQuery: (v: string) => void
  focused: boolean; setFocused: (v: boolean) => void
  modes: Record<ModeKey, boolean>; setModes: React.Dispatch<React.SetStateAction<Record<ModeKey, boolean>>>
  onDiscover: () => void; onSuggest: (t: string) => void
}) {
  return (
    <div className="mx-auto flex max-w-[760px] flex-col items-center px-6 pb-24 pt-20 sm:pt-24">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.04] px-3 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="text-[11.5px] font-semibold tracking-wide text-muted">AI Discovery · Kaiveron</span>
      </div>
      <h1 className="mt-6 text-center text-5xl font-black leading-[1.02] tracking-tight text-foreground sm:text-6xl">
        Find your next obsession<span className="text-accent">.</span>
      </h1>
      <p className="mt-5 max-w-[500px] text-center text-[17px] leading-relaxed text-muted text-pretty">
        Describe a mood, a plot, a pace — anything. Our AI reads across 30,000+ titles and returns the ones that actually fit.
      </p>

      <div
        className="mt-9 flex w-full items-center gap-3 rounded-2xl border bg-surface py-[7px] pl-[18px] pr-[7px] transition-colors"
        style={{ borderColor: focused ? "color-mix(in srgb, var(--app-accent) 50%, transparent)" : "var(--border, rgba(255,255,255,.1))" }}
      >
        <Search size={20} className="shrink-0 text-subtle" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => { if (e.key === "Enter") onDiscover() }}
          placeholder="Describe the anime you're craving…"
          autoFocus
          className="h-[52px] min-w-0 flex-1 border-none bg-transparent text-[17.5px] font-medium text-foreground outline-none placeholder:text-subtle"
        />
        <button onClick={onDiscover} className="inline-flex h-[52px] shrink-0 items-center gap-2 rounded-[11px] bg-accent px-5 text-[15px] font-bold text-black hover:brightness-105 transition-all">
          Discover <ArrowRight size={16} />
        </button>
      </div>

      <div className="mt-[22px] flex w-full flex-wrap justify-center gap-2.5">
        {SUGGESTIONS.map(text => (
          <button key={text} onClick={() => onSuggest(text)}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-white/[0.03] px-3.5 py-2 text-[13px] font-medium text-muted hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground transition-all">
            {text}
          </button>
        ))}
      </div>

      <div className="mt-10 flex w-full flex-wrap items-center justify-center gap-3.5 border-t border-border pt-6">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle">Search focus</span>
        <div className="flex flex-wrap justify-center gap-2">
          {MODES.map(m => {
            const active = modes[m.key]
            return (
              <button key={m.key} onClick={() => setModes(s => ({ ...s, [m.key]: !s[m.key] }))}
                className={`rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-all ${
                  active ? "border-accent/40 bg-accent/[0.12] text-accent-bright" : "border-border bg-transparent text-muted hover:text-foreground hover:border-white/20"
                }`}>
                {m.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Loading view ── */
function LoadingView({ query }: { query: string }) {
  return (
    <div className="flex min-h-[72vh] flex-col items-center justify-center px-10 py-10 text-center animate-[fadeIn_.3s_ease_both]">
      <Sparkles size={44} className="animate-pulse text-accent" />
      <div className="mt-5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent">Analyzing</div>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground">Reading your taste</h2>
      <p className="mt-2.5 text-[15px] text-muted">Matching “<span className="font-medium text-foreground">{query}</span>” across 30,000+ titles</p>
      <div className="relative mt-7 h-[3px] w-[300px] max-w-[78vw] overflow-hidden rounded-full bg-white/[0.08]">
        <div className="absolute inset-y-0 w-2/5 rounded-full bg-accent animate-[slideSeg_1.1s_cubic-bezier(.55,.1,.35,.9)_infinite]" />
      </div>
    </div>
  )
}

/* ── Trailer modal ── */
function TrailerModal({ title, youtubeId, malId, onClose }: { title: string; youtubeId: string; malId: number; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4" onClick={onClose}>
      <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-foreground">{title}</h2>
          <div className="flex items-center gap-3">
            <Link href={`/anime/${malId}`} className="text-xs font-bold uppercase tracking-widest text-accent-bright hover:text-foreground">Details</Link>
            <button onClick={onClose} className="text-white/60 hover:text-foreground"><X size={20} /></button>
          </div>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-background">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        </div>
      </div>
    </div>
  )
}
