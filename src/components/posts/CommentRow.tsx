"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Send, X, MoreHorizontal } from "lucide-react"
import { HeartLike } from "@/components/ui/HeartLike"
import type { PostComment } from "@/lib/api/types"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"
import { Avatar } from "@/components/ui/Avatar"
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
/** @mention + #hashtag tokenizer — same rules as the post body. */
function RichBody({ text }: { text: string }) {
  const TOKEN = /(^|\s)([@#][a-zA-Z0-9_-]+)/g
  const parts: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = TOKEN.exec(text)) !== null) {
    const ts = m.index + m[1].length
    if (ts > last) parts.push(text.slice(last, ts))
    const token = m[2]
    if (token.startsWith("@")) {
      parts.push(
        <Link key={`m${ts}`} href={`/u/${token.slice(1)}`}
          className="text-accent-bright font-semibold hover:underline">{token}</Link>
      )
    } else {
      parts.push(
        <Link key={`t${ts}`} href={`/search?q=${encodeURIComponent(token)}&type=posts`}
          className="text-accent-bright font-semibold hover:underline">{token}</Link>
      )
    }
    last = ts + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return "just now"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

/**
 * Comment + recursive thread strings. Modern social-platform pattern:
 * card-style comment, hover reveals more affordance, inline iMessage-style
 * reply composer that auto-focuses + supports ⌘/Ctrl+Enter, animated open/close.
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
  const { isAuthenticated, user: me } = useAuthStore()
  const { push } = useToast()
  const likeMut   = useLikeComment(postId)
  const unlikeMut = useUnlikeComment(postId)
  const replyMut  = useCreateComment(postId)

  const [liked, setLiked]             = useState(!!comment.isLikedByMe)
  const [likeCount, setLikeCount]     = useState(comment.likeCount ?? 0)
  const [replyOpen, setReplyOpen]     = useState(false)
  const [replyDraft, setReplyDraft]   = useState("")
  const [showReplies, setShowReplies] = useState(false)
  const replyRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus on open + auto-grow the textarea
  useEffect(() => {
    if (replyOpen && replyRef.current) {
      replyRef.current.focus()
      replyRef.current.style.height = "auto"
      replyRef.current.style.height = `${replyRef.current.scrollHeight}px`
    }
  }, [replyOpen, replyDraft])

  // Inline replies come pre-included on top-level comments; deeper fetches
  // hit /posts/comments/:id/replies on demand.
  const inlineReplies  = comment.replies ?? []
  const needsDeepFetch = showReplies && (comment.replyCount ?? 0) > inlineReplies.length
  const deeperQuery    = useCommentReplies(needsDeepFetch ? comment.id : null)
  const allReplies     = needsDeepFetch && deeperQuery.data?.data ? deeperQuery.data.data : inlineReplies

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
    const text = replyDraft.trim()
    if (!text) return
    if (!isAuthenticated) { push("Sign in to reply", "info"); return }
    replyMut.mutate(
      { content: text, parentCommentId: comment.id },
      {
        onSuccess: () => { setReplyDraft(""); setReplyOpen(false); setShowReplies(true); push("Reply posted", "success") },
        onError:   () => push("Failed to post reply", "error"),
      },
    )
  }

  const onComposerKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submitReply() }
    if (e.key === "Escape") { setReplyDraft(""); setReplyOpen(false) }
  }

  return (
    <div className="group/comment flex gap-3">
      <Link href={`/u/${comment.author?.username ?? ""}`} className="shrink-0 transition-transform group-hover/comment:scale-105 motion-reduce:transform-none">
        <Avatar
          src={comment.author?.avatarUrl}
          name={name}
          size={32}
          className="shadow-sm"
          fallbackClassName={`bg-gradient-to-br ${grad}`}
        />
      </Link>

      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <Link href={`/u/${comment.author?.username ?? ""}`}
            className="text-[12px] font-bold text-foreground hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
            {name}
          </Link>
          {me?.username && comment.author?.username === me.username && (
            <span className="font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent/15 text-accent">you</span>
          )}
          <span className="text-[10px] text-muted tabular-nums">· {timeAgo(comment.createdAt)}</span>
        </div>

        {/* Body */}
        <p className="text-[13.5px] text-foreground leading-[1.55] mt-1 break-words whitespace-pre-wrap"><RichBody text={comment.content} /></p>

        {/* Action bar */}
        <div className="flex items-center gap-1 mt-1.5 -ml-2">
          <span className={`flex items-center gap-1.5 min-h-8 px-2.5 rounded-full text-[11px] font-semibold transition-all ${
            liked ? "text-rose-400" : "text-muted"
          }`}>
            <HeartLike liked={liked} onToggle={toggleLike} size={15} ariaLabel={liked ? "Unlike" : "Like"} />
            {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
          </span>

          <button onClick={() => setReplyOpen(o => !o)}
            aria-expanded={replyOpen}
            aria-label="Reply"
            className={`flex items-center gap-1.5 min-h-8 px-2.5 rounded-full text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
              replyOpen
                ? "text-accent-bright bg-accent/12"
                : "text-muted hover:text-white hover:bg-white/8"
            }`}>
            <MessageSquare size={12} />
            Reply
          </button>

          {(comment.replyCount ?? 0) > 0 && (
            <button onClick={() => setShowReplies(s => !s)}
              aria-expanded={showReplies}
              className="ml-1 text-[11px] font-semibold text-accent-bright/85 hover:text-white transition-colors px-2 min-h-8 rounded-full hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
              {showReplies
                ? `Hide ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`
                : `View ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
            </button>
          )}

          <button
            aria-label="More"
            className="ml-auto opacity-0 group-hover/comment:opacity-100 focus-visible:opacity-100 transition-opacity p-1.5 rounded-full text-muted hover:text-foreground hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
            <MoreHorizontal size={14} />
          </button>
        </div>

        {/* Reply composer — auto-focus, ⌘/Ctrl+Enter, Esc to close */}
        <AnimatePresence initial={false}>
          {replyOpen && (
            <motion.div
              key="composer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex items-start gap-2">
                {/* Self avatar — visual continuity */}
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-surface-2 to-surface flex items-center justify-center text-[10px] font-black text-muted shrink-0 mt-1 ring-1 ring-border">
                  {me?.displayName?.[0]?.toUpperCase() ?? me?.username?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-end gap-2 rounded-2xl bg-surface-2 border border-border focus-within:border-accent/40 focus-within:bg-surface transition-colors px-3 py-2">
                    <textarea
                      ref={replyRef}
                      value={replyDraft}
                      onChange={e => setReplyDraft(e.target.value)}
                      onKeyDown={onComposerKey}
                      placeholder={`Reply to ${name}…`}
                      rows={1}
                      maxLength={2000}
                      className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted resize-none outline-none max-h-40 leading-relaxed"
                    />
                    <button
                      onClick={() => { setReplyDraft(""); setReplyOpen(false) }}
                      aria-label="Cancel reply"
                      className="h-8 w-8 grid place-items-center rounded-full text-muted hover:text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <button
                      onClick={submitReply}
                      disabled={!replyDraft.trim() || replyMut.isPending}
                      aria-label="Post reply"
                      className="h-8 w-8 grid place-items-center rounded-full bg-accent text-black hover:bg-accent-bright disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 transition-colors"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-muted uppercase tracking-widest px-1">
                    <span>⌘/Ctrl + Enter to post · Esc to cancel</span>
                    <span className="tabular-nums">{replyDraft.length}/2000</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Replies group */}
        <AnimatePresence initial={false}>
          {showReplies && depth < maxDepth && allReplies.length > 0 && (
            <motion.div
              key="replies"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 ml-3.5 pl-5 border-l-2 border-foreground/15 hover:border-white/45 transition-colors space-y-4">
                {allReplies.map(r => (
                  <CommentRow key={r.id} comment={r} postId={postId} depth={depth + 1} maxDepth={maxDepth} />
                ))}
                {!needsDeepFetch && (comment.replyCount ?? 0) > inlineReplies.length && (
                  <Link href={`/posts/${postId}`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-accent-bright hover:text-white/80 transition-colors">
                    View all {comment.replyCount} replies in thread →
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
