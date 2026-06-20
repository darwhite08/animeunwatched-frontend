"use client"

import { use, useState } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { MessageSquare, ChevronLeft, Send, Loader2, Lock } from "lucide-react"
import { useAnime } from "@/hooks/useAnime"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Thread } from "@/lib/api/types"

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 60000) return "just now"
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`
  return `${Math.floor(d / 86400000)}d ago`
}

export default function AnimeDiscussPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const malId = Number(id)
  const sp = useSearchParams()
  const ep = sp.get("ep")
  const { push } = useToast()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const qc = useQueryClient()

  const { data: animeData } = useAnime(malId > 0 ? malId : 0)
  const anime = animeData?.anime
  const [draft, setDraft] = useState("")

  const threadKey = ep ? `ep-${ep}` : "general"
  const title = ep
    ? `Episode ${ep} Discussion — ${anime?.title ?? "Anime"}`
    : `General Discussion — ${anime?.title ?? "Anime"}`

  // Fetch threads for this anime + episode
  const { data: threadsData, isLoading } = useQuery({
    queryKey: ["anime-ep-threads", id, ep],
    queryFn: () => api<{ data: Thread[] }>(`/threads?animeId=${id}&tag=${threadKey}&limit=50`),
    enabled: !!id,
  })

  const threads = threadsData?.data ?? []

  const createThread = useMutation({
    mutationFn: () => api<{ thread: Thread }>(`/anime/${id}/threads`, {
      method: "POST",
      body: JSON.stringify({
        title: ep ? `Ep ${ep} — ${draft.slice(0, 60)}` : draft.slice(0, 80),
        content: draft,
        tags: [threadKey],
      }),
    }),
    onSuccess: () => {
      setDraft("")
      push("Discussion posted!", "success")
      qc.invalidateQueries({ queryKey: ["anime-ep-threads", id, ep] })
    },
    onError: () => push("Failed to post. Try again.", "error"),
  })

  const submit = () => {
    if (!draft.trim()) return
    if (!isAuthenticated) { push("Sign in to post", "info"); return }
    createThread.mutate()
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-32">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-xs text-subtle">
          <Link href={`/anime/${id}`} className="hover:text-foreground transition-colors flex items-center gap-1">
            <ChevronLeft size={13} /> {anime?.title ?? "Anime"}
          </Link>
          <span>/</span>
          <Link href={`/anime/${id}/episodes`} className="hover:text-foreground transition-colors">Episodes</Link>
          {ep && <><span>/</span><span className="text-muted">Ep {ep}</span></>}
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-accent-bright" />
            <p className="text-[9px] font-mono uppercase tracking-[0.4em]"
              style={{ color: "color-mix(in srgb, var(--app-accent) 60%, transparent)" }}>
              {ep ? `Episode ${ep} Discussion` : "Community Discussion"}
            </p>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-foreground leading-tight">
            {ep ? (
              <>Episode <span style={{ color: "var(--app-accent)" }}>{ep}</span><br />Spoiler Chat</>
            ) : (
              <>General<br /><span style={{ color: "var(--app-accent)" }}>Discussion</span></>
            )}
          </h1>
          {ep && (
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-accent-bright/70 font-black uppercase tracking-widest">
              <Lock size={10} /> Spoiler-free posts only — tag spoilers with [spoiler]
            </div>
          )}
        </div>

        {/* Post composer */}
        <div className="mb-8 p-5 rounded-2xl border border-border bg-surface">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit() }}
            placeholder={isAuthenticated
              ? ep
                ? `Share your thoughts on Episode ${ep}… (⌘Enter to post)`
                : "Start a discussion… (⌘Enter to post)"
              : "Sign in to join the discussion"}
            disabled={!isAuthenticated}
            rows={3}
            maxLength={2000}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted resize-none outline-none leading-relaxed disabled:opacity-40"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-[9px] text-subtle font-mono">{2000 - draft.length} chars</span>
            <button onClick={submit} disabled={!draft.trim() || createThread.isPending || !isAuthenticated}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-black transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}>
              {createThread.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Post
            </button>
          </div>
        </div>

        {/* Threads */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-surface animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        )}

        {!isLoading && threads.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-20 text-center border border-dashed border-border rounded-2xl space-y-3">
            <MessageSquare size={28} className="mx-auto text-subtle" />
            <p className="text-subtle font-black uppercase tracking-widest text-xs">
              No discussions yet — be the first!
            </p>
          </motion.div>
        )}

        <div className="space-y-4">
          {threads.map((thread, i) => (
            <motion.div key={thread.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}>
              <Link href={`/threads/${thread.id}`}
                className="block p-5 rounded-2xl border border-border bg-surface hover:border-white/20 hover:bg-surface transition-all group">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-[13px] font-bold text-foreground group-hover:text-foreground transition-colors leading-snug">
                    {thread.title}
                  </p>
                  <span className="text-[9px] text-subtle shrink-0">{timeAgo(thread.createdAt)}</span>
                </div>
                <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">{thread.content}</p>
                <div className="flex items-center gap-4 mt-3 text-[9px] text-subtle font-black uppercase tracking-widest">
                  <span>by {thread.author?.displayName ?? thread.author?.username ?? "?"}</span>
                  <span>{thread._count?.replies ?? 0} replies</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
