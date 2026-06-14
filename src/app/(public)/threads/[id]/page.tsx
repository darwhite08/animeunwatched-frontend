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
  Heart,
  Flame,
  ImagePlus,
  Loader2,
  X,
  Bookmark,
  Share2,
  Minus,
  Plus,
} from "lucide-react"
import { api } from "@/lib/api/client"
import { useToast } from "@/stores/toast.store"
import { Avatar } from "@/components/ui/Avatar"
import { VerifiedBadge } from "@/components/social/VerifiedBadge"

type VerifiedKind = "USER" | "CREATOR" | "STUDIO" | null | undefined

/* ── Flair chips (mirror the Den feed) ── */
const FLAIR_BY_ID: Record<string, { label: string; cls: string }> = {
  discussion: { label: "Discussion", cls: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  theory:     { label: "Theory",     cls: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  "fan-art":  { label: "Fan Art",    cls: "bg-pink-500/15 text-pink-300 border-pink-500/30" },
  news:       { label: "News",       cls: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  question:   { label: "Question",   cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  meme:       { label: "Meme",       cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  spoiler:    { label: "Spoiler",    cls: "bg-red-500/15 text-red-300 border-red-500/30" },
}

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

/** Total nested replies under a node (for the collapsed-thread label). */
function countDescendants(r: ReplyItem): number {
  return r.children.reduce((n, c) => n + 1 + countDescendants(c), 0)
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
  const [collapsed, setCollapsed] = useState(false)
  const avatarSize = depth >= 2 ? 24 : depth === 1 ? 28 : 34
  const hasChildren = reply.children.length > 0
  const total = hasChildren ? countDescendants(reply) : 0

  // Width of the left gutter that holds the collapse circle + thread line.
  // The vertical thread line for this node's children aligns under the circle's center.
  const GUTTER = "w-7 sm:w-8" // ~28px / 32px

  return (
    <div className="py-1.5">
      {/* ── Header row: [collapse circle gutter] + avatar + author/meta ── */}
      <div className="group flex items-start gap-2">
        {/* Left gutter — collapse circle (only when there are replies) */}
        <div className={`relative flex shrink-0 justify-center ${GUTTER}`}>
          {hasChildren ? (
            <button
              onClick={() => setCollapsed(c => !c)}
              aria-label={collapsed ? "Expand thread" : "Collapse thread"}
              aria-expanded={!collapsed}
              className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border border-border bg-surface text-subtle transition-colors hover:border-accent/50 hover:text-accent-bright active:scale-95"
            >
              {collapsed ? <Plus size={11} /> : <Minus size={11} />}
            </button>
          ) : (
            <span aria-hidden className="block h-[18px] w-[18px]" />
          )}
        </div>

        {/* Avatar */}
        <div className="shrink-0 self-start pt-px">
          <Avatar src={reply.avatarUrl} name={reply.author} size={avatarSize} />
        </div>

        {/* Content column */}
        <div className="min-w-0 flex-1 pt-0.5">
          {/* Author line */}
          <div className="flex items-center gap-1.5 text-[13px] leading-none">
            <span className="font-bold text-foreground truncate">{reply.author}</span>
            <VerifiedBadge kind={reply.verifiedKind} size={12} />
            <span className="text-subtle">· {reply.date}</span>
            {collapsed && total > 0 && (
              <button onClick={() => setCollapsed(false)} className="text-subtle hover:text-accent-bright transition-colors">
                · {total} repl{total === 1 ? "y" : "ies"}
              </button>
            )}
          </div>

          {!collapsed && (
            <>
              {/* Content */}
              {reply.content !== "📷" && (
                <p className="mt-1.5 text-sm text-foreground/90 leading-relaxed whitespace-pre-line break-words">{reply.content}</p>
              )}

              {/* Image */}
              {reply.imageUrl && (
                <a href={reply.imageUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={reply.imageUrl} alt="Reply attachment" className="max-h-80 w-auto rounded-xl border border-border object-contain bg-surface-2" />
                </a>
              )}

              {/* Actions */}
              <div className="mt-1.5 -ml-2 flex items-center gap-0.5">
                <button
                  onClick={() => onLike(reply.id)}
                  aria-pressed={reply.liked}
                  className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold transition-colors active:scale-95 ${
                    reply.liked ? "text-rose-400" : "text-subtle hover:bg-rose-500/10 hover:text-rose-400"
                  }`}
                >
                  <Heart size={13} fill={reply.liked ? "currentColor" : "none"} />
                  {reply.likes > 0 ? reply.likes : "Like"}
                </button>
                {!locked && (
                  <button
                    onClick={() => onToggleReply(reply.id)}
                    className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-subtle hover:bg-accent/10 hover:text-accent-bright transition-colors active:scale-95"
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
            </>
          )}
        </div>
      </div>

      {/* ── Nested children ── */}
      {/* The vertical thread line lives in a left rail aligned under this node's
          collapse circle; clicking it collapses the subtree (Reddit affordance). */}
      {hasChildren && !collapsed && (
        <div className="flex">
          {/* Rail column — same width as the gutter above so the line sits under the circle */}
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Collapse thread"
            className={`group/rail relative flex shrink-0 justify-center ${GUTTER} cursor-pointer`}
          >
            <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-foreground/15 transition-colors group-hover/rail:bg-accent/60" />
          </button>

          {/* Children */}
          <div className="min-w-0 flex-1">
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
        </div>
      )}
    </div>
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
  const me = useAuthStore(s => s.user)

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
  const [savedOverride, setSavedOverride] = useState<boolean | null>(null)

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
    ? { rootLabel: "Dens", rootHref: "/clubs", label: apiThread.club.name, href: `/clubs/${apiThread.club.slug}` }
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
  const tags = apiThread.tags ?? []
  const flair = tags.map(t => FLAIR_BY_ID[t]).find(Boolean)
  const saved = savedOverride ?? !!apiThread.savedByMe

  const hypeThread = () => {
    if (!isAuthenticated) { push("Sign in to hype", "info"); return }
    reactThreadMut.mutate(HYPE_EMOJI)
  }
  const toggleSave = () => {
    if (!isAuthenticated) { push("Sign in to save", "info"); return }
    const next = !saved
    setSavedOverride(next)
    api(`/threads/${id}/save`, { method: next ? "POST" : "DELETE" })
      .then(() => { if (next) push("Saved", "success") })
      .catch(() => { setSavedOverride(!next); push("Couldn't update save", "error") })
  }
  const shareThread = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/threads/${id}`)
      .then(() => push("Link copied", "success")).catch(() => {})
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
            {flair && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${flair.cls}`}>
                {flair.label}
              </span>
            )}
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
              <p className="text-[10px] text-subtle">{relativeTime(apiThread.createdAt)}</p>
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

        {/* Reply count + thread actions */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-subtle">
            <MessageSquare size={12} />
            {replyCount} repl{replyCount === 1 ? "y" : "ies"}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={shareThread}
              aria-label="Copy link"
              className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-surface text-subtle transition-all hover:text-foreground active:scale-95"
            >
              <Share2 size={15} />
            </button>
            <button
              onClick={toggleSave}
              aria-pressed={saved}
              aria-label="Save"
              className={`grid h-10 w-10 place-items-center rounded-2xl border transition-all active:scale-95 ${
                saved ? "border-accent/40 bg-accent/15 text-accent-bright" : "border-border bg-surface text-subtle hover:text-foreground"
              }`}
            >
              <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
            </button>
            <button
              onClick={hypeThread}
              aria-pressed={threadHype.hyped}
              className={`flex items-center gap-2 h-10 px-5 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${
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
        </div>

        {/* Reply composer (top) */}
        {!apiThread.isLocked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex gap-3 mb-8"
            id="composer"
          >
            <Avatar src={me?.avatarUrl ?? null} name={me?.displayName || me?.username || "You"} size={40} />
            <div className="min-w-0 flex-1 rounded-2xl border border-border bg-surface transition-colors focus-within:border-accent/40">
              <textarea
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                placeholder="Share your thoughts…"
                rows={composerText || composerImage ? 4 : 2}
                maxLength={500}
                className="w-full bg-transparent px-4 pt-3.5 text-sm text-foreground placeholder:text-subtle resize-none outline-none leading-relaxed"
              />

              {composerImage && (
                <div className="px-4 pb-3">
                  <ImageAttach
                    imageUrl={composerImage}
                    uploading={composerUploading}
                    onPick={handleComposerPick}
                    onRemove={() => setComposerImage(null)}
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2.5">
                <div className="flex items-center gap-3">
                  {!composerImage && (
                    <ImageAttach
                      imageUrl={null}
                      uploading={composerUploading}
                      onPick={handleComposerPick}
                      onRemove={() => setComposerImage(null)}
                    />
                  )}
                  <span className={`text-[10px] font-mono ${composerText.length > 450 ? "text-accent-bright" : "text-subtle"}`}>
                    {500 - composerText.length}
                  </span>
                </div>
                <button
                  onClick={submitMainReply}
                  disabled={!canPostMain}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-bright disabled:opacity-40 disabled:hover:bg-accent text-[10px] font-black uppercase tracking-widest text-black transition-all active:scale-95"
                >
                  {createReplyMut.isPending || composerUploading ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />} Reply
                </button>
              </div>
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
          <div className="rounded-2xl border border-border bg-surface px-4 sm:px-5 divide-y divide-border/60">
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
