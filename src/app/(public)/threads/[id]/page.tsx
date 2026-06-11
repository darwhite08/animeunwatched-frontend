"use client"

import { use, useState } from "react"
import { useThread, useReplies, useCreateReply, useReactThread, useReactReply, LIKE_EMOJI, type ReactionSummary } from "@/hooks/useThreads"
import { useLiveThread } from "@/hooks/useRealtime"
import { useAuthStore } from "@/stores/auth.store"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Pin,
  Lock,
  ChevronRight,
  Reply,
  Clock,
  Heart,
  Loader2,
} from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { Avatar } from "@/components/ui/Avatar"
import { VerifiedBadge } from "@/components/social/VerifiedBadge"

type VerifiedKind = "USER" | "CREATOR" | "STUDIO" | null | undefined

/** Read heart-like state out of a reaction summary list. */
function likeState(reactions?: ReactionSummary[]) {
  const h = reactions?.find(r => r.emoji === LIKE_EMOJI)
  return { likes: h?.count ?? 0, liked: !!h?.reactedByMe }
}

/* ── Types ── */
type ReplyItem = {
  id: string
  author: string
  avatarUrl: string | null
  verifiedKind: VerifiedKind
  date: string
  content: string
  likes: number
  liked: boolean
}

type Crumb = { rootLabel: string; rootHref: string; label: string; href: string } | null

