"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { ArrowLeft, Tv, ExternalLink, Loader2 } from "lucide-react"
import { getAnime, getWatchSources } from "@/lib/api/endpoints"
import { WatchPlayer } from "@/components/anime/WatchPlayer"

export default function WatchPage() {
  const params = useParams()
  const id = String(params?.id ?? "")
  const malId = Number(id)
  const [selected, setSelected] = useState(0)

  const { data: animeData } = useQuery({
    queryKey: ["anime", id], queryFn: () => getAnime(malId), enabled: Number.isFinite(malId),
  })
  const { data: srcData, isLoading } = useQuery({
    queryKey: ["watch-sources", id], queryFn: () => getWatchSources(malId),
    enabled: Number.isFinite(malId), staleTime: 5 * 60_000,
  })

  const anime = animeData?.anime
  const title = anime?.titleEnglish || anime?.title || "Anime"
  const sources = srcData?.sources ?? []
  const current = sources[Math.min(selected, sources.length - 1)]

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 sm:pt-24">

        {/* Back */}
        <Link href={`/anime/${id}`} className="mb-5 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted hover:text-foreground transition">
          <ArrowLeft size={14} /> Back to {title}
        </Link>

        <h1 className="mb-1 text-2xl sm:text-3xl font-black uppercase italic tracking-tighter">{title}</h1>
        <p className="mb-5 flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-subtle">
          <Tv size={12} /> Watch
        </p>

        {/* Player / states */}
        {isLoading ? (
          <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-border bg-surface">
            <Loader2 className="animate-spin text-accent-bright" size={26} />
          </div>
        ) : current ? (
          <>
            <WatchPlayer
              videoId={current.videoId}
              poster={anime?.imageUrl ?? null}
              title={current.episode != null ? `${title} — Episode ${current.episode}` : current.title}
              channel={current.channel}
              fallbackQuery={title}
            />
            {/* Honest, ToS-compliant attribution */}
            <p className="mt-2 text-[11px] text-subtle">
              Streaming the official upload from <span className="font-bold text-muted">{current.channel}</span> · plays via YouTube
            </p>

            {/* Episode / source switcher */}
            {sources.length > 1 && (
              <div className="mt-6">
                <h2 className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted">Episodes</h2>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
                  {sources.map((s, i) => (
                    <button key={s.videoId} onClick={() => setSelected(i)}
                      title={s.title}
                      className={`min-h-11 rounded-xl border px-2 py-2 text-[11px] font-black tabular-nums transition ${
                        i === selected
                          ? "border-accent/40 bg-accent/15 text-accent-bright"
                          : "border-border bg-surface text-muted hover:text-foreground hover:bg-surface-2"
                      }`}>
                      {s.episode != null ? `EP ${s.episode}` : `Part ${i + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* No official source found → deep-link out, never a dead end */
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
            <Tv className="text-subtle" size={30} />
            <p className="text-sm font-bold text-foreground">No official stream on Kaiveron yet</p>
            <p className="max-w-md text-xs text-muted">
              We only embed official, licensed uploads — none are available for this title right now. Watch it on a licensed platform:
            </p>
            <div className="mt-1 flex flex-wrap justify-center gap-2">
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
  )
}
