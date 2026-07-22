"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Play, X, Loader2, Film, Star, ArrowUpRight } from "lucide-react"
import { api } from "@/lib/api/client"

type Trailer = {
  malId: number
  title: string
  imageUrl: string | null
  youtubeId: string
  score: number | null
  type: string | null
  year: number | null
}

const PAGE_SIZE = 48

export default function TrailersPage() {
  const [trailers, setTrailers] = useState<Trailer[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [active, setActive] = useState<Trailer | null>(null)
  const fetchingRef = useRef(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const loadPage = useCallback(async (p: number) => {
    if (fetchingRef.current) return
    fetchingRef.current = true
    if (p === 1) setLoading(true); else setLoadingMore(true)
    try {
      const r = await api<{ data: Trailer[]; meta?: { pages?: number; total?: number } }>(`/anime/trailers?page=${p}&limit=${PAGE_SIZE}`)
      setTrailers(prev => {
        // Dedupe by malId in case trending order shifts between page fetches.
        const seen = new Set(prev.map(t => t.malId))
        const fresh = r.data.filter(t => !seen.has(t.malId))
        return p === 1 ? r.data : [...prev, ...fresh]
      })
      setPages(r.meta?.pages ?? 1)
      setTotal(r.meta?.total ?? r.data.length)
      setPage(p)
    } catch { /* keep what we have */ }
    finally {
      setLoading(false); setLoadingMore(false); fetchingRef.current = false
    }
  }, [])

  useEffect(() => { loadPage(1) }, [loadPage])

  // Infinite scroll: load the next page when the sentinel nears the viewport.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !fetchingRef.current && page < pages) {
        loadPage(page + 1)
      }
    }, { rootMargin: "800px" })
    io.observe(el)
    return () => io.disconnect()
  }, [page, pages, loadPage])

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-20 sm:pt-36">
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-4xl font-black uppercase italic tracking-tighter text-foreground sm:text-5xl">
          <Film className="text-accent-bright" size={36} /> Trailers
        </h1>
        <p className="mt-2 text-sm text-muted">
          Watch trailers for the most-talked-about anime — tap any poster to play.
          {total > 0 && <span className="ml-1 text-subtle">{total.toLocaleString()} trailers.</span>}
        </p>
      </header>

      {loading ? (
        <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-accent" size={28} /></div>
      ) : trailers.length === 0 ? (
        <div className="py-24 text-center">
          <Film className="mx-auto mb-4 text-muted" size={32} />
          <p className="text-sm text-muted">No trailers available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {trailers.map((t) => (
            <button key={t.malId} onClick={() => setActive(t)} className="group relative aspect-[2/3] overflow-hidden rounded-2xl border border-border bg-background text-left">
              {t.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.imageUrl} alt={t.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : <div className="flex h-full w-full items-center justify-center"><Film className="text-muted" size={28} /></div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-accent">
                <Play size={20} className="ml-0.5 fill-white text-foreground" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="line-clamp-2 text-[13px] font-bold leading-tight text-foreground">{t.title}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-white/60">
                  {t.score != null && <span className="flex items-center gap-0.5"><Star size={9} className="fill-accent-bright text-accent-bright" /> {t.score.toFixed(1)}</span>}
                  {t.type && <span>{t.type}</span>}
                  {t.year && <span>{t.year}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Infinite-scroll sentinel + loader */}
      {!loading && trailers.length > 0 && (
        <div ref={sentinelRef} className="flex h-20 items-center justify-center">
          {loadingMore ? (
            <Loader2 className="animate-spin text-accent" size={22} />
          ) : page >= pages ? (
            <p className="text-xs text-subtle">That's all {total.toLocaleString()} trailers.</p>
          ) : null}
        </div>
      )}

      {active && <TrailerModal trailer={active} onClose={() => setActive(null)} />}
    </div>
  )
}

function TrailerModal({ trailer, onClose }: { trailer: Trailer; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-foreground">{trailer.title}</h2>
          <div className="flex items-center gap-3">
            <Link href={`/anime/${trailer.malId}`} className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-accent-bright hover:text-foreground">Details <ArrowUpRight size={13} /></Link>
            <button onClick={onClose} className="text-white/60 hover:text-foreground"><X size={20} /></button>
          </div>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-background">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${trailer.youtubeId}?autoplay=1&rel=0`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={trailer.title}
          />
        </div>
      </div>
    </div>
  )
}
