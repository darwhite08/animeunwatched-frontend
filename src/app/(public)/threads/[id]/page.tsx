"use client"

import { use, useRef, useState } from "react"
import { useThread, useReplies, useCreateReply, useReactThread, useReactReply, LIKE_EMOJI, HYPE_EMOJI, type ReactionSummary } from "@/hooks/useThreads"
import { useLiveThread } from "@/hooks/useRealtime"
import { useImageUpload } from "@/hooks/useImageUpload"
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
  Flame,
  ImagePlus,
  Loader2,
  X,
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

/** Read 🔥 Hype boost state out of a reaction summary list. */
function hypeState(reactions?: ReactionSummary[]) {
  const h = reactions?.find(r => r.emoji === HYPE_EMOJI)
  return { hype: h?.count ?? 0, hyped: !!h?.reactedByMe }
}

/* ── Types ── */
type ReplyItem = {
  id: string
  parentId: string | null
  author: string
  avatarUrl: string | null
  verifiedKind: VerifiedKind
  date: string
  content: string
  imageUrl: string | null
  likes: number
  liked: boolean
  children: ReplyItem[]
}

type Crumb = { rootLabel: string; rootHref: string; label: string; href: string } | null

/** Payload submitted from either composer. */
type ReplyPayload = { content: string; imageUrl?: string | null }

