"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Send,
  Smile,
  UserPlus,
  UserCheck,
  Star,
  TrendingUp,
  Users,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { useFeed, useDiscover, useCreatePost, useLikePost, useDeletePost } from "@/hooks/usePosts"
import { Avatar } from "@/components/ui/Avatar"
import { PostMenu } from "@/components/ui/PostMenu"
import { useBrowseAnime } from "@/hooks/useAnime"
import { useLeaderboard } from "@/hooks/useLeaderboard"
import { useLiveFeed, useQueuedPosts } from "@/hooks/useRealtime"
import { useLiveTime } from "@/hooks/useLiveTime"
import { NewPostsBanner } from "@/components/feed/NewPostsBanner"
import { PostLikersModal } from "@/components/posts/PostLikersModal"
import { HeartLike } from "@/components/ui/HeartLike"

// Renders an auto-updating relative timestamp ("just now" → "1m ago" → ...)
function LiveTime({ iso }: { iso: string }) { return <>{useLiveTime(iso)}</> }
import type { Post } from "@/lib/api/types"
import { Loader2 } from "lucide-react"

/* ── Types ── */
type FeedPost = {
  id: number
  author: string
  avatar: string
  time: string
  content: string
  anime?: string
  likes: number
  comments: number
  liked: boolean
  tags: string[]
  isFollowing: boolean
}

type FeedTab = "foryou" | "following" | "latest"

type Suggestion = {
  username: string
  avatar: string
  grade: string
  followers: number
  isFollowing: boolean
}

/* ── Avatar gradient palettes ── */
const AVATAR_GRADIENTS = [
  "from-accent to-orange-600",
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-blue-600",
  "from-purple-500 to-fuchsia-600",
  "from-cyan-500 to-indigo-600",
  "from-lime-500 to-green-600",
] as const

function avatarGradient(letter: string): string {
  const idx = letter.charCodeAt(0) % AVATAR_GRADIENTS.length
  return AVATAR_GRADIENTS[idx]
}

