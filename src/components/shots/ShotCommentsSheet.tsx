"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Send, Trash2, MessageCircle, Loader2, Pin, X, CornerDownRight } from "lucide-react"
import { HeartLike } from "@/components/ui/HeartLike"
import { VerifiedBadge } from "@/components/social/VerifiedBadge"
import { api } from "@/lib/api/client"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"
import { useAuthPrompt } from "@/stores/authPrompt.store"

type ShotComment = {
  id: string
  body: string
  createdAt: string
  authorId: string
  parentId: string | null
  pinned: boolean
  isAuthor: boolean
  likeCount: number
  likedByMe: boolean
  author: { id: string; username: string; displayName: string | null; avatarUrl: string | null; verifiedKind?: "USER" | "CREATOR" | "STUDIO" | null }
}

function relTime(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return "now"
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  if (s < 604800) return `${Math.floor(s / 86400)}d`
  return `${Math.floor(s / 604800)}w`
}

const commentsKey = (shotId: string) => ["shots/comments", shotId] as const
type Payload = { data: ShotComment[]; meta?: unknown }

export function ShotCommentsSheet({
  shotId,
  shotAuthorId,
  open,
  onClose,
  onCountChange,
}: {
  shotId: string
  shotAuthorId: string
  open: boolean
  onClose: () => void
  onCountChange?: (delta: number) => void
}) {
  const qc = useQueryClient()
  const me = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { push } = useToast()
  const showAuthPrompt = useAuthPrompt((s) => s.show)
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { data, isLoading } = useQuery({
    queryKey: commentsKey(shotId),
    queryFn: () => api<Payload>(`/shots/${shotId}/comments`),
    enabled: open,
  })
  const all = useMemo(() => data?.data ?? [], [data])
  const isShotAuthor = me?.id === shotAuthorId

  // Build a 1-level tree: pinned-first top-level comments, replies oldest-first.
  const tree = useMemo(() => {
    const roots = all.filter((c) => !c.parentId)
    const repliesBy = new Map<string, ShotComment[]>()
    for (const c of all) {
      if (c.parentId) repliesBy.set(c.parentId, [...(repliesBy.get(c.parentId) ?? []), c])
    }
    roots.sort((a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.createdAt) - +new Date(a.createdAt))
    return roots.map((r) => ({ ...r, replies: (repliesBy.get(r.id) ?? []).sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)) }))
  }, [all])

  function patch(updater: (list: ShotComment[]) => ShotComment[]) {
    qc.setQueryData<Payload>(commentsKey(shotId), (old) => (old ? { ...old, data: updater(old.data) } : old))
  }

  async function submit() {
    const body = text.trim()
    if (!body) return
    if (!isAuthenticated) { showAuthPrompt({ subtitle: "Sign in to join the conversation." }); return }
    setBusy(true)
    const parentId = replyTo?.id
    setText("")
    setReplyTo(null)
    onCountChange?.(1)
    try {
      await api(`/shots/${shotId}/comments`, { method: "POST", body: JSON.stringify({ body, parentId }) })
      await qc.invalidateQueries({ queryKey: commentsKey(shotId) })
    } catch {
      onCountChange?.(-1)
      setText(body)
      push("Couldn't post comment", "error")
    } finally {
      setBusy(false)
    }
  }

  async function toggleLike(c: ShotComment) {
    if (!isAuthenticated) { showAuthPrompt({ subtitle: "Sign in to like comments." }); return }
    const next = !c.likedByMe
    patch((list) => list.map((x) => (x.id === c.id ? { ...x, likedByMe: next, likeCount: x.likeCount + (next ? 1 : -1) } : x)))
    try {
      await api(`/shots/comments/${c.id}/like`, { method: next ? "POST" : "DELETE" })
    } catch {
      patch((list) => list.map((x) => (x.id === c.id ? { ...x, likedByMe: !next, likeCount: x.likeCount + (next ? -1 : 1) } : x)))
    }
  }

  async function togglePin(c: ShotComment) {
    const next = !c.pinned
    patch((list) => list.map((x) => (x.id === c.id ? { ...x, pinned: next } : x)))
    try {
      await api(`/shots/comments/${c.id}/pin`, { method: "POST", body: JSON.stringify({ pinned: next }) })
    } catch {
      patch((list) => list.map((x) => (x.id === c.id ? { ...x, pinned: !next } : x)))
      push("Couldn't update pin", "error")
    }
  }

  async function remove(c: ShotComment) {
    const prev = all
    patch((list) => list.filter((x) => x.id !== c.id && x.parentId !== c.id))
    onCountChange?.(-1)
    try {
      await api(`/shots/comments/${c.id}`, { method: "DELETE" })
    } catch {
      qc.setQueryData<Payload>(commentsKey(shotId), (old) => (old ? { ...old, data: prev } : old))
      onCountChange?.(1)
      push("Couldn't delete comment", "error")
    }
  }

  const Row = ({ c, isReply }: { c: ShotComment; isReply?: boolean }) => (
    <li className="flex gap-2.5">
      <Link href={`/u/${c.author.username}`} onClick={onClose} className="shrink-0">
        {c.author.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.author.avatarUrl} alt="" className={`${isReply ? "h-7 w-7" : "h-8 w-8"} rounded-full object-cover`} />
        ) : (
          <span className={`flex ${isReply ? "h-7 w-7" : "h-8 w-8"} items-center justify-center rounded-full bg-white/10 text-xs font-black text-foreground`}>
            {c.author.username[0]?.toUpperCase()}
          </span>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-1 text-xs text-muted">
          <span className="font-semibold text-foreground">@{c.author.username}</span>
          <VerifiedBadge kind={c.author.verifiedKind} size={12} />
          {c.isAuthor && <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-accent-bright">Author</span>}
          {c.pinned && <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider text-accent-bright"><Pin size={9} /> Pinned</span>}
          <span className="text-muted/70">· {relTime(c.createdAt)}</span>
        </p>
        <p className="break-words text-sm text-foreground">{c.body}</p>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted">
          <span className={`inline-flex items-center gap-1 ${c.likedByMe ? "text-rose-400" : ""}`}>
            <HeartLike liked={c.likedByMe} onToggle={() => toggleLike(c)} size={15} /> {c.likeCount > 0 ? c.likeCount : ""}
          </span>
          <button onClick={() => { setReplyTo({ id: c.id, name: c.author.username }); }} className="font-semibold transition-colors hover:text-foreground">
            Reply
          </button>
          {isShotAuthor && (
            <button onClick={() => togglePin(c)} className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
              <Pin size={12} /> {c.pinned ? "Unpin" : "Pin"}
            </button>
          )}
          {(me?.id === c.authorId || isShotAuthor) && (
            <button onClick={() => remove(c)} aria-label="Delete" className="transition-colors hover:text-rose-400">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </li>
  )

  if (!mounted || !open) return null

  const body = (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-black uppercase tracking-widest text-foreground">Comments</span>
        <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent" size={22} /></div>
        ) : tree.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-muted">
            <MessageCircle size={28} />
            <p className="text-sm font-semibold">No comments yet</p>
            <p className="text-xs text-muted/70">Be the first to say something.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {tree.map((c) => (
              <li key={c.id}>
                <ul><Row c={c} /></ul>
                {c.replies.length > 0 && (
                  <ul className="ml-7 mt-3 space-y-3 border-l border-border pl-3">
                    {c.replies.map((r) => <Row key={r.id} c={r} isReply />)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {replyTo && (
        <div className="flex items-center justify-between gap-2 border-t border-border bg-surface-2 px-4 py-1.5 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><CornerDownRight size={12} /> Replying to <b className="text-foreground">@{replyTo.name}</b></span>
          <button onClick={() => setReplyTo(null)} aria-label="Cancel reply" className="hover:text-foreground"><X size={14} /></button>
        </div>
      )}

      <div className="flex items-end gap-2 border-t border-border bg-background px-3 py-2.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit() } }}
          placeholder={isAuthenticated ? (replyTo ? `Reply to @${replyTo.name}…` : "Add a comment…") : "Sign in to comment"}
          className="h-10 flex-1 rounded-full bg-white/5 px-4 text-base text-foreground outline-none ring-1 ring-white/10 placeholder:text-muted/60 focus:ring-accent/40"
        />
        <button onClick={submit} disabled={!text.trim() || busy} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-black transition-opacity disabled:opacity-40">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  )

  // Mobile: bottom sheet with a dimming backdrop. Desktop: a panel docked to the
  // RIGHT of the shot (YouTube-style) — no full backdrop so the reel stays visible.
  return createPortal(
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] md:bg-transparent md:pointer-events-none">
        {/* backdrop — mobile only */}
        <div className="absolute inset-0 bg-black/60 md:hidden" onClick={onClose} />
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 36 }}
          className="absolute inset-x-0 bottom-0 h-[72dvh] overflow-hidden rounded-t-3xl border-t border-border md:pointer-events-auto md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-[400px] md:rounded-none md:border-l md:border-t-0 md:pt-14"
          onClick={(e) => e.stopPropagation()}
        >
          {body}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
