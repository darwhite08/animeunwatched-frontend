"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { Heart, Volume2, VolumeX, Clapperboard, Loader2, Play, Star } from "lucide-react"
import { api } from "@/lib/api/client"

type Shot = {
  id: string
  caption: string | null
  videoUrl: string
  embedUrl: string | null
  sourceProvider: string | null
  thumbnailUrl: string | null
  author: { id: string; username: string; displayName: string; avatarUrl: string | null }
  anime: { malId: number; title: string } | null
  _count: { likes: number }
  isLikedByMe: boolean
}

type Trailer = {
  malId: number
  title: string
  imageUrl: string | null
  youtubeId: string
  score: number | null
  type: string | null
  year: number | null
}

type FeedItem = { kind: "shot"; shot: Shot } | { kind: "trailer"; trailer: Trailer }

const TRAILER_EVERY = 3 // interleave a trailer after every N shots

export default function ShotsPage() {
  const [shots, setShots] = useState<Shot[]>([])
  const [trailers, setTrailers] = useState<Trailer[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [muted, setMuted] = useState(true)
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<"all" | "shots" | "trailers">("all")
  const loadingRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadShots = useCallback(async (c?: string | null) => {
    if (loadingRef.current) return
    loadingRef.current = true
    try {
      const res = await api<{ data: Shot[]; meta: { nextCursor: string | null } }>(
        `/shots/feed?limit=6${c ? `&cursor=${encodeURIComponent(c)}` : ""}`,
      )
      setShots((prev) => (c ? [...prev, ...res.data] : res.data))
      setCursor(res.meta.nextCursor)
      if (!res.meta.nextCursor) setDone(true)
    } catch {
      setDone(true)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadShots()
    api<{ data: Trailer[] }>(`/anime/trailers?limit=40`)
      .then((r) => setTrailers(r.data ?? []))
      .catch(() => {})
  }, [loadShots])

  // Build the vertical feed for the selected tab.
  const feed = useMemo<FeedItem[]>(() => {
    if (mode === "trailers") return trailers.map((tr) => ({ kind: "trailer", trailer: tr }))
    if (mode === "shots") return shots.map((s) => ({ kind: "shot", shot: s }))
    // "all" → interleave a trailer after every N shots
    const out: FeedItem[] = []
    let t = 0
    if (shots.length === 0) {
      trailers.forEach((tr) => out.push({ kind: "trailer", trailer: tr }))
      return out
    }
    shots.forEach((s, i) => {
      out.push({ kind: "shot", shot: s })
      if ((i + 1) % TRAILER_EVERY === 0 && t < trailers.length) out.push({ kind: "trailer", trailer: trailers[t++] })
    })
    if (done) while (t < trailers.length) out.push({ kind: "trailer", trailer: trailers[t++] })
    return out
  }, [shots, trailers, done, mode])

  const switchMode = (m: "all" | "shots" | "trailers") => {
    setMode(m)
    setActive(0)
    scrollRef.current?.scrollTo({ top: 0 })
  }

  // Deterministic active-reel detection from scroll position (each reel fills
  // the scroll container exactly). Drives play/pause + infinite-scroll loading.
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const idx = Math.round(el.scrollTop / el.clientHeight)
    setActive((prev) => (prev === idx ? prev : idx))
    if (idx >= feed.length - 2 && !done && !loadingRef.current && cursor) loadShots(cursor)
  }, [feed.length, done, cursor, loadShots])

  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center bg-black">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    )
  }
  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      style={{ paddingTop: 0 }}
      className="relative h-[calc(100dvh-3.5rem-4rem)] w-full snap-y snap-mandatory overflow-y-scroll bg-black md:h-[calc(100dvh-3.5rem)] [&::-webkit-scrollbar]:hidden"
    >
      {/* Section tabs — Shots / Trailers / For You */}
      <div className="fixed left-1/2 top-[4.5rem] z-30 flex -translate-x-1/2 gap-1 rounded-full border border-white/10 bg-black/55 p-1 backdrop-blur md:absolute">
        {([["all", "For You"], ["shots", "Shots"], ["trailers", "Trailers"]] as const).map(([m, label]) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`rounded-full px-3.5 py-1.5 text-[11px] font-black uppercase tracking-widest transition-colors ${
              mode === m ? "bg-white text-black" : "text-white/70 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Floating mute toggle */}
      <button
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="fixed right-4 top-[4.5rem] z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70 md:absolute md:right-6"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {feed.length === 0 && (
        <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
          <Clapperboard className="mb-4 text-muted" size={32} />
          <h1 className="text-xl font-black uppercase italic tracking-tight text-foreground">
            {mode === "shots" ? "No shots yet" : mode === "trailers" ? "No trailers yet" : "Nothing here yet"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {mode === "shots" ? "Be the first to post a short vertical clip." : "Check back soon."}
          </p>
        </div>
      )}

      {feed.map((item, idx) => (
        <div
          key={item.kind === "shot" ? item.shot.id : `t-${item.trailer.malId}`}
          className="flex h-full w-full snap-start snap-always items-center justify-center p-2 sm:p-4"
        >
          {item.kind === "shot" ? (
            <ShotReel shot={item.shot} active={active === idx} muted={muted} />
          ) : (
            <TrailerReel trailer={item.trailer} active={active === idx} muted={muted} />
          )}
        </div>
      ))}

      {!done && (
        <div className="flex h-24 items-center justify-center">
          <Loader2 className="animate-spin text-white/60" size={22} />
        </div>
      )}
    </div>
  )
}

function MediaShell({ children }: { children: React.ReactNode }) {
  return <div className="relative aspect-[9/16] h-full max-h-full w-auto overflow-hidden rounded-3xl border border-border bg-black">{children}</div>
}

function ShotReel({ shot, active, muted }: { shot: Shot; active: boolean; muted: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [liked, setLiked] = useState(shot.isLikedByMe)
  const [likes, setLikes] = useState(shot._count.likes)
  const [busy, setBusy] = useState(false)
  const isEmbed = Boolean(shot.embedUrl)

  useEffect(() => {
    const v = videoRef.current
    if (!v || isEmbed) return
    if (active) v.play().catch(() => {})
    else { v.pause(); v.currentTime = 0 }
  }, [active, isEmbed])

  async function toggleLike() {
    if (busy) return
    setBusy(true)
    const next = !liked
    setLiked(next); setLikes((n) => n + (next ? 1 : -1))
    try {
      await api(`/shots/${shot.id}/like`, { method: next ? "POST" : "DELETE" })
    } catch {
      setLiked(!next); setLikes((n) => n + (next ? -1 : 1))
    } finally { setBusy(false) }
  }

  return (
    <MediaShell>
      {isEmbed ? (
        active ? (
          <iframe src={shot.embedUrl!} className="h-full w-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen title={shot.caption ?? "Shot"} />
        ) : (
          <Poster src={shot.thumbnailUrl} />
        )
      ) : (
        <video
          ref={videoRef}
          src={shot.videoUrl}
          poster={shot.thumbnailUrl ?? undefined}
          muted={muted}
          loop
          playsInline
          onClick={(e) => { const v = e.currentTarget; v.paused ? v.play() : v.pause() }}
          className="h-full w-full object-cover"
        />
      )}
      {!isEmbed && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />}

      <div className="absolute bottom-24 right-3 flex flex-col items-center gap-4">
        <button onClick={toggleLike} className="flex flex-col items-center gap-1 text-white">
          <span className={`flex h-11 w-11 items-center justify-center rounded-full ${liked ? "bg-rose-500" : "bg-black/40"}`}>
            <Heart size={20} className={liked ? "fill-white" : ""} />
          </span>
          <span className="text-[11px] font-bold tabular-nums">{likes}</span>
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <Link href={`/u/${shot.author.username}`} className="flex items-center gap-2">
          {shot.author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shot.author.avatarUrl} alt="" className="h-8 w-8 rounded-full border border-white/30 object-cover" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-black text-white">{shot.author.displayName?.[0]?.toUpperCase() ?? "?"}</span>
          )}
          <span className="text-sm font-bold text-white">@{shot.author.username}</span>
        </Link>
        {shot.caption && <p className="mt-2 line-clamp-2 text-[13px] text-white/90">{shot.caption}</p>}
        {shot.anime && (
          <Link href={`/anime/${shot.anime.malId}`} className="mt-2 inline-block rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            {shot.anime.title}
          </Link>
        )}
      </div>
    </MediaShell>
  )
}

function TrailerReel({ trailer, active, muted }: { trailer: Trailer; active: boolean; muted: boolean }) {
  return (
    <MediaShell>
      {active ? (
        <iframe
          key={`${trailer.youtubeId}-${muted ? "m" : "s"}`}
          src={`https://www.youtube-nocookie.com/embed/${trailer.youtubeId}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&rel=0&playsinline=1&modestbranding=1&loop=1&playlist=${trailer.youtubeId}`}
          className="h-full w-full"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          title={trailer.title}
        />
      ) : (
        <>
          <Poster src={trailer.imageUrl} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 text-white"><Play size={24} className="ml-0.5 fill-white" /></span>
          </div>
        </>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">Trailer</span>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <Link href={`/anime/${trailer.malId}`} className="block">
          <h3 className="line-clamp-2 text-lg font-black leading-tight tracking-tight text-white">{trailer.title}</h3>
        </Link>
        <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-white/80">
          {trailer.score != null && <span className="inline-flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" />{trailer.score.toFixed(1)}</span>}
          {trailer.type && <span className="rounded-full bg-white/15 px-2 py-0.5 uppercase tracking-widest">{trailer.type}</span>}
          {trailer.year && <span>{trailer.year}</span>}
        </div>
      </div>
    </MediaShell>
  )
}

function Poster({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <div className="h-full w-full bg-gradient-to-br from-zinc-900 to-black" />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="h-full w-full object-cover" />
}
