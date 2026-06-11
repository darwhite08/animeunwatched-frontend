"use client"

import { useState, useCallback, useRef, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { motion, AnimatePresence } from "framer-motion"
import {
  Flame, TrendingUp, Users, Vote,
  Heart, MessageSquare, Share2, MoreHorizontal,
  Plus, Send, AtSign, Hash, Image as ImageIcon, Star, Loader2, ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/stores/toast.store"
import TrendingWidget from "@/components/social/TrendingWidget"
import { WhoToFollowWidget } from "@/components/social/WhoToFollowWidget"
import WatchlistPreviewWidget from "@/components/social/WatchlistPreviewWidget"
import { useDiscover, useTrending, useFeed, useCreatePost, useLikePost, useComments, useCreateComment } from "@/hooks/usePosts"
import { Avatar } from "@/components/ui/Avatar"
import { CommentRow } from "@/components/posts/CommentRow"
import { useLiveFeed } from "@/hooks/useRealtime"
import { useImageUpload } from "@/hooks/useImageUpload"
import { PostMenu } from "@/components/ui/PostMenu"
import { useAuthStore } from "@/stores/auth.store"
import { VerifiedBadge } from "@/components/social/VerifiedBadge"
import type { Post, PostComment } from "@/lib/api/types"

type FeedTab = "trending" | "following" | "latest"

/** Tally `#hashtag` occurrences across a set of post bodies. Returns the
    top-N most common as plain strings (no leading '#'). */
function deriveTrendingTags(bodies: string[], topN = 7): string[] {
  const counts = new Map<string, number>()
  const RE = /(^|\s)#([a-zA-Z0-9_-]+)/g
  for (const body of bodies) {
    let m: RegExpExecArray | null
    while ((m = RE.exec(body)) !== null) {
      const tag = m[2].toLowerCase()
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, topN).map(e => e[0])
}

type ActivePoll = {
  id: string
  question: string
  options: Array<{ id: string; label: string; votes: number }>
  totalVotes: number
}

function ActivePollRow({ poll }: { poll: ActivePoll }) {
  const [voted, setVoted] = useState<string | null>(null)
  const { push } = useToast()
  const total = poll.options.reduce((s, o) => s + o.votes, 0) || poll.totalVotes || 0

  const onVote = async (optId: string) => {
    if (voted) return
    setVoted(optId)
    try {
      await api(`/polls/${poll.id}/vote`, { method: "POST", body: JSON.stringify({ optionId: optId }) })
    } catch {
      push("Couldn't record your vote — try again later", "error")
    }
  }
  return (
    <div className="p-4 rounded-xl bg-surface border border-border hover:border-accent/20 transition-colors space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-foreground leading-tight">{poll.question}</p>
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted shrink-0 tabular-nums mt-0.5">
          {total.toLocaleString()} votes
        </span>
      </div>
      <div className="space-y-1.5">
        {poll.options.map(o => {
          const pct  = total > 0 ? Math.round((o.votes / total) * 100) : 0
          const mine = voted === o.id
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onVote(o.id)}
              disabled={!!voted && !mine}
              aria-pressed={mine}
              className={`relative w-full text-left rounded-lg overflow-hidden border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                mine
                  ? "border-accent/60 bg-accent/[0.08]"
                  : voted
                    ? "border-border bg-surface-2"
                    : "border-border bg-surface-2 hover:bg-surface hover:border-accent/30 cursor-pointer"
              }`}
            >
              <span
                aria-hidden
                className={`absolute inset-y-0 left-0 transition-[width] duration-500 ease-out motion-reduce:transition-none ${
                  mine ? "bg-accent/30" : "bg-foreground/[0.06]"
                }`}
                style={{ width: voted ? `${pct}%` : "0%" }}
              />
              <span className="relative flex items-center justify-between px-3 py-2 text-[12px]">
                <span className={`font-bold ${mine ? "text-foreground" : "text-muted"}`}>
                  {o.label}
                  {mine && <span className="ml-2 font-mono text-[9px] uppercase tracking-widest text-accent-bright">your vote</span>}
                </span>
                {voted && (
                  <span className="font-mono tabular-nums font-black text-foreground">{pct}%</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Deterministic avatar gradient from author username initial
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
function avatarGradient(name: string): string {
  return AVATAR_GRADIENTS[(name.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length]
}

/** Render a post body, turning `@username` into a profile link and
    `#hashtag` into a tag-filtered search link. Anything else renders as
    plain text. Splits on a single regex so the original word order is
    preserved exactly. */
function RichBody({ text }: { text: string }) {
  // word-boundary aware: only matches when @/# is at start-of-line or after whitespace,
  // and the token is alphanumeric / underscore / hyphen
  const TOKEN = /(^|\s)([@#][a-zA-Z0-9_-]+)/g
  const parts: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = TOKEN.exec(text)) !== null) {
    const tokenStart = m.index + m[1].length
    if (tokenStart > last) parts.push(text.slice(last, tokenStart))
    const token = m[2]
    if (token.startsWith("@")) {
      const username = token.slice(1)
      parts.push(
        <Link key={`m-${tokenStart}`} href={`/u/${username}`}
          className="text-accent-bright font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded">
          {token}
        </Link>
      )
    } else {
      const tag = token.slice(1)
      parts.push(
        <Link key={`t-${tokenStart}`} href={`/search?q=${encodeURIComponent("#" + tag)}&type=posts`}
          className="text-accent-bright font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded">
          {token}
        </Link>
      )
    }
    last = tokenStart + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60000) return "just now"
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}


/* ── Spoiler block — blurs content until user clicks to reveal ── */
function SpoilerBlock({ text }: { text: string }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="relative">
      <p className={`text-[15px] leading-relaxed transition-all duration-300 ${
        revealed ? "text-foreground blur-none" : "text-subtle blur-md select-none"
      }`}>
        {text}
      </p>
      {!revealed && (
        <button onClick={() => setRevealed(true)}
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-accent/8 border border-accent/20 text-[11px] font-black uppercase tracking-widest text-accent-bright hover:bg-accent/15 transition-all">
          ⚠️ Spoiler — click to reveal
        </button>
      )}
    </div>
  )
}

/* ── Post card ── */
function PostCard({ post }: { post: Post }) {
  const { push }       = useToast()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  // Like state — initialised from API's isLikedByMe and resynced whenever
  // the underlying post object changes (refetch, socket invalidation, etc.)
  const [liked, setLiked]       = useState(post.isLikedByMe ?? false)
  const [likeCount, setLikeCount] = useState(post._count?.likes ?? 0)
  const likePost                 = useLikePost(post.id)

  // Keep local state in sync with prop — prevents drift after refresh/refetch
  useEffect(() => {
    setLiked(post.isLikedByMe ?? false)
    setLikeCount(post._count?.likes ?? 0)
  }, [post.isLikedByMe, post._count?.likes])

  // Comment expansion
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(post._count?.comments ?? 0)
  const [commentDraft, setCommentDraft] = useState("")
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  const { data: commentsData, isLoading: loadingComments } = useComments(post.id)
  const comments: PostComment[] = commentsData?.data ?? []
  const createComment = useCreateComment(post.id)

  const handleLike = useCallback(() => {
    if (!isAuthenticated) { push("Sign in to like posts", "info"); return }
    // Use the server's authoritative response — fixes "I can like twice
    // after refresh" where local state was out of sync with the DB.
    likePost.mutate(
      { like: !liked },
      {
        onSuccess: (res) => {
          setLiked(res.liked)
          setLikeCount(res.count)
        },
        onError: () => push("Could not update like. Try again.", "error"),
      }
    )
  }, [liked, likePost, push, isAuthenticated])

  const handleToggleComments = () => {
    setShowComments(s => {
      if (!s) setTimeout(() => commentInputRef.current?.focus(), 300)
      return !s
    })
  }

  const handleSubmitComment = () => {
    if (!commentDraft.trim()) return
    if (!isAuthenticated) { push("Sign in to comment", "info"); return }
    createComment.mutate(commentDraft.trim(), {
      onSuccess: () => {
        setCommentDraft("")
        setCommentCount(c => c + 1)
        push("Comment posted!", "success")
      },
      onError: () => push("Failed to post comment", "error"),
    })
  }

  const authorName   = post.author?.displayName ?? post.author?.username ?? "Anonymous"
  const avatarLetter = authorName[0]?.toUpperCase() ?? "?"
  const grad         = avatarGradient(authorName)

  return (
    <motion.article layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-2xl overflow-hidden transition-all hover:border-accent/20 hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--app-fg)_6%,transparent)] focus-within:ring-2 focus-within:ring-accent/40"
      style={{
        scrollMarginTop: "160px",  // account for sticky navbar + community header
      }}
    >
      <div className="p-5 space-y-4">
        {/* Author row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/u/${post.author?.username ?? ""}`} className="shrink-0 hover:scale-105 transition-transform">
              <Avatar src={post.author?.avatarUrl} name={authorName} size={40} fallbackClassName={`bg-gradient-to-br ${grad}`} />
            </Link>
            <div>
              <Link href={`/u/${post.author?.username ?? ""}`} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
                <p className="flex items-center gap-1.5 text-[15px] font-semibold text-foreground hover:text-accent-bright transition-colors leading-tight">
                  {authorName}
                  <VerifiedBadge kind={(post.author as { verifiedKind?: "USER" | "CREATOR" | "STUDIO" | null })?.verifiedKind} size={15} />
                </p>
              </Link>
              <p className="text-[11px] text-muted mt-0.5 tabular-nums">{timeAgo(post.createdAt)}</p>
            </div>
          </div>
          <PostMenu postId={post.id} />
        </div>

        {/* Anime tag */}
        {post.anime && (
          <Link href={`/anime/${post.anime.malId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent-bright hover:bg-accent/20 transition-colors">
            <Star size={9} fill="currentColor" className="text-accent-bright" /> {post.anime.title}
          </Link>
        )}

        {/* Content */}
        {/* Spoiler-aware content rendering */}
        {(() => {
          const spoilerMatch = post.content.match(/^\[spoiler\]([\s\S]*)\[\/spoiler\]$/)
          if (spoilerMatch) {
            return <SpoilerBlock text={spoilerMatch[1]} />
          }
          return <p className="text-[15px] text-foreground leading-[1.6] max-w-[65ch] whitespace-pre-wrap break-words"><RichBody text={post.content} /></p>
        })()}

        {/* Image attachment — plain <img> (not next/image): user uploads are
            served from kaiveron.com/cdn which isn't in remotePatterns, and
            next/image rejects absolute URLs by hostname even when unoptimized. */}
        {post.imageUrl && (
          <a href={post.imageUrl} target="_blank" rel="noopener noreferrer" className="block rounded-2xl overflow-hidden border border-border max-w-[520px] hover:border-border transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt="Post attachment"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover max-h-[520px]"
            />
          </a>
        )}

        {/* Actions — 40px hit targets, AA-compliant contrast, focus-visible ring */}
        <div className="flex items-center gap-1 pt-2 border-t border-border">
          {/* Like */}
          <button onClick={handleLike} disabled={likePost.isPending}
            aria-label={liked ? `Unlike (${likeCount} likes)` : `Like (${likeCount} likes)`}
            aria-pressed={liked}
            className={`flex items-center gap-2 min-h-10 px-3 rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-50 ${
              liked
                ? "text-rose-400 bg-rose-500/15"
                : "text-muted hover:text-rose-400 hover:bg-rose-500/10"
            }`}>
            <Heart size={16} fill={liked ? "currentColor" : "none"} className="transition-transform active:scale-90 motion-reduce:transform-none" />
            {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
          </button>

          {/* Comment toggle */}
          <button onClick={handleToggleComments}
            aria-label={`${commentCount} comments — ${showComments ? "hide" : "show"}`}
            aria-expanded={showComments}
            className={`flex items-center gap-2 min-h-10 px-3 rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
              showComments
                ? "text-accent-bright bg-accent/15"
                : "text-muted hover:text-accent-bright hover:bg-accent/10"
            }`}>
            <MessageSquare size={16} />
            {commentCount > 0 && <span className="tabular-nums">{commentCount}</span>}
            <ChevronDown size={12} className={`transition-transform motion-reduce:transition-none ${showComments ? "rotate-180" : ""}`} />
          </button>

          {/* Share */}
          <button onClick={() => {
            navigator.clipboard.writeText(window.location.origin + `/posts/${post.id}`).catch(() => {})
            push("Link copied!", "success")
          }}
            aria-label="Copy post link"
            className="flex items-center gap-1.5 min-h-10 min-w-10 justify-center px-3 rounded-xl text-sm font-bold text-muted hover:text-foreground hover:bg-surface-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ml-auto">
            <Share2 size={15} />
          </button>
        </div>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-5 space-y-4 bg-white/[0.015]">
              {/* Existing comments */}
              {loadingComments && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={16} className="animate-spin text-subtle" />
                </div>
              )}

              {!loadingComments && comments.length === 0 && (
                <p className="text-[11px] text-subtle font-black uppercase tracking-widest text-center py-3">
                  No comments yet — be first!
                </p>
              )}

              <div className="space-y-4">
                {comments.map(c => <CommentRow key={c.id} comment={c} postId={post.id} />)}
              </div>

              {/* New comment input */}
              <div className="flex gap-3 pt-2 border-t border-border">
                <Avatar
                  src={useAuthStore.getState().user?.avatarUrl}
                  name={useAuthStore.getState().user?.displayName ?? useAuthStore.getState().user?.username ?? "?"}
                  size={28}
                  fallbackClassName={`bg-gradient-to-br ${avatarGradient(useAuthStore.getState().user?.displayName ?? "U")}`}
                />
                <div className="flex-1 min-w-0">
                  <textarea
                    ref={commentInputRef}
                    value={commentDraft}
                    onChange={e => setCommentDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmitComment()
                    }}
                    placeholder={isAuthenticated ? "Write a comment… (⌘Enter to post)" : "Sign in to comment"}
                    disabled={!isAuthenticated}
                    rows={2}
                    maxLength={500}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-[12px] text-foreground placeholder:text-subtle resize-none outline-none focus:border-accent/40 transition-colors disabled:opacity-40"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] text-subtle font-mono">{500 - commentDraft.length} chars</span>
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentDraft.trim() || createComment.isPending || !isAuthenticated}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}
                    >
                      {createComment.isPending ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

export default function CommunityPage() {
  const { push } = useToast()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const [feedTab, setFeedTab] = useState<FeedTab>("trending")
  const [composing, setComposing] = useState(false)
  const [draft, setDraft] = useState("")
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [attachedImage, setAttachedImage] = useState<string | null>(null)
  const fileInputRef    = useRef<HTMLInputElement>(null)
  const composerRef     = useRef<HTMLTextAreaElement>(null)

  /** Insert text at the textarea's cursor; pad with a leading space when
      adjacent to existing word characters so we don't accidentally form
      "word@" or "tag#tag". Updates state + restores focus + cursor. */
  const insertAtCursor = useCallback((token: "@" | "#") => {
    const el = composerRef.current
    if (!el) {
      // Fallback: append.
      setDraft(d => d + (d.length === 0 || /\s$/.test(d) ? token : ` ${token}`))
      return
    }
    const start = el.selectionStart ?? draft.length
    const end   = el.selectionEnd   ?? draft.length
    const before = draft.slice(0, start)
    const after  = draft.slice(end)
    const needsLeadingSpace = before.length > 0 && !/\s$/.test(before)
    const insert = (needsLeadingSpace ? " " : "") + token
    const next   = before + insert + after
    setDraft(next)
    // Restore focus + place caret right after the inserted token
    const nextCaret = (before + insert).length
    requestAnimationFrame(() => {
      const t = composerRef.current
      if (!t) return
      t.focus()
      t.setSelectionRange(nextCaret, nextCaret)
    })
  }, [draft])
  const { upload, isUploading, error: uploadError, progress } = useImageUpload("post")

  // Realtime: new posts prepend, like/comment counts update without refresh
  useLiveFeed()

  // Each tab uses the hook that matches what users expect:
  //   trending  → algorithm-ranked (HN-style score + diversity + follow boost)
  //   following → in-network chronological feed (requires auth; skips otherwise)
  //   latest    → global chronological discover
  // We keep all three queries mounted so switching tabs is instant.
  const trending  = useTrending(20)
  const following = useFeed()
  const discover  = useDiscover()

  const active = feedTab === "trending" ? "trending"
               : feedTab === "following" ? "following"
               : "latest"

  const isLoading = active === "trending"
    ? trending.isLoading
    : active === "following"
    ? (isAuthenticated && following.isLoading)
    : discover.isLoading

  const isError = active === "trending"
    ? trending.isError
    : active === "following"
    ? following.isError
    : discover.isError

  // Pagination only applies to the cursor-paginated tabs (following / latest).
  // Trending is a fixed top-N — no fetchNextPage.
  const fetchNextPage = active === "following" ? following.fetchNextPage : discover.fetchNextPage
  const hasNextPage   = active === "trending" ? false
                      : active === "following" ? !!following.hasNextPage
                      : !!discover.hasNextPage
  const isFetchingNextPage = active === "following"
    ? following.isFetchingNextPage
    : active === "latest"
    ? discover.isFetchingNextPage
    : false

  const createPost = useCreatePost()

  const posts: Post[] = active === "trending"
    ? (trending.data?.data ?? [])
    : active === "following"
    ? (following.data?.pages.flatMap(p => p.data) ?? [])
    : (discover.data?.pages.flatMap(p => p.data) ?? [])

  // ── Sidebar real-data sources ──────────────────────────────────────
  // Trending tags: derived from the actual #hashtag tokens in the latest
  // 50+ discover posts. Recomputed on every refetch.
  const liveTrendingTags = useMemo(
    () => deriveTrendingTags(posts.map(p => p.content), 8),
    [posts],
  )

  // Active polls — live from /polls, refresh every 8s so the counts the
  // user sees match the data on /poll. Only ACTIVE polls (not expired).
  type ApiPoll = { id: string; question: string; options: Array<{ id: string; label: string; votes: number }>; totalVotes: number; expiresAt: string }
  const { data: pollsApiData } = useQuery({
    queryKey: ["community-sidebar-polls"],
    queryFn:  () => api<{ data: ApiPoll[] }>("/polls?limit=4"),
    refetchInterval: 8_000,
    staleTime: 4_000,
  })
  const livePolls: ActivePoll[] = useMemo(
    () => (pollsApiData?.data ?? [])
      .filter(p => !p.expiresAt || new Date(p.expiresAt) > new Date())
      .slice(0, 2)
      .map(p => ({ id: p.id, question: p.question, options: p.options, totalVotes: p.totalVotes ?? 0 })),
    [pollsApiData],
  )

  const handleImagePick = useCallback(async (file: File) => {
    try {
      const { publicUrl } = await upload(file)
      setAttachedImage(publicUrl)
    } catch {
      // useImageUpload sets `error` — toast it
      if (uploadError) push(uploadError, "error")
    }
  }, [upload, uploadError, push])

  const submitPost = useCallback(() => {
    if (!draft.trim() && !attachedImage) return
    if (!isAuthenticated) { push("Sign in to post", "info"); return }
    // Wrap spoiler content in [spoiler] tags for the backend to handle
    const content = isSpoiler ? `[spoiler]${draft}[/spoiler]` : draft
    createPost.mutate(
      { content: content || " ", imageUrl: attachedImage ?? undefined },
      {
        onSuccess: () => {
          setDraft(""); setComposing(false); setIsSpoiler(false); setAttachedImage(null)
          push("Post published!", "success")
        },
        onError: () => push("Failed to post. Try again.", "error"),
      }
    )
  }, [draft, attachedImage, isAuthenticated, createPost, push, isSpoiler])

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Sticky page header — title + New Post + tabs + counter.
          Sticks at top-0 and pads its content down past the floating navbar
          (z-100, ~110px tall). The header's own opaque bg covers the entire
          strip from top of viewport to bottom of the tabs, so scrolling
          content cannot peek through the navbar's transparent margins. */}
      <div className="sticky top-[var(--sticky-top,0px)] z-40 bg-background border-b border-border shadow-[0_4px_12px_color-mix(in_srgb,var(--app-fg)_4%,transparent)]">
        <div className="max-w-6xl mx-auto px-6 pt-[var(--page-top,120px)] pb-0 flex items-start justify-between gap-4">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">
            Community<span style={{ color: "var(--app-accent)" }}>.</span>
          </h1>
          <button onClick={() => setComposing(c => !c)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-black transition-all hover:scale-[1.03] motion-reduce:transform-none shrink-0 mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
            style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))", boxShadow: "0 4px 16px color-mix(in srgb, var(--app-accent) 35%, transparent)" }}>
            <Plus size={13} /> New Post
          </button>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            {(["trending", "following", "latest"] as FeedTab[]).map(t => (
              <button key={t} onClick={() => setFeedTab(t)}
                aria-pressed={feedTab === t}
                className={`relative px-5 py-3 text-[11px] font-black uppercase tracking-widest capitalize transition-colors rounded-t-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                  feedTab === t
                    ? "text-foreground"
                    : "text-muted hover:text-foreground hover:bg-surface/60"
                }`}>
                {t}
                {feedTab === t && (
                  <motion.div layoutId="feed-tab-line"
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-accent rounded-full motion-reduce:transition-none" />
                )}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted font-mono uppercase tracking-widest tabular-nums shrink-0">
            {posts.length > 0 ? `${posts.length}+ posts · The Dojo` : "The Dojo — share your thoughts"}
          </p>
        </div>
      </div>

      {/* Floating New Post button — visible after scrolling past header */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setComposing(c => !c)}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-black transition-all hover:scale-105 md:hidden"
        style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))", boxShadow: "0 8px 24px color-mix(in srgb, var(--app-accent) 50%, transparent)" }}
      >
        <Plus size={14} /> Post
      </motion.button>

      <div className="max-w-6xl mx-auto px-6 pt-6 grid lg:grid-cols-3 gap-8">

        {/* Feed */}
        <div className="lg:col-span-2 space-y-5">

          {/* Composer */}
          <AnimatePresence>
            {composing && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="bg-surface-2 border border-accent/20 rounded-2xl p-5 space-y-4">
                  <textarea ref={composerRef} value={draft} onChange={e => setDraft(e.target.value)}
                    placeholder={isAuthenticated ? "Share a theory, hot take, or reaction…" : "Sign in to post…"}
                    rows={4} autoFocus disabled={!isAuthenticated}
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-subtle resize-none outline-none leading-relaxed disabled:opacity-40" />

                  {/* Attached image preview */}
                  {attachedImage && (
                    <div className="relative inline-block rounded-xl overflow-hidden border border-border group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attachedImage}
                        alt="Attached"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="max-h-48 w-auto object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setAttachedImage(null)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 backdrop-blur-sm text-muted hover:text-foreground hover:bg-black/90 flex items-center justify-center text-[14px] leading-none transition-colors"
                        aria-label="Remove image"
                      >×</button>
                    </div>
                  )}
                  {isUploading && (
                    <div className="flex items-center gap-2 text-[11px] text-accent-bright">
                      <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
                        <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="tabular-nums">{progress}%</span>
                    </div>
                  )}
                  {uploadError && !isUploading && (
                    <p className="text-[11px] text-rose-400">{uploadError}</p>
                  )}

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        title="Mention a user (@)"
                        aria-label="Mention a user"
                        onClick={() => insertAtCursor("@")}
                        className="p-2 rounded-lg text-muted hover:text-accent-bright hover:bg-accent/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"><AtSign size={15} /></button>
                      <button
                        type="button"
                        title="Add a hashtag (#)"
                        aria-label="Add a hashtag"
                        onClick={() => insertAtCursor("#")}
                        className="p-2 rounded-lg text-muted hover:text-accent-bright hover:bg-accent/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"><Hash size={15} /></button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={e => {
                          const f = e.target.files?.[0]
                          if (f) handleImagePick(f)
                          e.target.value = ""
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        title={isUploading ? `Uploading ${progress}%…` : "Attach an image"}
                        disabled={isUploading || !!attachedImage}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-1.5 transition-colors ${
                          isUploading
                            ? "text-accent-bright animate-pulse"
                            : attachedImage
                            ? "text-emerald-400"
                            : "text-subtle hover:text-accent-bright"
                        }`}
                      ><ImageIcon size={15} /></button>
                      {/* Spoiler toggle */}
                      <button onClick={() => setIsSpoiler(s => !s)}
                        title="Mark as spoiler"
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                          isSpoiler ? "bg-accent/20 text-accent-bright border border-accent/30" : "text-subtle hover:text-accent-bright hover:bg-accent/10"
                        }`}>
                        ⚠️ Spoiler
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono ${500 - draft.length < 50 ? "text-accent-bright" : "text-subtle"}`}>{500 - draft.length}</span>
                      <button onClick={submitPost} disabled={!draft.trim() || createPost.isPending}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-bright disabled:opacity-40 text-xs font-black uppercase tracking-wider text-foreground transition-all">
                        {createPost.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-surface-2 border border-border rounded-2xl p-6 space-y-3 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-surface" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-24 bg-surface rounded-full" />
                      <div className="h-2 w-16 bg-surface rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-full bg-surface rounded-full" />
                    <div className="h-3 w-4/5 bg-surface rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="py-16 text-center">
              <p className="text-subtle font-black uppercase tracking-widest text-xs">Failed to load posts</p>
            </div>
          )}

          {/* Posts */}
          <AnimatePresence mode="popLayout">
            {posts.map(post => <PostCard key={post.id} post={post} />)}
          </AnimatePresence>

          {/* Load more */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-surface hover:bg-surface text-xs font-black uppercase tracking-widest text-muted hover:text-foreground transition-all disabled:opacity-40">
                {isFetchingNextPage ? <Loader2 size={12} className="animate-spin" /> : null}
                Load More
              </button>
            </div>
          )}

          {!isLoading && posts.length === 0 && (
            <div className="py-20 text-center border border-dashed border-border rounded-2xl">
              <MessageSquare size={24} className="mx-auto mb-3 text-subtle" />
              <p className="text-subtle font-black uppercase tracking-widest text-xs">No posts yet — be first!</p>
            </div>
          )}
        </div>

        {/* Sidebar — sticky + independent scroll. Lenis-prevent so wheel
            scrolling here only moves the sidebar, not the page. */}
        <aside
          data-lenis-prevent
          className="lg:sticky lg:top-[220px] lg:self-start lg:max-h-[calc(100vh-240px)] lg:overflow-y-auto lg:overscroll-contain space-y-6 lg:pr-2"
        >
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-accent-bright" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Trending Tags</h3>
            </div>
            {liveTrendingTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {liveTrendingTags.map((tag, i) => (
                  <motion.span key={tag} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                    <Link href={`/search?q=${encodeURIComponent("#" + tag)}&type=posts`}
                      className="px-3 py-1.5 rounded-full bg-surface-2 border border-border text-[10px] font-bold text-muted hover:text-accent-bright hover:border-accent/30 transition-colors inline-block">
                      #{tag}
                    </Link>
                  </motion.span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted">No hashtags in the feed yet — be the first to start a trend.</p>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Vote size={14} className="text-accent-bright" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Active Polls</h3>
              </div>
              <Link href="/poll" className="text-[10px] font-bold text-accent-bright/80 hover:text-accent-bright transition-colors">
                All →
              </Link>
            </div>
            {livePolls.length > 0
              ? livePolls.map(poll => <ActivePollRow key={poll.id} poll={poll} />)
              : <p className="text-[11px] text-muted">No active polls right now. <Link href="/creators/create/polls" className="text-accent-bright hover:underline">Create one</Link>.</p>}
          </div>

          <WatchlistPreviewWidget />
          <WhoToFollowWidget />
          <TrendingWidget />

          <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-orange-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Live Activity</h3>
            </div>
            {[
              { label: "Posts today",      value: posts.length > 0 ? `${posts.length}+` : "..." },
              { label: "Shinobi online",   value: "12.4k" },
              { label: "Votes cast today", value: "3,201" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-subtle">{label}</span>
                <span className="text-sm font-black text-foreground">{value}</span>
              </div>
            ))}
          </div>

          <Link href="/creators"
            className="flex items-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-accent/20 hover:from-indigo-600/20 transition-all group">
            <div className="h-10 w-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
              <Users size={16} className="text-accent-bright" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground group-hover:text-accent-bright transition-colors">Creator Studio</p>
              <p className="text-[10px] text-subtle mt-0.5">Publish blogs, polls, and feeds</p>
            </div>
          </Link>
        </aside>
      </div>
    </div>
  )
}
