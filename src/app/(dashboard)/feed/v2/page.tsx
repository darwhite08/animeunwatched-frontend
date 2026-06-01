"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, MessageCircle, Repeat2, ArrowUp } from "lucide-react"
import {
  useActivityFeed, useLikeActivity, useUnlikeActivity,
  useRepostActivity, useUnrepostActivity, useCreateActivity,
} from "@/hooks/useActivityFeed"
import type { Activity } from "@/lib/api/types"
import type { FeedType } from "@/lib/api/endpoints"
import { useAuthStore } from "@/stores/auth.store"

const FEED_TABS: { id: FeedType; label: string }[] = [
  { id: "global",    label: "Global"    },
  { id: "following", label: "Following" },
]

/* ──────────────────────────────────────────────────────────────────────── */

function ActivityCard({ a }: { a: Activity }) {
  const like     = useLikeActivity()
  const unlike   = useUnlikeActivity()
  const repost   = useRepostActivity()
  const unrepost = useUnrepostActivity()
  const handle   = a.author.slug ?? a.author.username

  const toggleLike   = () => (a.isLikedByMe   ? unlike.mutate(a.id)   : like.mutate(a.id))
  const toggleRepost = () => (a.isRepostedByMe ? unrepost.mutate(a.id) : repost.mutate({ id: a.id }))

  return (
    <article className="p-5 rounded-2xl bg-surface border border-border hover:border-accent/25 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-surface-2 border border-border overflow-hidden flex items-center justify-center shrink-0">
          {a.author.avatarUrl
            ? <Image src={a.author.avatarUrl} alt={a.author.displayName} width={40} height={40} className="object-cover" />
            : <span className="font-black text-foreground">{a.author.displayName[0]}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/u/${handle}`} className="font-bold text-foreground hover:text-accent transition-colors text-sm">
            {a.author.displayName}
          </Link>
          <div className="text-[11px] text-subtle font-mono uppercase tracking-widest">
            @{a.author.username} · {new Date(a.createdAt).toLocaleDateString()}
          </div>
        </div>
        {a.kind !== "TEXT" && (
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/30">
            {a.kind === "LIST_UPDATE" ? a.verb?.replace(/_/g, " ") : "MESSAGE"}
          </span>
        )}
      </div>

      {/* Linked anime (list update) */}
      {a.linkedAnime && (
        <Link href={`/anime/${a.linkedAnime.malId}`} className="flex items-center gap-3 p-3 mb-3 rounded-xl bg-surface-2 border border-border hover:border-accent/30 transition-colors">
          {a.linkedAnime.imageUrl && (
            <Image src={a.linkedAnime.imageUrl} alt={a.linkedAnime.title} width={44} height={62} className="rounded-md object-cover" />
          )}
          <div className="min-w-0">
            <div className="text-sm font-bold text-foreground line-clamp-1">{a.linkedAnime.title}</div>
            {a.episodeNumber && (
              <div className="text-[11px] font-mono uppercase tracking-widest text-subtle mt-1">Episode {a.episodeNumber}</div>
            )}
            {a.score && (
              <div className="text-[11px] font-mono uppercase tracking-widest text-accent mt-1">Rated {a.score}/10</div>
            )}
          </div>
        </Link>
      )}

      {/* Body */}
      {a.body && (
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-4">{a.body}</p>
      )}

      {/* Engagement */}
      <div className="flex items-center gap-5 text-xs text-muted">
        <button onClick={toggleLike} className="flex items-center gap-1.5 group hover:text-accent transition-colors disabled:opacity-50"
          disabled={like.isPending || unlike.isPending}>
          <Heart size={15} className={a.isLikedByMe ? "fill-accent text-accent" : "group-hover:fill-accent/20"} />
          <span className="tabular-nums">{a.likeCount}</span>
        </button>
        <button onClick={toggleRepost} className="flex items-center gap-1.5 hover:text-accent transition-colors disabled:opacity-50"
          disabled={repost.isPending || unrepost.isPending}>
          <Repeat2 size={15} className={a.isRepostedByMe ? "text-accent" : ""} />
          <span className="tabular-nums">{a.repostCount}</span>
        </button>
        <Link href={`/posts/${a.id}`} className="flex items-center gap-1.5 hover:text-accent transition-colors">
          <MessageCircle size={15} />
          <span className="tabular-nums">{a.replyCount}</span>
        </Link>
      </div>
    </article>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */

function Composer() {
  const [body, setBody] = useState("")
  const create = useCreateActivity()
  const user   = useAuthStore(s => s.user)

  if (!user) return null

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    create.mutate(
      { kind: "TEXT", body: text },
      { onSuccess: () => setBody("") },
    )
  }

  return (
    <form onSubmit={submit} className="p-4 rounded-2xl bg-surface border border-border space-y-3">
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="What's on your mind?"
        maxLength={2000}
        rows={3}
        className="w-full bg-transparent text-sm text-foreground placeholder:text-subtle resize-none focus:outline-none"
      />
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">{body.length}/2000</span>
        <button type="submit" disabled={!body.trim() || create.isPending}
          className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-black bg-accent hover:bg-accent-bright disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          {create.isPending ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */

function ActivitySkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-surface border border-border space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-2" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 bg-surface-2 rounded" />
          <div className="h-2 w-20 bg-surface-2 rounded" />
        </div>
      </div>
      <div className="h-3 w-full bg-surface-2 rounded" />
      <div className="h-3 w-4/5 bg-surface-2 rounded" />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────── */

export default function FeedV2Page() {
  const [tab, setTab] = useState<FeedType>("global")
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useActivityFeed(tab)

  // Infinite scroll via intersection observer
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage() },
      { rootMargin: "200px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Back-to-top
  const [showTop, setShowTop] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const activities = data?.pages.flatMap(p => p.data) ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5 pb-32">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent/70">Feed · §12 MVP</p>
        <h1 className="text-3xl font-black tracking-tighter text-foreground italic uppercase mt-1">Activity</h1>
      </header>

      <Composer />

      <nav className="flex gap-2 border-b border-border pb-3">
        {FEED_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors ${
              tab === t.id ? "bg-accent text-black" : "text-muted hover:text-foreground hover:bg-surface"
            }`}>
            {t.label}
          </button>
        ))}
      </nav>

      <section className="space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <ActivitySkeleton key={i} />)
          : activities.length === 0
            ? <div className="p-8 rounded-2xl bg-surface border border-border text-center text-sm text-muted">No activity yet.</div>
            : activities.map(a => <ActivityCard key={a.id} a={a} />)}
        {hasNextPage && <div ref={sentinelRef} className="py-6 text-center text-xs text-subtle font-mono uppercase tracking-widest">
          {isFetchingNextPage ? "Loading more…" : "Scroll for more"}
        </div>}
      </section>

      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 right-6 w-11 h-11 rounded-full bg-accent text-black grid place-items-center shadow-lg hover:bg-accent-bright transition-colors"
          aria-label="Back to top">
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  )
}