/* ── RealPostCard — uses real useLikePost API ── */
function RealPostCard({ post, index }: { post: Post; index: number }) {
  const { push } = useToast()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const me = useAuthStore(s => s.user)
  const [liked, setLiked] = useState(post.isLikedByMe ?? false)
  const [likeCount, setLikeCount] = useState(post._count?.likes ?? 0)
  const [likersOpen, setLikersOpen] = useState(false)
  const likePost = useLikePost(post.id)
  const deletePost = useDeletePost(post.id)

  // Resync local state when the post prop changes (refetch / socket invalidation)
  useEffect(() => {
    setLiked(post.isLikedByMe ?? false)
    setLikeCount(post._count?.likes ?? 0)
  }, [post.isLikedByMe, post._count?.likes])

  const handleLike = () => {
    if (!isAuthenticated) { push("Sign in to like posts", "info"); return }
    likePost.mutate(
      { like: !liked },
      {
        // Server-authoritative state — prevents drift after refresh
        onSuccess: (res) => { setLiked(res.liked); setLikeCount(res.count) },
        onError: () => push("Could not update like", "error"),
      }
    )
  }

  const authorName = post.author?.displayName ?? post.author?.username ?? "?"
  const gradClass = avatarGradient(authorName[0] ?? "A")

  return (
    <motion.article key={post.id} layout
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-surface-2 border border-white/[0.08] hover:border-accent/10 rounded-2xl p-6 space-y-4 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/u/${post.author?.username ?? ""}`} className="shrink-0 hover:opacity-80 transition-opacity">
            <Avatar src={post.author?.avatarUrl} name={authorName} size={40} fallbackClassName={`bg-gradient-to-br ${gradClass}`} />
          </Link>
          <div>
            <Link href={`/u/${post.author?.username ?? ""}`}
              className="text-sm font-black text-foreground hover:text-accent-bright transition-colors">
              {authorName}
            </Link>
            <p className="text-[10px] text-subtle mt-0.5"><LiveTime iso={post.createdAt} /></p>
          </div>
        </div>
        <PostMenu
          postId={post.id}
          isOwner={!!me && post.author?.id === me.id}
          onDelete={() => {
            if (!confirm("Delete this post? This cannot be undone.")) return
            deletePost.mutate(undefined, {
              onSuccess: () => push("Post deleted", "success"),
              onError:   () => push("Could not delete post", "error"),
            })
          }}
        />
      </div>

      {post.anime && (
        <Link href={`/anime/${post.anime.malId}`}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/8 border border-accent/15 text-[10px] font-bold text-accent-bright hover:bg-accent/15 transition-colors">
          <Star size={9} fill="currentColor" /> {post.anime.title}
        </Link>
      )}

      <p className="text-sm text-muted leading-relaxed">{post.content}</p>

      {/* Instagram-style "liked by" — overlapping avatars + tap to see the list */}
      {likeCount > 0 && (
        <button
          onClick={() => setLikersOpen(true)}
          className="flex items-center gap-2 text-[11px] font-bold text-muted hover:text-foreground transition-colors -mb-1 w-fit"
        >
          {(post.likePreview?.length ?? 0) > 0 ? (
            <span className="flex -space-x-2 shrink-0">
              {post.likePreview!.slice(0, 3).map((u, i) =>
                u.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={i} src={u.avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover ring-2 ring-background" />
                ) : (
                  <span key={i} className="h-5 w-5 rounded-full ring-2 ring-background bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[8px] font-black text-white">
                    {u.displayName[0]?.toUpperCase()}
                  </span>
                ),
              )}
            </span>
          ) : (
            <Heart size={11} className="text-rose-400" fill="currentColor" />
          )}
          {post.likePreview && post.likePreview.length > 0 ? (
            <span>
              Liked by <span className="text-foreground">{post.likePreview[0].displayName}</span>
              {likeCount > 1 && <> and <span className="text-foreground">{(likeCount - 1).toLocaleString()}</span> {likeCount - 1 === 1 ? "other" : "others"}</>}
            </span>
          ) : (
            <span>Liked by <span className="text-foreground">{likeCount.toLocaleString()}</span> {likeCount === 1 ? "person" : "people"}</span>
          )}
        </button>
      )}
      <PostLikersModal postId={post.id} open={likersOpen} onClose={() => setLikersOpen(false)} />

      <div className="flex items-center gap-5 pt-1 border-t border-border">
        <span className={`flex items-center gap-1.5 text-xs font-bold ${liked ? "text-rose-400" : "text-subtle"}`}>
          <HeartLike liked={liked} onToggle={handleLike} size={16} />
          {likeCount > 0 && likeCount}
        </span>
        <Link
          href={`/posts/${post.id}#comments`}
          className="flex items-center gap-1.5 text-xs font-bold text-subtle hover:text-accent-bright transition-colors"
        >
          <MessageSquare size={14} />
          {post._count?.comments ?? 0}
        </Link>
        <button onClick={() => {
          const url = `${window.location.origin}/posts/${post.id}`
          navigator.clipboard.writeText(url).catch(() => {})
          push("Link copied!", "success")
        }} className="flex items-center gap-1.5 text-xs font-bold text-subtle hover:text-muted transition-colors ml-auto">
          <Share2 size={13} />
        </button>
      </div>
    </motion.article>
  )
}

/* ── Page ── */
function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 60000) return "just now"
  if (d < 3600000) return `${Math.floor(d/60000)}m ago`
  if (d < 86400000) return `${Math.floor(d/3600000)}h ago`
  return `${Math.floor(d/86400000)}d ago`
}

