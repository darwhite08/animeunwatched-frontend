"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { MessageCircle, Bookmark, Share2, Plus, Volume2, VolumeX, Clapperboard, Loader2, Play, Pause, Star, Eye, MoreHorizontal, EyeOff, Captions } from "lucide-react"
import { HeartLike } from "@/components/ui/HeartLike"
import { api } from "@/lib/api/client"
import { recordShotView, recordShotFeedback } from "@/lib/api/endpoints"
import { getViewerKey } from "@/lib/shots/viewerKey"
import { track } from "@/lib/analytics/ga"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"
import { useAuthPrompt } from "@/stores/authPrompt.store"
import { ShotCommentsSheet } from "@/components/shots/ShotCommentsSheet"
import { ShotComposer } from "@/components/shots/ShotComposer"

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
  viewCount?: number
  isLikedByMe: boolean
  isSavedByMe?: boolean
  authorFollowedByMe?: boolean
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return String(n)
}

// WCAG 2.2.2 / 2.3 — honor the OS "reduce motion" setting: when on, we don't
// autoplay the reel; the user presses play. SSR-safe (defaults to false).
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const on = () => setReduced(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return reduced
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

// Videos must be served straight from S3, not via the /cdn rewrite — the Vercel
// proxy mishandles HTTP Range requests (returns a broken 200), so <video> can't
// stream/seek and won't play. Images stay on /cdn (no Range needed).
const S3_ORIGIN = process.env.NEXT_PUBLIC_S3_ORIGIN ?? "https://kaiveron-uploads.s3.us-east-1.amazonaws.com"
function playableVideoUrl(url: string): string {
  return url.replace(/^https?:\/\/(?:www\.)?kaiveron\.com\/cdn\//, `${S3_ORIGIN}/`)
}

export default function ShotsPage() {
  const [shots, setShots] = useState<Shot[]>([])
  const [trailers, setTrailers] = useState<Trailer[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [muted, setMuted] = useState(true)
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<"all" | "following" | "shots" | "trailers">("all")
  const loadingRef = useRef(false)
  const filterRef = useRef<"following" | undefined>(undefined) // which feed source `shots` holds
  const scrollRef = useRef<HTMLDivElement>(null)

  // Posting a shot
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const showAuthPrompt = useAuthPrompt((s) => s.show)
  const [composing, setComposing] = useState(false)
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("compose")) {
      setComposing(true)
    }
  }, [])

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
      const f = filterRef.current ? `&filter=${filterRef.current}` : ""
      const res = await api<{ data: Shot[]; meta: { nextCursor: string | null } }>(
        `/shots/feed?limit=6${f}${c ? `&cursor=${encodeURIComponent(c)}` : ""}`,
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
    if (mode === "shots" || mode === "following") return shots.map((s) => ({ kind: "shot", shot: s }))
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

  const switchMode = (m: "all" | "following" | "shots" | "trailers") => {
    if (m === "following" && !isAuthenticated) {
      showAuthPrompt({ subtitle: "Sign in to see Shots from creators you follow." })
      return
    }
    const nextFilter = m === "following" ? "following" : undefined
    setMode(m)
    setActive(0)
    scrollRef.current?.scrollTo({ top: 0 })
    // "all" and "shots" share the ranked `shots` data — only re-fetch when the
    // feed SOURCE changes (ranked ⇄ following).
    if (nextFilter !== filterRef.current) {
      filterRef.current = nextFilter
      setShots([])
      setCursor(null)
      setDone(false)
      setLoading(true)
      loadShots(null)
    }
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

  // Keyboard navigation (WCAG 2.1.1): ↑/↓ move between reels. Ignore when a form
  // control (seek bar, comment box) is focused so we don't hijack their keys.
  const handleKeyNav = useCallback((e: React.KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName
    if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return
    const el = scrollRef.current
    if (!el) return
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault(); el.scrollBy({ top: el.clientHeight, behavior: "smooth" })
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault(); el.scrollBy({ top: -el.clientHeight, behavior: "smooth" })
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-3.5rem-4rem-env(safe-area-inset-bottom))] items-center justify-center bg-background md:h-[calc(100dvh-3.5rem)]">
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
      onKeyDown={handleKeyNav}
      tabIndex={0}
      aria-label="Shots feed — use Up and Down arrows to move between videos"
      style={{ paddingTop: 0 }}
      className="relative h-[calc(100dvh-3.5rem-4rem-env(safe-area-inset-bottom))] w-full snap-y snap-mandatory overflow-y-scroll overscroll-y-contain bg-background outline-none md:h-[calc(100dvh-3.5rem)] [&::-webkit-scrollbar]:hidden"
    >
      {/* Premium ambient backdrop — the active poster, blurred + dimmed, fills the
          black void around the vertical card with a soft gold glow. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {backdropImg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={backdropImg} src={backdropImg} alt="" referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-3xl transition-opacity duration-700" />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(65% 60% at 50% 42%, color-mix(in srgb, var(--app-accent) 12%, transparent), transparent 72%)" }} />
      </div>

      {/* Top scrim — keeps the controls legible over bright video */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-20 h-32 bg-gradient-to-b from-black/55 to-transparent md:absolute" />

      {/* Section tabs — TikTok-style centered text with an active underline */}
      <div className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+4.85rem)] z-30 flex -translate-x-1/2 items-center gap-5 md:absolute md:top-[4.85rem]">
        {([["all", "For You"], ["following", "Following"], ["shots", "Shots"], ["trailers", "Trailers"]] as const).map(([m, label]) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`relative text-[13px] font-bold tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-colors active:scale-95 ${
              mode === m ? "text-foreground" : "text-white/55 hover:text-white/80"
            }`}
          >
            {label}
            {mode === m && <span className="absolute -bottom-1.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-white" />}
          </button>
        ))}
      </div>

      {/* Mute toggle (posting lives in the top-bar + Create menu) */}
      <button
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="fixed right-4 top-[calc(env(safe-area-inset-top)+4.5rem)] z-40 grid h-11 w-11 place-items-center rounded-full bg-black/45 text-foreground backdrop-blur transition-transform duration-200 ease-out hover:bg-black/65 active:scale-95 md:absolute md:right-6 md:top-[4.5rem]"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {composing && (
        <ShotComposer
          onClose={() => setComposing(false)}
          onPosted={() => { setMode("shots"); setActive(0); scrollRef.current?.scrollTo({ top: 0 }); loadShots() }}
        />
      )}

      {/* Usage-awareness check-in (gentle, dismissible — never blocks for long) */}
      {showBreak && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-900 p-7 text-center">
            <p className="text-3xl">🍵</p>
            <h2 className="mt-3 text-lg font-black uppercase italic tracking-tight text-foreground">
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
                className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold uppercase tracking-widest text-white/70 transition-transform duration-200 ease-out hover:text-foreground active:scale-[0.98]">
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
            {mode === "following" ? "Nothing from your follows" : mode === "shots" ? "No shots yet" : mode === "trailers" ? "No trailers yet" : "Nothing here yet"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {mode === "following" ? "Follow some creators and their Shots show up here." : mode === "shots" ? "Be the first to post a short vertical clip." : "Check back soon."}
          </p>
        </div>
      )}

      {feed.map((item, idx) => (
        <div
          key={item.kind === "shot" ? item.shot.id : `t-${item.trailer.malId}`}
          className="relative z-[1] flex h-full w-full snap-start snap-always items-center justify-center p-0 md:p-4"
        >
          {item.kind === "shot" ? (
            <ShotReel shot={item.shot} active={active === idx} near={Math.abs(idx - active) <= 1} muted={muted}
              onNotInterested={(id) => setShots((prev) => prev.filter((s) => s.id !== id))} />
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
  // Full-bleed edge-to-edge on phones (real TikTok-style reel); a centered,
  // rounded phone-width card on desktop.
  return <div className="relative h-full w-full overflow-hidden bg-background md:aspect-[9/16] md:max-h-full md:w-auto md:rounded-3xl md:ring-1 md:ring-white/10 md:shadow-[0_24px_70px_rgba(0,0,0,0.65)]">{children}</div>
}

function ShotReel({ shot, active, near, muted, onNotInterested }: { shot: Shot; active: boolean; near: boolean; muted: boolean; onNotInterested?: (id: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [buffering, setBuffering] = useState(false)
  const me = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { push } = useToast()
  const showAuthPrompt = useAuthPrompt((s) => s.show)

  const [liked, setLiked] = useState(shot.isLikedByMe)
  const [likes, setLikes] = useState(shot._count.likes)
  const [saved, setSaved] = useState(shot.isSavedByMe ?? false)
  const [saves, setSaves] = useState(shot._count.saves ?? 0)
  const [comments, setComments] = useState(shot._count.comments ?? 0)
  const [views, setViews] = useState(shot.viewCount ?? 0)
  const viewedRef = useRef(false) // fire the view beacon at most once per shot per session
  const skippedRef = useRef(false)        // fire the SKIP beacon at most once
  const activeSinceRef = useRef<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [following, setFollowing] = useState(shot.authorFollowedByMe ?? false)
  const [showComments, setShowComments] = useState(false)
  const [likeBusy, setLikeBusy] = useState(false)
  const [saveBusy, setSaveBusy] = useState(false)
  const [followBusy, setFollowBusy] = useState(false)
  const isEmbed = Boolean(shot.embedUrl)

  // Playback state (native <video> only) — drives the visible play/pause control
  // and the accessible seek bar.
  const reducedMotion = usePrefersReducedMotion()
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)   // 0..1
  const [duration, setDuration] = useState(0)
  const [captionExpanded, setCaptionExpanded] = useState(false)

  const authorId = shot.authorId ?? shot.author.id
  const mine = me?.id === authorId

  useEffect(() => {
    const v = videoRef.current
    if (!v || isEmbed) return
    // Reduced-motion: never autoplay — render the active reel paused so the user
    // chooses to start it (WCAG 2.2.2). Otherwise autoplay the active reel.
    if (active && !reducedMotion) v.play().catch(() => {})
    else { v.pause(); if (!active) v.currentTime = 0 }
  }, [active, isEmbed, reducedMotion])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {}); else v.pause()
  }, [])

  const onSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current
    if (!v || !isFinite(v.duration)) return
    v.currentTime = (Number(e.target.value) / 1000) * v.duration
  }, [])

  // ── View counting (see backend docs/shots-view-counting.md) ──
  // Reels-style "it played" qualification: count a view once the clip has been
  // watched ≥2s (or ≥50% for clips < 4s). Fires at most once per shot per
  // session; the server dedupes per viewer per day and skips the author's own
  // views, so this is safe to call optimistically.
  const qualifyView = useCallback((watchedMs: number) => {
    if (viewedRef.current || mine) return
    viewedRef.current = true
    recordShotView(shot.id, getViewerKey(), Math.round(watchedMs))
      .then((r) => { if (r.counted) setViews(r.viewCount) })
      .catch(() => { viewedRef.current = false }) // allow a retry on transient failure
  }, [shot.id, mine])

  // Native <video>: qualify from the playhead as it advances.
  const onVideoTime = useCallback(() => {
    const v = videoRef.current
    if (!v || !active) return
    if (isFinite(v.duration) && v.duration > 0) setProgress(v.currentTime / v.duration)
    if (viewedRef.current) return
    const dur = isFinite(v.duration) && v.duration > 0 ? v.duration : 4
    const need = Math.min(2, dur * 0.5) // ≥2s, or ≥50% for very short clips
    if (v.currentTime >= need) qualifyView(v.currentTime * 1000)
  }, [active, qualifyView])

  // Embeds (TikTok/IG iframes — no playhead access): best-effort 2s active timer.
  useEffect(() => {
    if (!isEmbed || !active || viewedRef.current) return
    const t = setTimeout(() => qualifyView(2000), 2000)
    return () => clearTimeout(t)
  }, [isEmbed, active, qualifyView])

  // Negative signal — fast scroll-away. If the reel was on screen only briefly
  // and never qualified as a view, record an implicit SKIP (feeds the ranker's
  // suppression loop). Fires once per shot.
  useEffect(() => {
    if (active) { activeSinceRef.current = Date.now(); return }
    const started = activeSinceRef.current
    activeSinceRef.current = null
    if (started && !viewedRef.current && !skippedRef.current && !mine) {
      const elapsed = Date.now() - started
      if (elapsed > 300 && elapsed < 2500) {
        skippedRef.current = true
        recordShotFeedback(shot.id, getViewerKey(), "SKIP", elapsed).catch(() => {})
      }
    }
  }, [active, shot.id, mine])

  function notInterested() {
    setMenuOpen(false)
    recordShotFeedback(shot.id, getViewerKey(), "NOT_INTERESTED").catch(() => {})
    push("Got it — we'll show fewer like this", "success")
    onNotInterested?.(shot.id)
  }

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

  // Shared action rail — rendered overlaid on the video on mobile (dark chips +
  // icon halos) and OFF the video in the desktop right gutter (solid surface-2
  // chips, no overlay-contrast problem). Same handlers/state either way.
  const railChip = (gutter: boolean) =>
    gutter
      ? "grid h-12 w-12 place-items-center rounded-full bg-surface-2 border border-border"
      : "grid h-12 w-12 place-items-center rounded-full bg-black/40 backdrop-blur [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.9))]"
  const railLabel = (gutter: boolean) =>
    gutter ? "text-[11px] font-semibold tabular-nums text-muted" : "text-[11px] font-semibold tabular-nums text-foreground drop-shadow"
  const railBtn = "flex flex-col items-center gap-1 text-foreground transition-transform duration-200 ease-out active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl"

  const renderRail = (gutter: boolean) => (
    <div className={gutter ? "flex flex-col items-center gap-5" : "absolute bottom-28 right-3 z-10 flex flex-col items-center gap-4 md:hidden"}>
      <div className="flex flex-col items-center gap-1 text-foreground">
        <span className={railChip(gutter)}>
          <HeartLike liked={liked} onToggle={toggleLike} size={26} ariaLabel={liked ? "Unlike" : "Like"} />
        </span>
        <span className={railLabel(gutter)}>{likes > 0 ? compact(likes) : "Like"}</span>
      </div>
      <button onClick={openComments} aria-label="Comments" className={railBtn}>
        <span className={railChip(gutter)}><MessageCircle size={26} /></span>
        <span className={railLabel(gutter)}>{comments > 0 ? compact(comments) : "Comment"}</span>
      </button>
      <button onClick={toggleSave} aria-pressed={saved} aria-label={saved ? "Unsave" : "Save"} className={railBtn}>
        <span className={railChip(gutter)}><Bookmark size={25} className={saved ? "fill-accent-bright text-accent-bright" : ""} /></span>
        <span className={railLabel(gutter)}>{saves > 0 ? compact(saves) : "Save"}</span>
      </button>
      <button onClick={share} aria-label="Share" className={railBtn}>
        <span className={railChip(gutter)}><Share2 size={26} /></span>
        <span className={railLabel(gutter)}>Share</span>
      </button>
      <button onClick={() => push("Captions for Shots are coming soon", "info")} aria-label="Captions (unavailable)" className={railBtn}>
        <span className={railChip(gutter)}><Captions size={24} /></span>
        <span className={railLabel(gutter)}>CC</span>
      </button>
      {!mine && (
        <div className="relative flex flex-col items-center">
          <button onClick={() => setMenuOpen((o) => !o)} aria-label="More" aria-expanded={menuOpen}
            className={`${railChip(gutter)} text-foreground transition-transform duration-200 ease-out active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}>
            <MoreHorizontal size={26} />
          </button>
          {menuOpen && (
            <>
              <button aria-hidden onClick={() => setMenuOpen(false)} className="fixed inset-0 z-10 cursor-default" />
              <div className="absolute bottom-14 right-0 z-20 w-44 overflow-hidden rounded-2xl border border-border bg-black/85 backdrop-blur-xl shadow-2xl">
                <button onClick={notInterested}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] font-semibold text-foreground transition-colors hover:bg-white/10">
                  <EyeOff size={16} className="shrink-0" /> Not interested
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="relative flex h-full items-center justify-center gap-3 md:gap-5">
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
          src={playableVideoUrl(shot.videoUrl)}
          poster={shot.thumbnailUrl ?? undefined}
          muted={muted}
          loop
          playsInline
          // Preload the active clip AND the next/previous one so scrolling is
          // instant; far-off reels don't fetch (saves data + reduces stalls).
          preload={near ? "auto" : "none"}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
          onCanPlay={() => setBuffering(false)}
          onTimeUpdate={onVideoTime}
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onClick={togglePlay}
          className="h-full w-full object-cover"
        />
      )}
      {!isEmbed && active && buffering && (
        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center">
          <Loader2 className="animate-spin text-white/80 drop-shadow" size={34} />
        </div>
      )}
      {!isEmbed && <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />}

      {/* Visible, keyboard-reachable play/pause (WCAG 2.2.2). Prominent when
          paused; otherwise only shows on keyboard focus so it doesn't cover the
          clip. Tapping the video also toggles. */}
      {!isEmbed && active && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={paused ? "Play" : "Pause"}
          className={`absolute left-1/2 top-1/2 z-10 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-foreground backdrop-blur transition-opacity duration-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${paused ? "opacity-100" : "opacity-0"}`}
        >
          {paused ? <Play size={30} className="ml-1 fill-current" /> : <Pause size={28} className="fill-current" />}
        </button>
      )}

      {/* Accessible seek bar (WCAG 4.1.2 — native range, not a bare div). Gold
          fill via accent-color. Stops propagation so dragging doesn't toggle
          play; arrow keys adjust position (feed nav ignores focused inputs). */}
      {!isEmbed && active && duration > 0 && (
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(progress * 1000)}
          onChange={onSeek}
          onClick={(e) => e.stopPropagation()}
          aria-label="Playback position"
          className="absolute inset-x-0 bottom-0 z-20 h-1 w-full cursor-pointer appearance-none bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          style={{ accentColor: "var(--app-accent)" }}
        />
      )}

      {/* Mobile/overlay action rail — on the video, dark chips + icon halos */}
      {renderRail(false)}

      <div className="absolute inset-x-0 bottom-0 p-4 pr-20 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <Link href={`/u/${shot.author.username}`} className="inline-flex max-w-full items-center gap-2 transition-transform duration-200 ease-out active:scale-[0.98]">
            {shot.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shot.author.avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full border border-white/30 object-cover" />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-black text-foreground">{shot.author.displayName?.[0]?.toUpperCase() ?? "?"}</span>
            )}
            <span className="truncate text-sm font-bold text-foreground">@{shot.author.username}</span>
          </Link>
          {!mine && !following && (
            <button
              onClick={toggleFollow}
              disabled={followBusy}
              className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-white/60 px-2.5 py-0.5 text-[11px] font-bold text-foreground transition-transform duration-200 ease-out active:scale-95 disabled:opacity-50"
            >
              <Plus size={11} strokeWidth={3} /> Follow
            </button>
          )}
        </div>
        {shot.caption && (
          <div className="mt-2">
            <p className={`text-[13px] leading-snug text-foreground ${captionExpanded ? "" : "line-clamp-2"}`}>{shot.caption}</p>
            {shot.caption.length > 80 && (
              <button
                type="button"
                onClick={() => setCaptionExpanded((v) => !v)}
                aria-expanded={captionExpanded}
                className="mt-0.5 text-[12px] font-bold text-accent-bright transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
              >
                {captionExpanded ? "less" : "more"}
              </button>
            )}
          </div>
        )}
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-muted">
          <Eye size={13} aria-hidden /> <span className="tabular-nums">{compact(views)}</span> {views === 1 ? "view" : "views"}
        </p>
        {shot.anime && (
          <Link href={`/anime/${shot.anime.malId}`} className="mt-2 inline-block max-w-full truncate rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground transition-transform duration-200 ease-out active:scale-95">
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

      {/* Desktop gutter rail — lives in the void beside the video on solid
          chips, so the controls never fight a bright frame (spec §2.2). */}
      <div className="hidden md:flex">{renderRail(true)}</div>
    </div>
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
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-background shadow-2xl ring-1 ring-white/10">
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
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-foreground backdrop-blur"><Play size={20} className="ml-0.5 fill-white" /></span>
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
          <h3 className="line-clamp-2 text-base font-black leading-tight tracking-tight text-foreground transition-colors hover:text-foreground sm:text-lg">{trailer.title}</h3>
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-white/80">
          {trailer.score != null && <span className="inline-flex items-center gap-1"><Star size={12} className="fill-accent-bright text-accent-bright" />{trailer.score.toFixed(1)}</span>}
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