function relativeTime(iso: string): string {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 60000) return "just now"
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`
  return `${Math.floor(d / 86400000)}d ago`
}

/* ── Reply inline composer ── */
function InlineReply({
  authorName,
  onSubmit,
  onCancel,
  pending,
}: {
  authorName: string
  onSubmit: (text: string) => void
  onCancel: () => void
  pending: boolean
}) {
  const [text, setText] = useState("")
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mt-3"
    >
      <div className="p-4 rounded-xl bg-surface-2 border border-accent/20 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-accent-bright">
          Replying to {authorName}
        </p>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your reply…"
          rows={3}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-subtle resize-none outline-none leading-relaxed"
        />
        <div className="flex items-center gap-2 justify-end border-t border-border pt-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-surface text-[10px] font-black uppercase tracking-widest text-muted hover:text-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (text.trim()) onSubmit(text) }}
            disabled={!text.trim() || pending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-bright disabled:opacity-40 text-[10px] font-black uppercase tracking-widest text-foreground transition-all"
          >
            {pending ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />} Reply
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Page ── */
export default function ThreadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { push } = useToast()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  const { data: threadData, isLoading, isError } = useThread(id)
  const { data: repliesData } = useReplies(id)
  const createReplyMut = useCreateReply(id)
  const reactThreadMut = useReactThread(id)
  const reactReplyMut = useReactReply(id)
  // Realtime: new replies + likes appear instantly without refresh
  useLiveThread(id)

  const [composerText, setComposerText] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const apiThread = threadData?.thread

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-subtle" />
      </div>
    )
  }

  // ── Not found ──
  if (isError || !apiThread) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 text-center">
        <div className="h-20 w-20 rounded-3xl bg-surface border border-border flex items-center justify-center mb-5">
          <MessageSquare size={28} className="text-subtle" />
        </div>
        <h1 className="text-2xl font-black uppercase italic tracking-tight text-foreground mb-2">Thread not found</h1>
        <p className="text-sm text-muted max-w-sm mb-6">This discussion may have been removed, or the link is out of date.</p>
        <Link
          href="/community"
          className="px-5 py-2.5 rounded-xl bg-surface border border-border text-[10px] font-black uppercase tracking-widest text-muted hover:text-foreground hover:border-border transition-all"
        >
          Back to Community
        </Link>
      </div>
    )
  }

  // ── Real thread ──
  const author = apiThread.author?.displayName ?? apiThread.author?.username ?? "Anonymous"

  // Breadcrumb + back link follow the thread's real parent: anime or club.
  const crumb: Crumb = apiThread.club
    ? { rootLabel: "Clubs", rootHref: "/clubs", label: apiThread.club.name, href: `/clubs/${apiThread.club.slug}` }
    : apiThread.anime
    ? { rootLabel: "Anime", rootHref: "/bestanimelist", label: apiThread.anime.titleEnglish || apiThread.anime.title, href: `/anime/${apiThread.anime.malId}` }
    : null

  const replies: ReplyItem[] = (repliesData?.data ?? []).map(r => ({
    id: r.id,
    author: r.author?.displayName ?? r.author?.username ?? "Anonymous",
    avatarUrl: r.author?.avatarUrl ?? null,
    verifiedKind: r.author?.verifiedKind,
    content: r.content,
    date: relativeTime(r.createdAt),
    ...likeState(r.reactions),
  }))

  const replyCount = apiThread._count?.replies ?? replies.length
  const threadLike = likeState(apiThread.reactions)

  const likeThread = () => {
    if (!isAuthenticated) { push("Sign in to like", "info"); return }
    reactThreadMut.mutate(LIKE_EMOJI)
  }
  const likeReply = (replyId: string) => {
    if (!isAuthenticated) { push("Sign in to like", "info"); return }
    reactReplyMut.mutate({ replyId })
  }

  const submitReply = (text: string) => {
    if (!isAuthenticated) { push("Sign in to reply", "info"); return }
    createReplyMut.mutate(
      { content: text, parentId: replyingTo ?? undefined },
      {
        onSuccess: () => {
          push("Reply posted!", "success")
          setReplyingTo(null)
          setComposerText("")
        },
        onError: () => push("Failed to post reply", "error"),
      }
    )
  }

  const submitMainReply = () => {
    if (!composerText.trim()) return
    submitReply(composerText)
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-10">
        {/* Breadcrumb */}
        {crumb && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-subtle mb-8 flex-wrap"
          >
            <Link href={crumb.rootHref} className="hover:text-muted transition-colors">{crumb.rootLabel}</Link>
            <ChevronRight size={9} />
            <Link href={crumb.href} className="hover:text-muted transition-colors line-clamp-1">{crumb.label}</Link>
            <ChevronRight size={9} />
            <span className="text-muted line-clamp-1">{apiThread.title}</span>
          </motion.div>
        )}

        {/* Thread header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {apiThread.isPinned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-[9px] font-black uppercase tracking-wider text-accent-bright">
                <Pin size={8} /> Pinned
              </span>
            )}
            {apiThread.isLocked && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-black uppercase tracking-wider text-red-400">
                <Lock size={8} /> Locked
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-foreground leading-tight mb-4">
            {apiThread.title}
          </h1>

          {/* Author meta */}
          <div className="flex items-center gap-3">
            <Avatar src={apiThread.author?.avatarUrl} name={author} size={40} />
            <div>
              <p className="text-sm font-black text-foreground flex items-center gap-1.5">
                {author}
                <VerifiedBadge kind={apiThread.author?.verifiedKind} size={14} />
              </p>
              <p className="text-[10px] text-subtle flex items-center gap-1">
                <Clock size={9} /> {relativeTime(apiThread.createdAt)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Thread body */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="p-7 rounded-3xl bg-surface border border-border mb-8"
        >
          <p className="text-sm text-muted leading-[1.8] whitespace-pre-line">
            {apiThread.content}
          </p>
        </motion.div>

        {/* Reply count + thread like */}
        <div className="flex items-center justify-between mb-6">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-subtle">
            <MessageSquare size={12} />
            {replyCount} repl{replyCount === 1 ? "y" : "ies"}
          </p>
          <button
            onClick={likeThread}
            aria-pressed={threadLike.liked}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
              threadLike.liked
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-surface border-border text-subtle hover:text-rose-400 hover:border-rose-500/20"
            }`}
          >
            <Heart size={12} fill={threadLike.liked ? "currentColor" : "none"} />
            {threadLike.likes > 0 ? threadLike.likes : "Like"}
          </button>
        </div>

        {/* Reply composer (top) */}
        {!apiThread.isLocked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-5 rounded-2xl bg-surface-2 border border-border mb-8 space-y-4"
            id="composer"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-subtle">
              Your Reply
            </p>
            <textarea
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              placeholder="Share your thoughts on this thread…"
              rows={4}
              maxLength={500}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-subtle resize-none outline-none leading-relaxed focus:outline-none"
            />
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span
                className={`text-[10px] font-mono ${
                  composerText.length > 450 ? "text-accent-bright" : "text-subtle"
                }`}
              >
                {500 - composerText.length} chars left
              </span>
              <button
                onClick={submitMainReply}
                disabled={!composerText.trim() || createReplyMut.isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-bright disabled:opacity-40 text-[10px] font-black uppercase tracking-widest text-foreground transition-all"
              >
                {createReplyMut.isPending ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />} Post Reply
              </button>
            </div>
          </motion.div>
        )}

        {/* Reply list */}
        {replies.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-surface border border-border border-dashed">
            <MessageSquare size={20} className="mx-auto text-subtle mb-2" />
            <p className="text-sm font-bold text-muted">No replies yet</p>
            <p className="text-[11px] text-subtle mt-1">Be the first to reply to this thread.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {replies.map((reply, i) => (
                <motion.div
                  key={reply.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-5 rounded-2xl bg-surface border border-border hover:border-border transition-all space-y-4"
                >
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <Avatar src={reply.avatarUrl} name={reply.author} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-foreground flex items-center gap-1.5">
                        {reply.author}
                        <VerifiedBadge kind={reply.verifiedKind} size={13} />
                      </p>
                      <p className="text-[10px] text-subtle">{reply.date}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{reply.content}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 border-t border-border pt-3">
                    <button
                      onClick={() => likeReply(reply.id)}
                      aria-pressed={reply.liked}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                        reply.liked ? "text-rose-400" : "text-subtle hover:text-rose-400"
                      }`}
                    >
                      <Heart size={13} fill={reply.liked ? "currentColor" : "none"} />
                      {reply.likes > 0 ? reply.likes : "Like"}
                    </button>
                    {!apiThread.isLocked && (
                      <button
                        onClick={() =>
                          setReplyingTo(replyingTo === reply.id ? null : reply.id)
                        }
                        className="flex items-center gap-1.5 text-xs font-bold text-subtle hover:text-accent-bright transition-colors"
                      >
                        <Reply size={12} /> Reply
                      </button>
                    )}
                  </div>

                  {/* Inline reply composer */}
                  <AnimatePresence>
                    {replyingTo === reply.id && (
                      <InlineReply
                        authorName={reply.author}
                        onSubmit={submitReply}
                        onCancel={() => setReplyingTo(null)}
                        pending={createReplyMut.isPending}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Back link */}
        {crumb && (
          <div className="mt-12">
            <Link
              href={crumb.href}
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-subtle hover:text-muted transition-colors group"
            >
              <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to {crumb.label}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
