"use client"

import { useEffect, useRef, useState } from "react"
import { Play, AlertTriangle, ExternalLink } from "lucide-react"

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global { interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void } }

let apiPromise: Promise<void> | null = null
function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.YT?.Player) return Promise.resolve()
  if (apiPromise) return apiPromise
  apiPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve() }
    const s = document.createElement("script")
    s.src = "https://www.youtube.com/iframe_api"
    document.head.appendChild(s)
  })
  return apiPromise
}

/**
 * Kaiveron watch player. Shows our own poster + play button; on play it mounts
 * the official YouTube IFrame player (minimal, ToS-compliant chrome) and listens
 * for errors — embedding-disabled / region-blocked (101/150/100) falls back to a
 * "watch elsewhere" deep link so the page never dead-ends.
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
  const [blocked, setBlocked] = useState(false)
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)

  // New video selected → reset to poster state.
  useEffect(() => { setPlaying(false); setBlocked(false) }, [videoId])

  useEffect(() => {
    if (!playing) return
    let cancelled = false
    loadYouTubeApi().then(() => {
      if (cancelled || !hostRef.current || !window.YT?.Player) return
      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId,
        playerVars: {
          autoplay: 1, rel: 0, modestbranding: 1, iv_load_policy: 3,
          playsinline: 1, color: "white", origin: window.location.origin,
        },
        events: {
          onError: (e: { data: number }) => {
            // 101/150 = owner disabled embedding (often region), 100 = removed/private
            if ([100, 101, 150].includes(e.data)) setBlocked(true)
          },
        },
      })
    })
    return () => {
      cancelled = true
      try { playerRef.current?.destroy?.() } catch { /* noop */ }
      playerRef.current = null
    }
  }, [playing, videoId])

  const crunchyroll = `https://www.crunchyroll.com/search?q=${encodeURIComponent(fallbackQuery)}`

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-black aspect-video">
      {blocked ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertTriangle className="text-accent-bright" size={28} />
          <p className="text-sm font-bold text-foreground">Not available to stream in your region</p>
          <p className="max-w-sm text-xs text-muted">The official upload is geo-restricted here. You can watch it on a licensed platform:</p>
          <a href={crunchyroll} target="_blank" rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-black transition hover:opacity-90">
            Watch on Crunchyroll <ExternalLink size={13} />
          </a>
        </div>
      ) : playing ? (
        <div ref={hostRef} className="absolute inset-0 h-full w-full" />
      ) : (
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
      )}
    </div>
  )
}
