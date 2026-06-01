"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, MessageSquare } from "lucide-react"
import type { PostComment } from "@/lib/api/types"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"
import {
  useLikeComment, useUnlikeComment, useCreateComment, useCommentReplies,
} from "@/hooks/usePosts"

const AVATAR_GRADIENTS = [
  "from-accent to-orange-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-blue-600",
  "from-accent-bright to-yellow-500",
  "from-cyan-500 to-indigo-600",
  "from-lime-500 to-green-600",
]
function gradFor(name: string) {
  return AVATAR_GRADIENTS[(name.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length]
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return "just now"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

/**
 * Recursive comment row supporting Like + Reply + nested "thread strings".
 *
 * - `maxDepth` (default 3) controls how deep inline replies render. When a
 *   parent has more children than `comment.replies` already includes, a
 *   "View all N replies →" link appears (deep linking to the post detail page).
 * - On the post detail page, pass `maxDepth={Infinity}` and `loadDeeper`
 *   to fetch beyond the inline-include depth.
 */
export function CommentRow({
  comment, postId, depth = 0, maxDepth = 3,
}: {
  comment: PostComment
  postId: string
  depth?: number
  maxDepth?: number
}) {
  const name   = comment.author?.displayName ?? comment.author?.username ?? "?"
  const letter = name[0]?.toUpperCase() ?? "?"
  const grad   = gradFor(name)
  const { isAuthenticated } = useAuthStore()
  const { push } = useToast()
  const likeMut   = useLikeComment(postId)
  const unlikeMut = useUnlikeComment(postId)
  const replyMut  = useCreateComment(postId)

  const [liked, setLiked]         = useState(!!comment.isLikedByMe)
  const [likeCount, setLikeCount] = useState(comment.likeCount ?? 0)
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyDraft, setReplyDraft] = useState("")
  const [showReplies, setShowReplies] = useState(false)

  // Inline replies arrive pre-included on top-level comments. When opening
  // a thread that needs MORE replies than were included, we fetch via the
  // dedicated endpoint.
  const inlineReplies = comment.replies ?? []
  const needsDeepFetch = showReplies && (comment.replyCount ?? 0) > inlineReplies.length
  const deeperQuery = useCommentReplies(needsDeepFetch ? comment.id : null)
  const allReplies = needsDeepFetch && deeperQuery.data?.data ? deeperQuery.data.data : inlineReplies

  const toggleLike = () => {
    if (!isAuthenticated) { push("Sign in to like", "info"); return }
    const next = !liked
    setLiked(next); setLikeCount(c => c + (next ? 1 : -1))
    const mut = next ? likeMut : unlikeMut
    mut.mutate(comment.id, {
      onError: () => { setLiked(!next); setLikeCount(c => c + (next ? -1 : 1)); push("Couldn't update like", "error") },
    })
  }

  const submitReply = () => {
    if (!replyDraft.trim()) return
    if (!isAuthenticated) { push("Sign in to reply", "info"); return }
    replyMut.mutate(
      { content: replyDraft.trim(), parentCommentId: comment.id },
      {
        onSuccess: () => { setReplyDraft(""); setReplyOpen(false); setShowReplies(true); push("Reply posted!", "success") },
        onError:   () => push("Failed to post reply", "error"),
      },
    )
  }

  return (
    <div className={`flex gap-3 ${depth > 0 ? "pl-2 border-l border-border" : ""}`}>
      <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center font-black text-[11px] shrink-0`}>
        {letter}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-black text-foreground">{name}</span>
          <span className="text-[10px] text-muted tabular-nums">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-[13px] text-foreground leading-relaxed mt-0.5">{comment.content}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <button onClick={toggleLike}
            aria-pressed={liked}
            aria-label={liked ? `Unlike (${likeCount})` : `Like (${likeCount})`}
            className={`flex items-center gap-1 min-h-7 px-2 rounded-md text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
              liked ? "text-rose-400" : "text-muted hover:text-rose-400"
            }`}>
            <Heart size={12} fill={liked ? "currentColor" : "none"} className="motion-reduce:transition-none" />
            {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
          </button>
          <button onClick={() => setReplyOpen(o => !o)}
            className="flex items-center gap-1 min-h-7 px-2 rounded-md text-[11px] font-bold text-muted hover:text-accent-bright transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
            <MessageSquare size={11} />
            Reply
          </button>
          {(comment.replyCount ?? 0) > 0 && (
            <button onClick={() => setShowReplies(s => !s)}
              className="text-[11px] font-bold text-accent-bright/80 hover:text-accent-bright transition-colors">
              {showReplies ? "Hide" : `View ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
            </button>
          )}
        </div>

        {replyOpen && (
          <div className="mt-2 flex items-end gap-2">
            <textarea value={replyDraft} onChange={e => setReplyDraft(e.target.value)}
              placeholder={`Reply to ${name}…`} rows={2}
              className="flex-1 rounded-lg bg-surface-2 border border-border px-3 py-2 text-[12px] text-foreground placeholder:text-muted resize-none focus:outline-none focus:border-accent/40 focus:bg-surface" />
            <button onClick={submitReply} disabled={!replyDraft.trim() || replyMut.isPending}
              className="px-3 min-h-9 rounded-lg bg-accent hover:bg-accent-bright text-[10px] font-black uppercase tracking-widest text-black disabled:opacity-40 transition-colors">
              {replyMut.isPending ? "…" : "Post"}
            </button>
          </div>
        )}

        {showReplies && depth < maxDepth && allReplies.length > 0 && (
          <div className="mt-3 space-y-3">
            {allReplies.map(r => (
              <CommentRow key={r.id} comment={r} postId={postId} depth={depth + 1} maxDepth={maxDepth} />
            ))}
            {!needsDeepFetch && (comment.replyCount ?? 0) > inlineReplies.length && (
              <Link href={`/posts/${postId}`} className="text-[11px] font-bold text-accent-bright hover:text-accent-bright/80 ml-2">
                View all {comment.replyCount} replies →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
