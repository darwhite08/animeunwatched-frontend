"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useQuery } from "@tanstack/react-query"
import { X, Tv, ExternalLink, Loader2, Star, Users } from "lucide-react"
import { getWatchSources } from "@/lib/api/endpoints"
import { WatchPlayer } from "./WatchPlayer"
import type { AnimeDTO } from "@/lib/api/types"

/**
 * Netflix-style in-page watch modal. Opens over the /watch hub — plays the
 * official source(s) + lists episodes without ever navigating to the anime page.
 */
export function WatchModal({ anime, onClose }: { anime: AnimeDTO; onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  const [selected, setSelected] = useState(0)
  useEffect(() => setMounted(true), [])

  const { data, isLoading } = useQuery({
    queryKey: ["watch-sources", anime.malId],
    queryFn: () => getWatchSources(anime.malId),
    staleTime: 5 * 60_000,
  })
  const sources = data?.sources ?? []
  const current = sources[Math.min(selected, Math.max(sources.length - 1, 0))]
  const title = anime.titleEnglish || anime.title
  const [partyId] = useState(() => Math.random().toString(36).slice(2, 10))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev }
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="relative w-full overflow-hidden border-border bg-background sm:my-8 sm:max-w-3xl sm:rounded-2xl sm:border" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-foreground backdrop-blur-md transition hover:bg-black/70 active:scale-90">
          <X size={18} />
        </button>

        {/* Player / hero */}
        {isLoading ? (
          <div className="flex aspect-video w-full items-center justify-center bg-surface">
            <Loader2 className="animate-spin text-accent-bright" size={26} />
          </div>
        ) : current ? (
          <WatchPlayer
            videoId={current.videoId}
            poster={anime.imageUrl ?? null}
            title={current.episode != null ? `${title} — Episode ${current.episode}` : current.title}
            channel={current.channel}
            fallbackQuery={title}
          />
        ) : (
          <div className="relative aspect-video w-full overflow-hidden bg-surface">
            {anime.imageUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={anime.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
        )}

        {/* Info */}
        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter sm:text-2xl">{title}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-black uppercase tracking-widest text-subtle">
              {anime.score ? <span className="flex items-center gap-1 text-accent-bright"><Star size={11} fill="currentColor" /> {anime.score.toFixed(1)}</span> : null}
              {anime.type && <span>{anime.type}</span>}
              {anime.year ? <span>{anime.year}</span> : null}
              {anime.episodes ? <span>{anime.episodes} eps</span> : null}
            </div>
          </div>

          {current && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-subtle">
                Streaming the official upload from <span className="font-bold text-muted">{current.channel}</span> · plays via YouTube
              </p>
              <a href={`/watch-party/${partyId}?v=${current.videoId}`}
                className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-accent-bright transition hover:bg-accent/20 active:scale-95">
                <Users size={14} /> Watch Party
              </a>
            </div>
          )}

          {anime.synopsis && <p className="text-sm leading-relaxed text-muted line-clamp-4">{anime.synopsis}</p>}

          {/* Episodes */}
          {sources.length > 1 && (
            <div>
              <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted">Episodes</h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
                {sources.map((s, i) => (
                  <button key={s.videoId} onClick={() => setSelected(i)} title={s.title}
                    className={`min-h-11 rounded-xl border px-2 py-2 text-[11px] font-black tabular-nums transition ${
                      i === selected ? "border-accent/40 bg-accent/15 text-accent-bright" : "border-border bg-surface text-muted hover:bg-surface-2 hover:text-foreground"
                    }`}>
                    {s.episode != null ? `EP ${s.episode}` : `Part ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No official source → deep-link out */}
          {!isLoading && !current && (
            <div className="rounded-xl border border-dashed border-border p-5 text-center">
              <Tv className="mx-auto mb-2 text-subtle" size={24} />
              <p className="text-sm font-bold text-foreground">No official stream on Kaiveron yet</p>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted">We only embed official licensed uploads. Watch it on a licensed platform:</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <a href={`https://www.crunchyroll.com/search?q=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-black transition hover:opacity-90">
                  Crunchyroll <ExternalLink size={13} />
                </a>
                <a href={`https://www.netflix.com/search?q=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-muted transition hover:text-foreground">
                  Netflix <ExternalLink size={13} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