export default function FeedPage() {
  const { push } = useToast()
  const { user } = useAuthStore()
  const [feedTab, setFeedTab] = useState<FeedTab>("foryou")
  const [draft, setDraft] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  // Realtime: buffer new posts in a queue when the user has scrolled past the top.
  // We only auto-prepend if the user is near the top — otherwise we show a
  // floating "↑ N new posts" banner that flushes on click (WhatsApp/Twitter style).
  const queryKeys = [["posts/discover"] as const, ["posts/feed"] as const]
  const { queueLength, enqueue, flush } = useQueuedPosts(queryKeys)
  useLiveFeed({
    onQueue: (post) => {
      // If the user is at the very top, prepend immediately. Otherwise queue.
      if (typeof window !== "undefined" && window.scrollY < 240) {
        // Drain via flush AFTER buffering, so order is preserved
        enqueue(post)
        flush()
      } else {
        enqueue(post)
      }
    },
  })

  const handleFlushAndScrollUp = () => {
    flush()
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const { data: feedData, isLoading: feedLoading } = useFeed()
  const { data: discoverData, isLoading: discoverLoading } = useDiscover()
  const { data: trendingData } = useBrowseAnime({ limit: 4 })
  const { data: lbData } = useLeaderboard(8)

  // Seed suggestions from leaderboard data — exclude self
  const leaderboardSuggestions = (lbData?.data ?? [])
    .filter(u => u.username !== user?.username)
    .slice(0, 5)
    .map(u => ({ username: u.username, avatar: u.displayName[0]?.toUpperCase() ?? "?", followers: u.reputation, isFollowing: false }))
  const trendingAnime = trendingData?.data ?? []
  const createPostMut = useCreatePost()

  const isLoading = feedTab === "following" ? feedLoading : discoverLoading

  const apiPosts: Post[] = feedTab === "following"
    ? (feedData?.pages.flatMap(p => p.data) ?? [])
    : (discoverData?.pages.flatMap(p => p.data) ?? [])

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  const authorInitial = user?.username?.slice(0, 1).toUpperCase() ?? "?"

  const toggleLike = (id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const submitPost = () => {
    if (!draft.trim()) return
    if (!user) { push("Sign in to post", "info"); return }
    createPostMut.mutate(
      { content: draft },
      {
        onSuccess: () => { setDraft(""); push("Post published!", "success") },
        onError: () => push("Failed to post", "error"),
      }
    )
  }

  const toggleSuggestFollow = (username: string) => {
    setSuggestions((ss) =>
      ss.map((s) => {
        if (s.username !== username) return s
        const next = !s.isFollowing
        push(
          next ? `You're now following @${username}! 🎌` : `Unfollowed @${username}`,
          next ? "success" : "info",
        )
        return { ...s, isFollowing: next }
      }),
    )
  }

  // Show API posts when available, fallback to mock data when loading is done and API returned nothing
  const visiblePosts = apiPosts

  const TAB_LABELS: { key: FeedTab; label: string }[] = [
    { key: "foryou", label: "For You" },
    { key: "following", label: "Following" },
    { key: "latest", label: "Latest" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">

      {/* Live "↑ N new posts" floating banner */}
      <NewPostsBanner count={queueLength} onClick={handleFlushAndScrollUp} />

      {/* ── Sticky header (sits flush under the AppShell topbar, h-14 = 56px) ── */}
      <div className="border-b border-border bg-black/50 backdrop-blur-md sticky top-14 z-20">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tighter uppercase italic text-foreground">
                Your Feed<span style={{color:"var(--app-accent)"}}>.</span>
              </h1>
              {/* Live badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-subtle mt-0.5">Posts from people you follow + your own</p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-1 pb-0">
          {TAB_LABELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFeedTab(key)}
              className={`relative px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-colors ${
                feedTab === key ? "text-foreground" : "text-subtle hover:text-muted"
              }`}
            >
              {label}
              {feedTab === key && (
                <motion.div
                  layoutId="feed-tab-line"
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{background:"var(--app-accent)"}}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8 grid lg:grid-cols-3 gap-8">

        {/* ── LEFT: Feed ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Always-visible compose bar */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-2 border border-accent/20 rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-sm shrink-0">
                {authorInitial}
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Share a theory, hot take, or reaction…"
                rows={3}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-subtle resize-none outline-none leading-relaxed pt-1"
              />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <button
                onClick={() => push("Emoji picker coming soon!", "info")}
                className="p-1.5 text-subtle hover:text-accent-bright transition-colors"
              >
                <Smile size={15} />
              </button>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono ${
                    500 - draft.length < 50 ? "text-accent-bright" : "text-subtle"
                  }`}
                >
                  {500 - draft.length}
                </span>
                <button
                  onClick={submitPost}
                  disabled={!draft.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-bright disabled:opacity-40 text-xs font-black uppercase tracking-wider text-foreground transition-all"
                >
                  <Send size={12} /> Post
                </button>
              </div>
            </div>
          </motion.div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-surface-2 border border-border rounded-2xl p-6 space-y-3 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-surface" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-28 bg-surface rounded-full" />
                      <div className="h-2 w-16 bg-surface rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-surface rounded-full" />
                    <div className="h-3 w-5/6 bg-surface rounded-full" />
                    <div className="h-3 w-4/5 bg-surface rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Posts */}
          <AnimatePresence mode="popLayout">
            {!isLoading && visiblePosts.length === 0 && feedTab === "following" ? (
              <motion.div
                key="empty-following"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-20 text-center space-y-5"
              >
                <div className="h-16 w-16 mx-auto rounded-2xl bg-surface border border-border flex items-center justify-center">
                  <Users size={28} className="text-subtle" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-black tracking-tight text-muted">
                    Follow some Shinobi to see their posts here
                  </p>
                  <p className="text-sm text-subtle">
                    Discover fellow anime fans and follow them to build your feed.
                  </p>
                </div>
                <Link
                  href="/users"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-bright text-sm font-black uppercase tracking-widest text-foreground transition-all"
                >
                  <Users size={14} /> Discover Shinobi
                </Link>
              </motion.div>
            ) : !isLoading && visiblePosts.length === 0 ? (
              /* Empty state — no posts yet */
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-20 text-center border border-dashed border-border rounded-2xl space-y-4">
                <MessageSquare size={28} className="mx-auto text-subtle" />
                <div>
                  <p className="text-muted font-black uppercase tracking-widest text-sm">No posts yet</p>
                  <p className="text-subtle text-xs mt-1">
                    {feedTab === "following" ? "Follow Shinobi to see their posts here" : "Be first to post something!"}
                  </p>
                </div>
                <Link href="/community"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-black transition-all"
                  style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))" }}>
                  <Users size={13} /> Visit Community
                </Link>
              </motion.div>
            ) : (
              visiblePosts.map((post, i) => (
                <RealPostCard key={post.id} post={post} index={i} />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="space-y-6">

          {/* Who to Follow */}
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus size={14} className="text-accent-bright" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">
                Who to Follow
              </h3>
            </div>
            <div className="space-y-3">
              {(suggestions.length > 0 ? suggestions : leaderboardSuggestions).map((s) => (
                <motion.div
                  key={s.username}
                  layout
                  className="flex items-center gap-3"
                >
                  <Link href={`/u/${s.username}`}>
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-sm shrink-0 hover:opacity-80 transition-opacity">
                      {s.avatar}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/u/${s.username}`}>
                      <p className="text-xs font-black text-foreground hover:text-accent-bright transition-colors truncate">
                        @{s.username}
                      </p>
                    </Link>
                    <p className="text-[9px] text-subtle">{s.followers.toLocaleString()} followers</p>
                  </div>
                  <motion.button
                    onClick={() => toggleSuggestFollow(s.username)}
                    whileTap={{ scale: 0.92 }}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                      s.isFollowing
                        ? "bg-surface border border-border text-muted hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                        : "bg-accent text-black hover:bg-accent-bright"
                    }`}
                  >
                    {s.isFollowing ? (
                      <><UserCheck size={10} /> Following</>
                    ) : (
                      <><UserPlus size={10} /> Follow</>
                    )}
                  </motion.button>
                </motion.div>
              ))}
            </div>
            <Link
              href="/users"
              className="flex items-center justify-center gap-1.5 pt-2 text-[10px] font-black uppercase tracking-widest text-accent-bright hover:text-accent-bright transition-colors border-t border-border"
            >
              See all recommendations <ChevronRight size={11} />
            </Link>
          </div>

          {/* Trending Anime */}
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-accent-bright" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">
                Trending Now
              </h3>
            </div>
            <div className="space-y-3">
              {trendingAnime.slice(0, 4).map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                  <Link href={`/anime/${item.malId}`}
                    className="flex items-center gap-3 group">
                    <div className="h-8 w-8 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0 text-[10px] font-black text-accent-bright">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-muted group-hover:text-accent-bright transition-colors truncate">{item.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star size={8} className="text-accent-bright" fill="currentColor" />
                        <span className="text-[9px] text-accent-bright/70 font-bold">{(item.score ?? 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Community link */}
          <Link
            href="/community"
            className="flex items-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-accent/20 hover:from-indigo-600/20 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
              <Users size={16} className="text-accent-bright" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground group-hover:text-accent-bright transition-colors">
                Community
              </p>
              <p className="text-[10px] text-subtle mt-0.5">
                Trending posts from all Shinobi
              </p>
            </div>
            <ChevronRight
              size={14}
              className="text-subtle group-hover:text-accent-bright group-hover:translate-x-0.5 transition-all"
            />
          </Link>
        </div>
      </div>
    </div>
  )
}
