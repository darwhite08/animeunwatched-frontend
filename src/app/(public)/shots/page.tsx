"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { Heart, MessageSquare, Volume2, VolumeX, Clapperboard, Loader2 } from "lucide-react"
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

export default function ShotsPage() {
  const [shots, setShots] = useState<Shot[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [muted, setMuted] = useState(true)
  const [done, setDone] = useState(false)

  const load = useCallback(async (c?: string | null) => {
    try {
      const res = await api<{ data: Shot[]; meta: { nextCursor: string | null } }>(
        `/shots/feed?limit=8${c ? `&cursor=${encodeURIComponent(c)}` : ""}`,
      )
      setShots((prev) => (c ? [...prev, ...res.data] : res.data))
      setCursor(res.meta.nextCursor)
      if (!res.meta.nextCursor) setDone(true)
    } catch {
      setDone(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="animate-spin text-accent" size={28} /></div>
  }
  if (shots.length === 0) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <Clapperboard className="mx-auto mb-4 text-muted" size={32} />
        <h1 className="text-xl font-black uppercase italic tracking-tight text-foreground">No shots yet</h1>
        <p className="mt-2 text-sm text-muted">Short vertical clips from creators will show up here.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-[460px] flex-col items-center gap-4 px-3 py-6">
      <div className="flex w-full items-center gap-2 px-1">
        <Clapperboard className="text-accent" size={20} />
        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">Shots</h1>
        <button onClick={() => setMuted((m) => !m)} className="ml-auto flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted hover:text-foreground">
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />} {muted ? "Muted" : "Sound"}
        </button>
      </div>

      {shots.map((s) => <ShotCard key={s.id} shot={s} muted={muted} />)}

      {!done && (
        <button onClick={() => load(cursor)} className="my-4 rounded-full bg-accent px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white">
          Load more
        </button>
      )}
    </div>
  )
}

function ShotCard({ shot, muted }: { shot: Shot; muted: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [liked, setLiked] = useState(shot.isLikedByMe)
  const [likes, setLikes] = useState(shot._count.likes)
  const [busy, setBusy] = useState(false)

  const isEmbed = Boolean(shot.embedUrl)

  // Autoplay native video only while on screen (embeds manage their own playback).
  useEffect(() => {
    const v = videoRef.current
    if (!v || isEmbed) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() },
      { threshold: 0.6 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [isEmbed])

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
    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl border border-border bg-black">
      {isEmbed ? (
        <iframe
          src={shot.embedUrl!}
          className="h-full w-full"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          title={shot.caption ?? "Shot"}
        />
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

      {/* Right action rail */}
      <div className="absolute bottom-24 right-3 flex flex-col items-center gap-4">
        <button onClick={toggleLike} className="flex flex-col items-center gap-1 text-white">
          <span className={`flex h-11 w-11 items-center justify-center rounded-full ${liked ? "bg-rose-500" : "bg-black/40"}`}>
            <Heart size={20} className={liked ? "fill-white" : ""} />
          </span>
          <span className="text-[11px] font-bold tabular-nums">{likes}</span>
        </button>
      </div>

      {/* Bottom meta */}
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
    </div>
  )
}
