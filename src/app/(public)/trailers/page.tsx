"use client"

import { useEffect, useState } from "react"
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

export default function TrailersPage() {
  const [trailers, setTrailers] = useState<Trailer[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<Trailer | null>(null)

  useEffect(() => {
    api<{ data: Trailer[] }>(`/anime/trailers?limit=48`)
      .then((r) => setTrailers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-20 sm:pt-36">
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-4xl font-black uppercase italic tracking-tighter text-foreground sm:text-5xl">
          <Film className="text-accent-bright" size={36} /> Trailers
        </h1>
        <p className="mt-2 text-sm text-muted">Watch trailers for the most-talked-about anime — tap any poster to play.</p>
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
            <button key={t.malId} onClick={() => setActive(t)} className="group relative aspect-[2/3] overflow-hidden rounded-2xl border border-border bg-black text-left">
              {t.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.imageUrl} alt={t.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : <div className="flex h-full w-full items-center justify-center"><Film className="text-muted" size={28} /></div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-accent">
                <Play size={20} className="ml-0.5 fill-white text-white" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="line-clamp-2 text-[13px] font-bold leading-tight text-white">{t.title}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-white/60">
                  {t.score != null && <span className="flex items-center gap-0.5"><Star size={9} className="fill-amber-400 text-amber-400" /> {t.score.toFixed(1)}</span>}
                  {t.type && <span>{t.type}</span>}
                  {t.year && <span>{t.year}</span>}
                </div>
              </div>
            </button>
          ))}
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
          <h2 className="text-lg font-black text-white">{trailer.title}</h2>
          <div className="flex items-center gap-3">
            <Link href={`/anime/${trailer.malId}`} className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-accent-bright hover:text-white">Details <ArrowUpRight size={13} /></Link>
            <button onClick={onClose} className="text-white/60 hover:text-white"><X size={20} /></button>
          </div>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
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
