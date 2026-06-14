"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Send, Trash2, MessageCircle, Loader2 } from "lucide-react"
import { Sheet } from "@/components/ui/Sheet"
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

/**
 * Bottom-sheet of comments for a web Shot. Mirrors the mobile ShotCommentsSheet.
 * shotAuthorId lets the shot owner delete any comment. Posting is gated behind auth.
 * `onCountChange` keeps the rail's comment count in sync with optimistic adds/removes.
 */
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

  const { data, isLoading } = useQuery({
    queryKey: commentsKey(shotId),
    queryFn: () => api<{ data: ShotComment[]; meta: { nextCursor: string | null } }>(`/shots/${shotId}/comments?limit=50`),
    enabled: open,
  })
  const comments = data?.data ?? []

  function setComments(next: ShotComment[]) {
    qc.setQueryData<{ data: ShotComment[]; meta: { nextCursor: string | null } }>(commentsKey(shotId), (old) =>
      old ? { ...old, data: next } : { data: next, meta: { nextCursor: null } },
    )
  }

  async function submit() {
    const body = text.trim()
    if (!body) return
    if (!isAuthenticated) {
      showAuthPrompt({ subtitle: "Sign in to join the conversation." })
      return
    }
    setBusy(true)
    // Optimistic add.
    const optimistic: ShotComment = {
      id: `temp-${Date.now()}`,
      body,
      createdAt: new Date().toISOString(),
      authorId: me?.id ?? "me",
      author: {
        id: me?.id ?? "me",
        username: me?.username ?? "you",
        displayName: me?.displayName ?? null,
        avatarUrl: me?.avatarUrl ?? null,
        verifiedKind: null,
      },
    }
    setComments([optimistic, ...comments])
    setText("")
    onCountChange?.(1)
    try {
      const res = await api<{ comment: ShotComment }>(`/shots/${shotId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      })
      // Swap the optimistic entry for the real one.
      setComments([res.comment, ...comments])
    } catch {
      setComments(comments)
      onCountChange?.(-1)
      setText(body)
      push("Couldn't post comment", "error")
    } finally {
      setBusy(false)
    }
  }

  async function remove(c: ShotComment) {
    const prev = comments
    setComments(comments.filter((x) => x.id !== c.id))
    onCountChange?.(-1)
    try {
      await api(`/shots/comments/${c.id}`, { method: "DELETE" })
    } catch {
      setComments(prev)
      onCountChange?.(1)
      push("Couldn't delete comment", "error")
    }
  }

  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Comments" className="sm:max-w-md">
      <div className="flex h-[72dvh] max-h-[72dvh] flex-col sm:h-[70vh]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-black uppercase tracking-widest text-foreground">Comments</span>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-accent" size={22} />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted">
              <MessageCircle size={28} />
              <p className="text-sm font-semibold">No comments yet</p>
              <p className="text-xs text-muted/70">Be the first to say something.</p>
            </div>
          ) : (
            <ul className="space-y-3.5">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-2.5">
                  <Link href={`/u/${c.author.username}`} onClick={onClose} className="shrink-0">
                    {c.author.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.author.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-black text-white">
                        {c.author.username[0]?.toUpperCase()}
                      </span>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 text-xs text-muted">
                      @{c.author.username} <VerifiedBadge kind={c.author.verifiedKind} size={12} /> · {relTime(c.createdAt)}
                    </p>
                    <p className="break-words text-sm text-foreground">{c.body}</p>
                  </div>
                  {(me?.id === c.authorId || me?.id === shotAuthorId) && (
                    <button
                      onClick={() => remove(c)}
                      aria-label="Delete comment"
                      className="shrink-0 self-start text-muted transition-colors hover:text-rose-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-end gap-2 border-t border-border bg-background px-3 py-2.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit() } }}
            placeholder={isAuthenticated ? "Add a comment…" : "Sign in to comment"}
            // text-base = 16px so iOS Safari doesn't zoom on focus.
            className="h-10 flex-1 rounded-full bg-white/5 px-4 text-base text-foreground outline-none ring-1 ring-white/10 placeholder:text-muted/60 focus:ring-accent/40"
          />
          <button
            onClick={submit}
            disabled={!text.trim() || busy}
            aria-label="Send"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-black transition-opacity disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </Sheet>
  )
}
