"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Play, X, ExternalLink } from "lucide-react"

/**
 * Kaiveron watch player. Shows our own poster + play button; on play it opens a
 * full-page (fullscreen) player over the whole viewport and streams the official
 * YouTube upload via a plain autoplay iframe (reliable, ToS-compliant chrome).
 * A "watch elsewhere" deep link stays visible so geo-blocked uploads never
 * dead-end.
 */
export function WatchPlayer({
  videoId, poster, title, channel, fallbackQuery,
}: {
  videoId: string
  poster?: string | null
  title: string
  channel: string
  fallbackQuery: string
}) {
  const [playing, setPlaying] = useState(false)

  // New video selected → drop back to the poster state.
  useEffect(() => { setPlaying(false) }, [videoId])

  // While the full-page player is open: lock scroll + Esc closes it.
  useEffect(() => {
    if (!playing) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPlaying(false)
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev }
  }, [playing])

  const embedSrc =
    `https://www.youtube.com/embed/${videoId}` +
    `?autoplay=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&fs=1`
  const crunchyroll = `https://www.crunchyroll.com/search?q=${encodeURIComponent(fallbackQuery)}`

  return (
    <>
      {/* Poster + play button (inside the modal hero) */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-black aspect-video">
        <button onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full" aria-label={`Play ${title}`}>
          {poster && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition group-hover:opacity-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-black shadow-lg transition group-hover:scale-110 group-active:scale-95">
              <Play size={26} className="ml-0.5" fill="currentColor" />
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
            <p className="text-sm font-black text-foreground line-clamp-1">{title}</p>
            <p className="mt-0.5 text-[10px] font-mono uppercase tracking-widest text-muted">Official upload · {channel}</p>
          </div>
        </button>
      </div>

      {/* Full-page player — portaled to <body> so it escapes the modal box */}
      {playing && createPortal(
        <div className="fixed inset-0 z-[400] flex flex-col bg-black">
          <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{title}</p>
              <p className="truncate text-[10px] font-mono uppercase tracking-widest text-white/50">Official upload · {channel}</p>
            </div>
            <button onClick={() => setPlaying(false)} aria-label="Close player"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 active:scale-90">
              <X size={20} />
            </button>
          </div>

          <div className="relative flex-1">
            <iframe
              key={videoId}
              src={embedSrc}
              title={title}
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="px-4 py-2 text-center" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
            <a href={crunchyroll} target="_blank" rel="noopener noreferrer" className="text-[11px] text-white/40 transition hover:text-white/70">
              Not playing in your region? Watch on Crunchyroll <ExternalLink size={11} className="inline -mt-0.5" />
            </a>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
