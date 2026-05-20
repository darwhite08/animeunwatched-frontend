"use client"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Flame, TrendingUp, Users, Vote,
  Heart, MessageSquare, Share2, MoreHorizontal,
  Plus, Send, AtSign, Hash, Image as ImageIcon, Star, Loader2, ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/stores/toast.store"
import TrendingWidget from "@/components/social/TrendingWidget"
import WatchlistPreviewWidget from "@/components/social/WatchlistPreviewWidget"
import { useDiscover, useCreatePost, useLikePost, useComments, useCreateComment } from "@/hooks/usePosts"
import { useAuthStore } from "@/stores/auth.store"
import type { Post, PostComment } from "@/lib/api/types"

type FeedTab = "trending" | "following" | "latest"

const TRENDING_TAGS = ["frieren", "attack-on-titan", "one-piece", "demon-slayer", "jjk", "hxh", "monster"]

const ACTIVE_POLLS = [
  { id: 1, question: "Best anime of 2024?",       votes: 4203, options: ["Dungeon Meshi", "Solo Leveling", "Frieren S2"] },
  { id: 2, question: "Strongest anime character?", votes: 6841, options: ["Goku", "Saitama", "Anos Voldigoad"] },
]

// Deterministic avatar gradient from author username initial
const AVATAR_GRADIENTS = [
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-blue-600",
  "from-amber-400 to-yellow-500",
  "from-cyan-500 to-indigo-600",
  "from-lime-500 to-green-600",
]
function avatarGradient(name: string): string {
  return AVATAR_GRADIENTS[(name.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length]
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60000) return "just now"
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

/* ── Comment row ── */
function CommentRow({ comment }: { comment: PostComment }) {
  const name   = comment.author?.displayName ?? comment.author?.username ?? "?"
  const letter = name[0]?.toUpperCase() ?? "?"
  const grad   = avatarGradient(name)
  return (
    <div className="flex gap-3">
      <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center font-black text-[11px] shrink-0`}>
        {letter}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-black text-white/80">{name}</span>
          <span className="text-[9px] text-white/25">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-[12px] text-white/65 leading-relaxed mt-0.5">{comment.content}</p>
      </div>
    </div>
  )
}

/* ── Post card ── */
function PostCard({ post }: { post: Post }) {
  const { push }       = useToast()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  // Like state — initialised from API's isLikedByMe so it's correct on load
  const [liked, setLiked]       = useState(post.isLikedByMe ?? false)
  const [likeCount, setLikeCount] = useState(post._count?.likes ?? 0)
  const likePost                 = useLikePost(post.id)

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
    likePost.mutate(
      { like: !liked },
      {
        onSuccess: () => {
          setLiked(l => !l)
          setLikeCount(c => liked ? c - 1 : c + 1)
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
      className="border border-white/8 hover:border-white/12 rounded-2xl overflow-hidden transition-colors"
      style={{ background: "linear-gradient(160deg, rgba(15,15,25,0.9), rgba(10,10,18,0.95))" }}
    >
      <div className="p-5 space-y-4">
        {/* Author row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/u/${post.author?.username ?? ""}`}>
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center font-black text-sm hover:scale-105 transition-transform shrink-0`}>
                {avatarLetter}
              </div>
            </Link>
            <div>
              <Link href={`/u/${post.author?.username ?? ""}`}>
                <p className="text-sm font-black text-white hover:text-amber-300 transition-colors leading-tight">{authorName}</p>
              </Link>
              <p className="text-[10px] text-white/30 mt-0.5">{timeAgo(post.createdAt)}</p>
            </div>
          </div>
          <button className="p-1.5 text-white/20 hover:text-white/50 transition-colors rounded-lg hover:bg-white/5">
            <MoreHorizontal size={15} />
          </button>
        </div>

        {/* Anime tag */}
        {post.anime && (
          <Link href={`/anime/${post.anime.malId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 hover:bg-amber-500/20 transition-colors">
            <Star size={9} weight="fill" className="text-amber-400" /> {post.anime.title}
          </Link>
        )}

        {/* Content */}
        <p className="text-[13px] text-white/80 leading-relaxed">{post.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-1 pt-1 border-t border-white/5">
          {/* Like */}
          <button onClick={handleLike} disabled={likePost.isPending}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all ${
              liked ? "text-rose-400 bg-rose-500/10" : "text-white/35 hover:text-rose-400 hover:bg-rose-500/8"
            }`}>
            <Heart size={14} fill={liked ? "currentColor" : "none"} className="transition-transform active:scale-90" />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          {/* Comment toggle */}
          <button onClick={handleToggleComments}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all ${
              showComments ? "text-amber-400 bg-amber-500/10" : "text-white/35 hover:text-amber-400 hover:bg-amber-500/8"
            }`}>
            <MessageSquare size={14} />
            {commentCount > 0 && <span>{commentCount}</span>}
            <ChevronDown size={10} className={`transition-transform ${showComments ? "rotate-180" : ""}`} />
          </button>

          {/* Share */}
          <button onClick={() => {
            navigator.clipboard.writeText(window.location.origin + `/posts/${post.id}`).catch(() => {})
            push("Link copied!", "success")
          }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-white/35 hover:text-white/70 hover:bg-white/5 transition-all ml-auto">
            <Share2 size={13} />
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
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-5 space-y-4 bg-white/[0.015]">
              {/* Existing comments */}
              {loadingComments && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={16} className="animate-spin text-white/30" />
                </div>
              )}

              {!loadingComments && comments.length === 0 && (
                <p className="text-[11px] text-white/25 font-black uppercase tracking-widest text-center py-3">
                  No comments yet — be first!
                </p>
              )}

              <div className="space-y-4">
                {comments.map(c => <CommentRow key={c.id} comment={c} />)}
              </div>

              {/* New comment input */}
              <div className="flex gap-3 pt-2 border-t border-white/5">
                <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${avatarGradient(useAuthStore.getState().user?.displayName ?? "U")} flex items-center justify-center font-black text-[11px] shrink-0`}>
                  {(useAuthStore.getState().user?.displayName ?? "?")[0]?.toUpperCase()}
                </div>
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white placeholder:text-white/25 resize-none outline-none focus:border-amber-500/40 transition-colors disabled:opacity-40"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] text-white/20 font-mono">{500 - commentDraft.length} chars</span>
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentDraft.trim() || createComment.isPending || !isAuthenticated}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
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

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useDiscover()
  const createPost = useCreatePost()

  const posts: Post[] = data?.pages.flatMap(p => p.data) ?? []

  const submitPost = useCallback(() => {
    if (!draft.trim()) return
    if (!isAuthenticated) { push("Sign in to post", "info"); return }
    createPost.mutate(
      { content: draft },
      {
        onSuccess: () => { setDraft(""); setComposing(false); push("Post published!", "success") },
        onError:   () => push("Failed to post. Try again.", "error"),
      }
    )
  }, [draft, isAuthenticated, createPost, push])

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* Sticky header */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-[72px] z-30">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">
              Community<span style={{color:"#f59e0b"}}>.</span>
            </h1>
            <p className="text-xs text-white/30 mt-0.5">
              {posts.length > 0 ? `${posts.length}+ posts from the Shinobi` : "What the Shinobi are watching and saying"}
            </p>
          </div>
          <button onClick={() => setComposing(c => !c)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-black transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 4px 16px rgba(245,158,11,0.35)" }}>
            <Plus size={13} /> New Post
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-6 flex items-center gap-1 pb-0">
          {(["trending", "following", "latest"] as FeedTab[]).map(t => (
            <button key={t} onClick={() => setFeedTab(t)}
              className={`relative px-5 py-3 text-[11px] font-black uppercase tracking-widest capitalize transition-colors ${
                feedTab === t ? "text-white" : "text-white/30 hover:text-white/60"
              }`}>
              {t}
              {feedTab === t && <motion.div layoutId="feed-tab-line" className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8 grid lg:grid-cols-3 gap-8">

        {/* Feed */}
        <div className="lg:col-span-2 space-y-5">

          {/* Composer */}
          <AnimatePresence>
            {composing && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="bg-zinc-900 border border-amber-500/20 rounded-2xl p-5 space-y-4">
                  <textarea value={draft} onChange={e => setDraft(e.target.value)}
                    placeholder={isAuthenticated ? "Share a theory, hot take, or reaction…" : "Sign in to post…"}
                    rows={4} autoFocus disabled={!isAuthenticated}
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/25 resize-none outline-none leading-relaxed disabled:opacity-40" />
                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex gap-2">
                      {[AtSign, Hash, ImageIcon].map((Icon, i) => (
                        <button key={i} className="p-1.5 text-white/30 hover:text-white transition-colors"><Icon size={15} /></button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono ${500 - draft.length < 50 ? "text-amber-400" : "text-white/20"}`}>{500 - draft.length}</span>
                      <button onClick={submitPost} disabled={!draft.trim() || createPost.isPending}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-xs font-black uppercase tracking-wider text-white transition-all">
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
                <div key={i} className="bg-zinc-900/60 border border-white/8 rounded-2xl p-6 space-y-3 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/10" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-24 bg-white/10 rounded-full" />
                      <div className="h-2 w-16 bg-white/5 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-full bg-white/5 rounded-full" />
                    <div className="h-3 w-4/5 bg-white/5 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="py-16 text-center">
              <p className="text-white/30 font-black uppercase tracking-widest text-xs">Failed to load posts</p>
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
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-all disabled:opacity-40">
                {isFetchingNextPage ? <Loader2 size={12} className="animate-spin" /> : null}
                Load More
              </button>
            </div>
          )}

          {!isLoading && posts.length === 0 && (
            <div className="py-20 text-center border border-dashed border-white/5 rounded-2xl">
              <MessageSquare size={24} className="mx-auto mb-3 text-white/10" />
              <p className="text-white/20 font-black uppercase tracking-widest text-xs">No posts yet — be first!</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-amber-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Trending Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TAGS.map((tag, i) => (
                <motion.span key={tag} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-[10px] font-bold text-white/50 hover:text-amber-400 hover:border-amber-500/25 cursor-pointer transition-all">
                  #{tag}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
            <div className="flex items-center gap-2">
              <Vote size={14} className="text-amber-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Active Polls</h3>
            </div>
            {ACTIVE_POLLS.map(poll => (
              <Link key={poll.id} href="/poll"
                className="block p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 hover:bg-white/[0.04] transition-all group">
                <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{poll.question}</p>
                <p className="text-[10px] text-white/25 mt-1">{poll.votes.toLocaleString()} votes</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {poll.options.map(o => (
                    <span key={o} className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/8 text-amber-400/60">{o}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          <WatchlistPreviewWidget />
          <TrendingWidget />

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-3">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-orange-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Live Activity</h3>
            </div>
            {[
              { label: "Posts today",      value: posts.length > 0 ? `${posts.length}+` : "..." },
              { label: "Shinobi online",   value: "12.4k" },
              { label: "Votes cast today", value: "3,201" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-white/35">{label}</span>
                <span className="text-sm font-black text-white">{value}</span>
              </div>
            ))}
          </div>

          <Link href="/creators"
            className="flex items-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-amber-500/20 hover:from-indigo-600/20 transition-all group">
            <div className="h-10 w-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Users size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">Creator Studio</p>
              <p className="text-[10px] text-white/35 mt-0.5">Publish blogs, polls, and feeds</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
