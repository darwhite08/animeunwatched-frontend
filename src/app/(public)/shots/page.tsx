"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { Heart, MessageCircle, Bookmark, Share2, Plus, Volume2, VolumeX, Clapperboard, Loader2, Play, Star } from "lucide-react"
import { api } from "@/lib/api/client"
import { track } from "@/lib/analytics/ga"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"
import { useAuthPrompt } from "@/stores/authPrompt.store"
import { ShotCommentsSheet } from "@/components/shots/ShotCommentsSheet"

type Shot = {
  id: string
  caption: string | null
  videoUrl: string
  embedUrl: string | null
  sourceProvider: string | null
  thumbnailUrl: string | null
  authorId?: string
  author: { id: string; username: string; displayName: string; avatarUrl: string | null }
  anime: { malId: number; title: string } | null
  _count: { likes: number; comments?: number; saves?: number }
  isLikedByMe: boolean
  isSavedByMe?: boolean
  authorFollowedByMe?: boolean
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return String(n)
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

  // Well-being guardrail: the variable-reward feed is the strongest hook in the
  // product AND its highest addiction risk (engagement research §2). After 20
  // minutes of continuous viewing, surface a gentle, dismissible check-in.
  // Dismissing re-arms it for another 20 minutes.
  const BREAK_AFTER_MS = 20 * 60_000
  const [showBreak, setShowBreak] = useState(false)
  const [breakCycle, setBreakCycle] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      setShowBreak(true)
      track("shots_break_shown", { cycle: breakCycle + 1 })
    }, BREAK_AFTER_MS)
    return () => clearTimeout(t)
  }, [breakCycle, BREAK_AFTER_MS])

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
      <div className="flex h-[calc(100dvh-3.5rem-4rem-env(safe-area-inset-bottom))] items-center justify-center bg-black md:h-[calc(100dvh-3.5rem)]">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    )
  }

  // Ambient backdrop image = the currently-active item's poster (fills the void).
  const currentItem = feed[active]
  const backdropImg = currentItem
    ? (currentItem.kind === "shot" ? currentItem.shot.thumbnailUrl : currentItem.trailer.imageUrl)
    : null

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      style={{ paddingTop: 0 }}
      className="relative h-[calc(100dvh-3.5rem-4rem-env(safe-area-inset-bottom))] w-full snap-y snap-mandatory overflow-y-scroll overscroll-y-contain bg-black md:h-[calc(100dvh-3.5rem)] [&::-webkit-scrollbar]:hidden"
    >
      {/* Premium ambient backdrop — the active poster, blurred + dimmed, fills the
          black void around the vertical card with a soft gold glow. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {backdropImg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={backdropImg} src={backdropImg} alt="" referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-3xl transition-opacity duration-700" />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(65% 60% at 50% 42%, color-mix(in srgb, var(--app-accent) 12%, transparent), transparent 72%)" }} />
      </div>

      {/* Section tabs — Shots / Trailers / For You */}
      <div className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+4.5rem)] z-30 flex -translate-x-1/2 gap-1 rounded-full border border-white/10 bg-black/55 p-1 backdrop-blur md:absolute md:top-[4.5rem]">
        {([["all", "For You"], ["shots", "Shots"], ["trailers", "Trailers"]] as const).map(([m, label]) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`rounded-full px-3.5 py-2 text-[11px] font-black uppercase tracking-widest transition-all duration-200 ease-out active:scale-95 ${
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
        className="fixed right-4 top-[calc(env(safe-area-inset-top)+4.5rem)] z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-transform duration-200 ease-out hover:bg-black/70 active:scale-95 md:absolute md:right-6 md:top-[4.5rem]"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {/* Usage-awareness check-in (gentle, dismissible — never blocks for long) */}
      {showBreak && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-900 p-7 text-center">
            <p className="text-3xl">🍵</p>
            <h2 className="mt-3 text-lg font-black uppercase italic tracking-tight text-white">
              Still scrolling?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              You&apos;ve been in the feed for about {20 * (breakCycle + 1)} minutes.
              The anime will still be here after a stretch.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/"
                onClick={() => track("shots_break_taken", { cycle: breakCycle + 1 })}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-black uppercase tracking-widest text-black transition-transform duration-200 ease-out active:scale-[0.98]">
                Take a break
              </Link>
              <button
                onClick={() => { setShowBreak(false); setBreakCycle(c => c + 1); track("shots_break_dismissed", { cycle: breakCycle + 1 }) }}
                className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold uppercase tracking-widest text-white/70 transition-transform duration-200 ease-out hover:text-white active:scale-[0.98]">
                Keep watching
              </button>
            </div>
          </div>
        </div>
      )}

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
          className="relative z-[1] flex h-full w-full snap-start snap-always items-center justify-center p-2 sm:p-4"
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
  return <div className="relative aspect-[9/16] h-full max-h-full w-auto overflow-hidden rounded-3xl bg-black ring-1 ring-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.65)]">{children}</div>
}

function ShotReel({ shot, active, muted }: { shot: Shot; active: boolean; muted: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const me = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { push } = useToast()
  const showAuthPrompt = useAuthPrompt((s) => s.show)

  const [liked, setLiked] = useState(shot.isLikedByMe)
  const [likes, setLikes] = useState(shot._count.likes)
  const [saved, setSaved] = useState(shot.isSavedByMe ?? false)
  const [saves, setSaves] = useState(shot._count.saves ?? 0)
  const [comments, setComments] = useState(shot._count.comments ?? 0)
  const [following, setFollowing] = useState(shot.authorFollowedByMe ?? false)
  const [showComments, setShowComments] = useState(false)
  const [likeBusy, setLikeBusy] = useState(false)
  const [saveBusy, setSaveBusy] = useState(false)
  const [followBusy, setFollowBusy] = useState(false)
  const isEmbed = Boolean(shot.embedUrl)

  const authorId = shot.authorId ?? shot.author.id
  const mine = me?.id === authorId

  useEffect(() => {
    const v = videoRef.current
    if (!v || isEmbed) return
    if (active) v.play().catch(() => {})
    else { v.pause(); v.currentTime = 0 }
  }, [active, isEmbed])

  async function toggleLike() {
    if (!isAuthenticated) { showAuthPrompt({ subtitle: "Sign in to like Shots." }); return }
    if (likeBusy) return
    setLikeBusy(true)
    const next = !liked
    setLiked(next); setLikes((n) => Math.max(0, n + (next ? 1 : -1)))
    try {
      await api(`/shots/${shot.id}/like`, { method: next ? "POST" : "DELETE" })
    } catch {
      setLiked(!next); setLikes((n) => Math.max(0, n + (next ? -1 : 1)))
    } finally { setLikeBusy(false) }
  }

  async function toggleSave() {
    if (!isAuthenticated) { showAuthPrompt({ subtitle: "Sign in to save Shots." }); return }
    if (saveBusy) return
    setSaveBusy(true)
    const next = !saved
    setSaved(next); setSaves((n) => Math.max(0, n + (next ? 1 : -1)))
    try {
      await api(`/shots/${shot.id}/save`, { method: next ? "POST" : "DELETE" })
    } catch {
      setSaved(!next); setSaves((n) => Math.max(0, n + (next ? -1 : 1)))
      push("Couldn't save — try again", "error")
    } finally { setSaveBusy(false) }
  }

  function openComments() {
    if (!isAuthenticated) { showAuthPrompt({ subtitle: "Sign in to read and post comments." }); return }
    setShowComments(true)
  }

  async function share() {
    const url = `${location.origin}/shots/${shot.id}`
    const data = { title: "Kaiveron Shots", text: shot.caption || `Shot by @${shot.author.username}`, url }
    try {
      if (navigator.share) { await navigator.share(data); return }
    } catch { return /* user dismissed the native sheet */ }
    try {
      await navigator.clipboard.writeText(url)
      push("Link copied to clipboard", "success")
    } catch {
      push("Couldn't share this Shot", "error")
    }
  }

  async function toggleFollow() {
    if (!isAuthenticated) { showAuthPrompt({ subtitle: "Sign in to follow creators." }); return }
    if (followBusy) return
    setFollowBusy(true)
    setFollowing(true)
    try {
      await api(`/users/${shot.author.username}/follow`, { method: "POST" })
    } catch {
      setFollowing(false)
      push("Couldn't follow — try again", "error")
    } finally { setFollowBusy(false) }
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

      {/* TikTok-style right action rail */}
      <div className="absolute bottom-28 right-3 z-10 flex flex-col items-center gap-4">
        <button onClick={toggleLike} aria-pressed={liked} aria-label={liked ? "Unlike" : "Like"} className="flex flex-col items-center gap-1 text-white transition-transform duration-200 ease-out active:scale-90">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-black/40 backdrop-blur">
            <Heart size={26} className={liked ? "fill-rose-500 text-rose-500" : ""} />
          </span>
          <span className="text-[11px] font-semibold tabular-nums drop-shadow">{likes > 0 ? compact(likes) : "Like"}</span>
        </button>
        <button onClick={openComments} aria-label="Comments" className="flex flex-col items-center gap-1 text-white transition-transform duration-200 ease-out active:scale-90">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-black/40 backdrop-blur">
            <MessageCircle size={26} />
          </span>
          <span className="text-[11px] font-semibold tabular-nums drop-shadow">{comments > 0 ? compact(comments) : "Comment"}</span>
        </button>
        <button onClick={toggleSave} aria-pressed={saved} aria-label={saved ? "Unsave" : "Save"} className="flex flex-col items-center gap-1 text-white transition-transform duration-200 ease-out active:scale-90">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-black/40 backdrop-blur">
            <Bookmark size={25} className={saved ? "fill-amber-400 text-amber-400" : ""} />
          </span>
          <span className="text-[11px] font-semibold tabular-nums drop-shadow">{saves > 0 ? compact(saves) : "Save"}</span>
        </button>
        <button onClick={share} aria-label="Share" className="flex flex-col items-center gap-1 text-white transition-transform duration-200 ease-out active:scale-90">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-black/40 backdrop-blur">
            <Share2 size={26} />
          </span>
          <span className="text-[11px] font-semibold drop-shadow">Share</span>
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 pr-20 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <Link href={`/u/${shot.author.username}`} className="inline-flex max-w-full items-center gap-2 transition-transform duration-200 ease-out active:scale-[0.98]">
            {shot.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shot.author.avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full border border-white/30 object-cover" />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-black text-white">{shot.author.displayName?.[0]?.toUpperCase() ?? "?"}</span>
            )}
            <span className="truncate text-sm font-bold text-white">@{shot.author.username}</span>
          </Link>
          {!mine && !following && (
            <button
              onClick={toggleFollow}
              disabled={followBusy}
              className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-white/60 px-2.5 py-0.5 text-[11px] font-bold text-white transition-transform duration-200 ease-out active:scale-95 disabled:opacity-50"
            >
              <Plus size={11} strokeWidth={3} /> Follow
            </button>
          )}
        </div>
        {shot.caption && <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-white/90">{shot.caption}</p>}
        {shot.anime && (
          <Link href={`/anime/${shot.anime.malId}`} className="mt-2 inline-block max-w-full truncate rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white transition-transform duration-200 ease-out active:scale-95">
            {shot.anime.title}
          </Link>
        )}
      </div>

      <ShotCommentsSheet
        shotId={shot.id}
        shotAuthorId={authorId}
        open={showComments}
        onClose={() => setShowComments(false)}
        onCountChange={(d) => setComments((n) => Math.max(0, n + d))}
      />
    </MediaShell>
  )
}

function TrailerReel({ trailer, active, muted }: { trailer: Trailer; active: boolean; muted: boolean }) {
  return (
    <MediaShell>
      {/* Blurred poster backdrop fills the vertical card so the 16:9 trailer
          never sits in awkward black letterboxing. */}
      {trailer.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={trailer.imageUrl} alt="" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-30 blur-2xl" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-black/80" />

      {/* Centered 16:9 player */}
      <div className="absolute inset-0 flex items-center justify-center px-1">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10">
          {active ? (
            <iframe
              key={`${trailer.youtubeId}-${muted ? "m" : "s"}`}
              src={`https://www.youtube-nocookie.com/embed/${trailer.youtubeId}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&rel=0&playsinline=1&modestbranding=1&loop=1&playlist=${trailer.youtubeId}`}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title={trailer.title}
            />
          ) : (
            <>
              <Poster src={trailer.imageUrl} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur"><Play size={20} className="ml-0.5 fill-white" /></span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Trailer badge — sits BELOW the For You/Shots/Trailers tab bar (tabs are
          at top-[safe+4.5rem], ~2.5rem tall) so it doesn't collide with them. */}
      <span className="absolute left-3 top-[calc(env(safe-area-inset-top)+7.75rem)] z-10 rounded-full bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-black shadow-lg md:top-[7.5rem]">Trailer</span>

      {/* Bottom meta */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-14 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Link href={`/anime/${trailer.malId}`} className="block">
          <h3 className="line-clamp-2 text-base font-black leading-tight tracking-tight text-white transition-colors hover:text-accent-bright sm:text-lg">{trailer.title}</h3>
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-white/80">
          {trailer.score != null && <span className="inline-flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" />{trailer.score.toFixed(1)}</span>}
          {trailer.type && <span className="rounded-full bg-white/15 px-2 py-0.5 uppercase tracking-widest">{trailer.type}</span>}
          {trailer.year && <span>{trailer.year}</span>}
          <Link href={`/anime/${trailer.malId}`} className="ml-auto inline-flex min-h-9 items-center gap-1 rounded-full bg-accent/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-black transition-transform duration-200 ease-out hover:scale-105 active:scale-95">
            Details
          </Link>
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