function relativeTime(iso: string): string {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 60000) return "just now"
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`
  return `${Math.floor(d / 86400000)}d ago`
}

/* ── Shared image-attach button + preview, used by both composers ── */
function ImageAttach({
  imageUrl,
  uploading,
  onPick,
  onRemove,
}: {
  imageUrl: string | null
  uploading: boolean
  onPick: (file: File) => void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = "" // allow re-picking the same file
          if (file) onPick(file)
        }}
        className="hidden"
      />
      {imageUrl && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Attachment preview"
            className="max-h-40 w-auto rounded-xl border border-border object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove image"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black/80 border border-border flex items-center justify-center text-white hover:bg-red-500/80 transition-colors active:scale-95"
          >
            <X size={12} />
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Attach image"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface border border-border text-subtle hover:text-accent-bright hover:border-accent/30 disabled:opacity-40 transition-all active:scale-95"
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
      </button>
    </>
  )
}

/* ── Reply inline composer ── */
function InlineReply({
  authorName,
  onSubmit,
  onCancel,
  pending,
}: {
  authorName: string
  onSubmit: (payload: ReplyPayload) => void
  onCancel: () => void
  pending: boolean
}) {
  const [text, setText] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const { upload, isUploading } = useImageUpload("post")
  const { push } = useToast()

  const handlePick = async (file: File) => {
    try {
      const { publicUrl } = await upload(file)
      setImageUrl(publicUrl)
    } catch (err) {
      push(err instanceof Error ? err.message : "Couldn't upload that image", "error")
    }
  }

  const canPost = (text.trim().length > 0 || !!imageUrl) && !pending && !isUploading

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
        {imageUrl && (
          <ImageAttach
            imageUrl={imageUrl}
            uploading={isUploading}
            onPick={handlePick}
            onRemove={() => setImageUrl(null)}
          />
        )}
        <div className="flex items-center gap-2 justify-between border-t border-border pt-3">
          {!imageUrl ? (
            <ImageAttach
              imageUrl={null}
              uploading={isUploading}
              onPick={handlePick}
              onRemove={() => setImageUrl(null)}
            />
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-surface text-[10px] font-black uppercase tracking-widest text-muted hover:text-muted transition-colors active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={() => { if (canPost) onSubmit({ content: text.trim() || "📷", imageUrl }) }}
              disabled={!canPost}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-bright disabled:opacity-40 text-[10px] font-black uppercase tracking-widest text-foreground transition-all active:scale-95"
            >
              {pending || isUploading ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />} Reply
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Recursive reply node ── */
function ReplyNode({
  reply,
  depth,
  locked,
  replyingTo,
  onToggleReply,
  onLike,
  onSubmitReply,
  pending,
}: {
  reply: ReplyItem
  depth: number
  locked: boolean
  replyingTo: string | null
  onToggleReply: (id: string) => void
  onLike: (id: string) => void
  onSubmitReply: (payload: ReplyPayload) => void
  pending: boolean
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={depth > 0 ? "ml-5 sm:ml-8 border-l border-border pl-3 sm:pl-4" : ""}
    >
      <div className="p-5 rounded-2xl bg-surface border border-border hover:border-border transition-all space-y-4">
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
        {reply.content !== "📷" && (
          <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{reply.content}</p>
        )}

        {/* Image */}
        {reply.imageUrl && (
          <a href={reply.imageUrl} target="_blank" rel="noopener noreferrer" className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={reply.imageUrl}
              alt="Reply attachment"
              className="max-h-80 w-auto rounded-xl border border-border object-contain bg-surface-2"
            />
          </a>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 border-t border-border pt-3">
          <button
            onClick={() => onLike(reply.id)}
            aria-pressed={reply.liked}
            className={`flex items-center gap-1.5 text-xs font-bold transition-colors active:scale-95 ${
              reply.liked ? "text-rose-400" : "text-subtle hover:text-rose-400"
            }`}
          >
            <Heart size={13} fill={reply.liked ? "currentColor" : "none"} />
            {reply.likes > 0 ? reply.likes : "Like"}
          </button>
          {!locked && (
            <button
              onClick={() => onToggleReply(reply.id)}
              className="flex items-center gap-1.5 text-xs font-bold text-subtle hover:text-accent-bright transition-colors active:scale-95"
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
              onSubmit={onSubmitReply}
              onCancel={() => onToggleReply(reply.id)}
              pending={pending}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Nested children */}
      {reply.children.length > 0 && (
        <div className="mt-3 space-y-3">
          {reply.children.map(child => (
            <ReplyNode
              key={child.id}
              reply={child}
              depth={depth + 1}
              locked={locked}
              replyingTo={replyingTo}
              onToggleReply={onToggleReply}
              onLike={onLike}
              onSubmitReply={onSubmitReply}
              pending={pending}
            />
          ))}
        </div>
      )}
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

  // Main composer state
  const [composerText, setComposerText] = useState("")
  const [composerImage, setComposerImage] = useState<string | null>(null)
  const { upload: uploadComposer, isUploading: composerUploading } = useImageUpload("post")
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

  // Flat list → tree (Reddit-style nesting on parentId).
  const flat: ReplyItem[] = (repliesData?.data ?? []).map(r => ({
    id: r.id,
    parentId: r.parentId ?? null,
    author: r.author?.displayName ?? r.author?.username ?? "Anonymous",
    avatarUrl: r.author?.avatarUrl ?? null,
    verifiedKind: r.author?.verifiedKind,
    content: r.content,
    imageUrl: r.imageUrl ?? null,
    date: relativeTime(r.createdAt),
    children: [],
    ...likeState(r.reactions),
  }))

  const byId = new Map(flat.map(r => [r.id, r]))
  const roots: ReplyItem[] = []
  for (const r of flat) {
    const parent = r.parentId ? byId.get(r.parentId) : undefined
    if (parent) parent.children.push(r)
    else roots.push(r)
  }

  const replyCount = apiThread._count?.replies ?? flat.length
  const threadHype = hypeState(apiThread.reactions)

  const hypeThread = () => {
    if (!isAuthenticated) { push("Sign in to hype", "info"); return }
    reactThreadMut.mutate(HYPE_EMOJI)
  }
  const likeReply = (replyId: string) => {
    if (!isAuthenticated) { push("Sign in to like", "info"); return }
    reactReplyMut.mutate({ replyId })
  }

  const submitReply = (payload: ReplyPayload, parentId: string | null) => {
    if (!isAuthenticated) { push("Sign in to reply", "info"); return }
    createReplyMut.mutate(
      { content: payload.content, parentId: parentId ?? undefined, imageUrl: payload.imageUrl ?? null },
      {
        onSuccess: () => {
          push("Reply posted!", "success")
          setReplyingTo(null)
          setComposerText("")
          setComposerImage(null)
        },
        onError: () => push("Failed to post reply", "error"),
      }
    )
  }

  const submitMainReply = () => {
    const hasText = composerText.trim().length > 0
    if (!hasText && !composerImage) return
    submitReply({ content: composerText.trim() || "📷", imageUrl: composerImage }, null)
  }

  const handleComposerPick = async (file: File) => {
    try {
      const { publicUrl } = await uploadComposer(file)
      setComposerImage(publicUrl)
    } catch (err) {
      push(err instanceof Error ? err.message : "Couldn't upload that image", "error")
    }
  }

  const canPostMain =
    (composerText.trim().length > 0 || !!composerImage) &&
    !createReplyMut.isPending &&
    !composerUploading

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
          className="p-7 rounded-3xl bg-surface border border-border mb-8 space-y-5"
        >
          <p className="text-sm text-muted leading-[1.8] whitespace-pre-line">
            {apiThread.content}
          </p>

          {/* Thread image */}
          {apiThread.imageUrl && (
            <a href={apiThread.imageUrl} target="_blank" rel="noopener noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={apiThread.imageUrl}
                alt="Thread attachment"
                className="max-h-[32rem] w-auto rounded-2xl border border-border object-contain bg-surface-2"
              />
            </a>
          )}
        </motion.div>

        {/* Reply count + thread HYPE boost */}
        <div className="flex items-center justify-between mb-6">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-subtle">
            <MessageSquare size={12} />
            {replyCount} repl{replyCount === 1 ? "y" : "ies"}
          </p>
          <button
            onClick={hypeThread}
            aria-pressed={threadHype.hyped}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${
              threadHype.hyped
                ? "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.25)]"
                : "bg-surface border-border text-subtle hover:text-amber-400 hover:border-amber-500/30"
            }`}
          >
            <Flame size={14} fill={threadHype.hyped ? "currentColor" : "none"} />
            {threadHype.hype > 0 && <span>{threadHype.hype}</span>}
            <span>Hype</span>
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

            {/* Image preview */}
            {composerImage && (
              <ImageAttach
                imageUrl={composerImage}
                uploading={composerUploading}
                onPick={handleComposerPick}
                onRemove={() => setComposerImage(null)}
              />
            )}

            <div className="flex items-center justify-between border-t border-border pt-3 gap-3">
              <div className="flex items-center gap-3">
                {!composerImage && (
                  <ImageAttach
                    imageUrl={null}
                    uploading={composerUploading}
                    onPick={handleComposerPick}
                    onRemove={() => setComposerImage(null)}
                  />
                )}
                <span
                  className={`text-[10px] font-mono ${
                    composerText.length > 450 ? "text-accent-bright" : "text-subtle"
                  }`}
                >
                  {500 - composerText.length} chars left
                </span>
              </div>
              <button
                onClick={submitMainReply}
                disabled={!canPostMain}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-bright disabled:opacity-40 text-[10px] font-black uppercase tracking-widest text-foreground transition-all active:scale-95"
              >
                {createReplyMut.isPending || composerUploading ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />} Post Reply
              </button>
            </div>
          </motion.div>
        )}

        {/* Reply list */}
        {roots.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-surface border border-border border-dashed">
            <MessageSquare size={20} className="mx-auto text-subtle mb-2" />
            <p className="text-sm font-bold text-muted">No replies yet</p>
            <p className="text-[11px] text-subtle mt-1">Be the first to reply to this thread.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {roots.map(reply => (
                <ReplyNode
                  key={reply.id}
                  reply={reply}
                  depth={0}
                  locked={apiThread.isLocked}
                  replyingTo={replyingTo}
                  onToggleReply={(rid) => setReplyingTo(replyingTo === rid ? null : rid)}
                  onLike={likeReply}
                  onSubmitReply={(payload) => submitReply(payload, replyingTo)}
                  pending={createReplyMut.isPending}
                />
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
