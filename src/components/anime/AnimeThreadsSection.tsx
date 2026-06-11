"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Pin, MessageSquare, ChevronRight, Loader2, X, Sparkles } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated } from "@/lib/api/types"
import { useCreateAnimeThread } from "@/hooks/useThreads"
import { useAuthStore } from "@/stores/auth.store"
import { getSocket } from "@/lib/socket"
import { Avatar } from "@/components/ui/Avatar"
import { VerifiedBadge } from "@/components/social/VerifiedBadge"

type VerifiedKind = "USER" | "CREATOR" | "STUDIO" | null | undefined

type ApiThread = {
  id: string
  title: string
  content: string
  isPinned: boolean
  createdAt: string
  author: { username: string; displayName: string; avatarUrl: string | null; verifiedKind?: VerifiedKind }
  _count?: { replies: number }
}

type Thread = {
  id: string
  title: string
  author: string
  authorAvatar: string | null
  authorVerified: VerifiedKind
  replies: number
  isPinned: boolean
  lastActivity: string
  excerpt: string
}

const FILTERS = ["All", "Pinned", "Spoilers"] as const
type Filter = (typeof FILTERS)[number]

function hasSpoiler(title: string) {
  return title.toUpperCase().includes("SPOILER")
}

function relativeTime(iso: string): string {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 60000) return "just now"
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`
  return `${Math.floor(d / 86400000)}d ago`
}

interface AnimeThreadsSectionProps {
  animeId: string
  animeTitle: string
}

export function AnimeThreadsSection({ animeId, animeTitle }: AnimeThreadsSectionProps) {
  const { push } = useToast()
  const qc = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [activeFilter, setActiveFilter] = useState<Filter>("All")
  const [composing, setComposing] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const queryKey = ["anime-threads", animeId] as const

  // Real threads for this anime. Poll every 25s so logged-out visitors (no
  // socket) still see new discussions appear near-real-time; refetch on focus.
  const { data: apiData, isLoading } = useQuery({
    queryKey,
    queryFn: () => api<Paginated<ApiThread>>(`/anime/${animeId}/threads`),
    enabled: !!animeId,
    refetchInterval: 25_000,
    refetchOnWindowFocus: true,
  })

  // Realtime: join this anime's room and prepend any thread started by others.
  useEffect(() => {
    if (!animeId) return
    const room = `anime:${animeId}`
    const join = () => {
      const s = getSocket()
      if (!s) { retry = setTimeout(join, 600); return }
      s.emit("room:join", room)
      s.on("anime-thread.new", onNew)
    }
    const onNew = (payload: { malId?: number; thread?: ApiThread }) => {
      const incoming = payload?.thread
      if (!incoming) { void qc.invalidateQueries({ queryKey }); return }
      qc.setQueryData<Paginated<ApiThread>>(queryKey, (prev) => {
        if (!prev) return prev
        if (prev.data.some((t) => t.id === incoming.id)) return prev
        return {
          ...prev,
          data: [incoming, ...prev.data],
          meta: { ...prev.meta, total: prev.meta.total + 1 },
        }
      })
    }
    let retry: ReturnType<typeof setTimeout> | null = null
    join()
    return () => {
      if (retry) clearTimeout(retry)
      const s = getSocket()
      if (s) { s.off("anime-thread.new", onNew); s.emit("room:leave", room) }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId])

  const createThread = useCreateAnimeThread(animeId)

  const threads: Thread[] = (apiData?.data ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    author: t.author?.displayName ?? t.author?.username ?? "Anonymous",
    authorAvatar: t.author?.avatarUrl ?? null,
    authorVerified: t.author?.verifiedKind,
    replies: t._count?.replies ?? 0,
    isPinned: t.isPinned,
    lastActivity: relativeTime(t.createdAt),
    excerpt: t.content.slice(0, 100),
  }))

  const filtered = threads.filter((t) => {
    if (activeFilter === "All") return true
    if (activeFilter === "Pinned") return t.isPinned
    if (activeFilter === "Spoilers") return hasSpoiler(t.title)
    return true
  })

  function openComposer() {
    if (!isAuthenticated) {
      push("Sign in to start a discussion.", "info")
      return
    }
    setComposing((c) => !c)
  }

  async function submitThread(e: React.FormEvent) {
    e.preventDefault()
    if (title.trim().length < 3) { push("Give your thread a title (min 3 characters).", "error"); return }
    if (content.trim().length < 10) { push("Add a bit more detail (min 10 characters).", "error"); return }
    try {
      await createThread.mutateAsync({ title: title.trim(), content: content.trim() })
      setTitle(""); setContent(""); setComposing(false)
      push("Discussion started!", "success")
    } catch {
      push("Couldn't start the thread. Try again.", "error")
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">
          Discussion Threads
        </h2>
        <button
          onClick={openComposer}
          className="text-[10px] font-black uppercase tracking-widest text-accent-bright hover:text-accent-bright transition-colors flex items-center gap-1.5"
        >
          {composing ? <X size={11} /> : <MessageSquare size={11} />} {composing ? "Cancel" : "Start Thread"}
        </button>
      </div>

      {/* Composer */}
      {composing && (
        <form onSubmit={submitThread} className="mb-4 p-4 rounded-2xl bg-surface border border-border space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder={`Start a discussion about ${animeTitle}…`}
            className="w-full bg-transparent text-sm font-bold text-foreground placeholder:text-subtle outline-none"
            autoFocus
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={20000}
            rows={3}
            placeholder="What's on your mind? Add 'spoiler' to the title to flag spoilers."
            className="w-full bg-transparent text-sm text-muted placeholder:text-subtle outline-none resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-subtle">{title.length}/120</span>
            <button
              type="submit"
              disabled={createThread.isPending}
              className="px-4 py-1.5 rounded-full bg-accent text-black text-[10px] font-black uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
            >
              {createThread.isPending ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
              Post Thread
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
              activeFilter === f
                ? "bg-accent border-accent text-black"
                : "bg-surface border-border text-subtle hover:text-muted hover:border-border"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Thread list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[68px] rounded-2xl bg-surface border border-border animate-pulse" />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="py-8 text-center rounded-2xl bg-surface border border-border border-dashed">
            <MessageSquare size={20} className="mx-auto text-subtle mb-2" />
            <p className="text-sm font-bold text-muted">No discussions yet</p>
            <p className="text-[11px] text-subtle mt-1 mb-3">Be the first to start a thread about {animeTitle}.</p>
            <button
              onClick={openComposer}
              className="px-4 py-1.5 rounded-full bg-accent text-black text-[10px] font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Start the conversation
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-subtle py-4 text-center">No threads match this filter.</p>
        ) : (
          filtered.map((thread) => (
            <Link
              key={thread.id}
              href={`/threads/${thread.id}`}
              className="flex items-start gap-3 p-4 rounded-2xl bg-surface border border-border hover:border-border hover:bg-surface transition-all group"
            >
              {/* Pin icon */}
              <div className="shrink-0 mt-0.5">
                {thread.isPinned ? (
                  <Pin size={12} className="text-accent-bright" />
                ) : (
                  <div className="w-3" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <p className="text-sm font-bold text-muted group-hover:text-foreground transition-colors truncate max-w-[280px]">
                    {thread.title}
                  </p>
                  {hasSpoiler(thread.title) && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-black uppercase tracking-wider text-red-400 shrink-0">
                      Spoiler
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-subtle">
                  <Avatar src={thread.authorAvatar} name={thread.author} size={16} />
                  <span className="text-muted font-bold">{thread.author}</span>
                  <VerifiedBadge kind={thread.authorVerified} size={11} />
                  <span>· {thread.lastActivity}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 shrink-0 text-subtle text-[10px] font-bold">
                <span className="flex items-center gap-1">
                  <MessageSquare size={10} /> {thread.replies}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer link */}
      {threads.length > 0 && (
        <Link
          href="/community"
          className="mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-accent-bright/70 hover:text-accent-bright transition-colors"
        >
          View All Discussions <ChevronRight size={11} />
        </Link>
      )}
    </div>
  )
}
