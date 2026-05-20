"use client"

import { useState } from "react"
import Link from "next/link"
import { Pin, MessageSquare, Eye, ChevronRight } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated } from "@/lib/api/types"

type Thread = {
  id: string
  title: string
  author: string
  replies: number
  views: number
  isPinned: boolean
  lastActivity: string
  excerpt: string
}

const FILTERS = ["All", "Pinned", "Spoilers", "Guides"] as const
type Filter = (typeof FILTERS)[number]

function buildThreads(animeTitle: string): Thread[] {
  return [
    {
      id: "t1",
      title: `Episode 24 Discussion — [SPOILERS]`,
      author: "NeuralBot_X",
      replies: 142,
      views: 2100,
      isPinned: true,
      lastActivity: "2h ago",
      excerpt: `Share your thoughts on episode 24 of ${animeTitle}. Full spoilers allowed in this thread.`,
    },
    {
      id: "t2",
      title: `Power Scaling Thread: How does ${animeTitle} compare?`,
      author: "Otaku_Arch",
      replies: 58,
      views: 940,
      isPinned: false,
      lastActivity: "5h ago",
      excerpt: `Let's rank the characters and compare power levels against other top-tier anime universes.`,
    },
    {
      id: "t3",
      title: "Hidden details you might have missed — masterpost",
      author: "ShadowWatcher",
      replies: 91,
      views: 1450,
      isPinned: false,
      lastActivity: "1d ago",
      excerpt: `A curated collection of blink-and-you-miss-it details, foreshadowing, and easter eggs.`,
    },
    {
      id: "t4",
      title: `Beginner's Guide to ${animeTitle} — where to start`,
      author: "Frieren_Fan",
      replies: 34,
      views: 760,
      isPinned: false,
      lastActivity: "3d ago",
      excerpt: `New to the series? This guide covers watch order, context, and what to expect.`,
    },
  ]
}

function hasSpoiler(title: string) {
  return title.toUpperCase().includes("SPOILER")
}

function formatViews(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

interface AnimeThreadsSectionProps {
  animeId: string
  animeTitle: string
}

export function AnimeThreadsSection({ animeId, animeTitle }: AnimeThreadsSectionProps) {
  const { push } = useToast()
  const [activeFilter, setActiveFilter] = useState<Filter>("All")

  // Try real API threads for this anime
  const { data: apiData } = useQuery({
    queryKey: ["anime-threads", animeId],
    queryFn: () => api<Paginated<{ id: string; title: string; content: string; isPinned: boolean; createdAt: string; author: { username: string; displayName: string }; _count?: { replies: number } }>>(`/anime/${animeId}/threads`),
    enabled: !!animeId,
  })

  const apiThreads = (apiData?.data ?? []).map(t => ({
    id: t.id,
    title: t.title,
    author: t.author?.displayName ?? t.author?.username ?? "Anonymous",
    replies: t._count?.replies ?? 0,
    views: 0,
    isPinned: t.isPinned,
    lastActivity: (() => { const d = Date.now() - new Date(t.createdAt).getTime(); return d < 3600000 ? `${Math.floor(d/60000)}m ago` : d < 86400000 ? `${Math.floor(d/3600000)}h ago` : `${Math.floor(d/86400000)}d ago` })(),
    excerpt: t.content.slice(0, 100) + "…",
  }))

  const threads = apiThreads.length > 0 ? apiThreads : buildThreads(animeTitle)

  const filtered = threads.filter((t) => {
    if (activeFilter === "All") return true
    if (activeFilter === "Pinned") return t.isPinned
    if (activeFilter === "Spoilers") return hasSpoiler(t.title)
    if (activeFilter === "Guides") return t.title.toLowerCase().includes("guide") || t.title.toLowerCase().includes("beginner")
    return true
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
          Discussion Threads
        </h2>
        <button
          onClick={() => push("Coming soon! Join a club to start discussions.", "info")}
          className="text-[10px] font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
        >
          <MessageSquare size={11} /> Start Thread
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
              activeFilter === f
                ? "bg-amber-500 border-amber-400 text-black"
                : "bg-white/[0.03] border-white/8 text-white/35 hover:text-white/60 hover:border-white/15"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Thread list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-white/25 py-4 text-center">No threads match this filter.</p>
        ) : (
          filtered.map((thread) => (
            <Link
              key={thread.id}
              href={`/threads/${thread.id}`}
              className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 hover:bg-white/[0.04] transition-all group"
            >
              {/* Pin icon */}
              <div className="shrink-0 mt-0.5">
                {thread.isPinned ? (
                  <Pin size={12} className="text-amber-400" />
                ) : (
                  <div className="w-3" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <p className="text-sm font-bold text-white/75 group-hover:text-white transition-colors truncate max-w-[280px]">
                    {thread.title}
                  </p>
                  {hasSpoiler(thread.title) && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-black uppercase tracking-wider text-red-400 shrink-0">
                      Spoiler
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/25 mt-0.5">
                  by <span className="text-white/40">{thread.author}</span> · {thread.lastActivity}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 shrink-0 text-white/25 text-[10px] font-bold">
                <span className="flex items-center gap-1">
                  <MessageSquare size={10} /> {thread.replies}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={10} /> {formatViews(thread.views)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer link */}
      <Link
        href="/community"
        className="mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400/70 hover:text-amber-400 transition-colors"
      >
        View All Discussions <ChevronRight size={11} />
      </Link>
    </div>
  )
}
