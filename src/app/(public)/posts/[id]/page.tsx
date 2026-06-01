"use client"

import { use, useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { usePost, useLikePost, useCreateComment, useComments } from "@/hooks/usePosts"
import { useLivePost } from "@/hooks/useRealtime"
import { useAuthStore } from "@/stores/auth.store"
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart, MessageSquare, Share2, ChevronLeft, Star, Send, MoreHorizontal,
  ChevronDown, ChevronUp, CornerDownRight,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/stores/toast.store"
import { PostMenu } from "@/components/ui/PostMenu"
import { CommentRow } from "@/components/posts/CommentRow"

/* ── Types ── */
type PostDetail = {
  id: string
  author: string
  avatar: string
  avatarColor: string
  time: string
  anime?: string
  content: string
  likes: number
  comments: number
  liked: boolean
  tags: string[]
}

type Comment = {
  id: number
  author: string
  avatar: string
  avatarColor: string
  time: string
  body: string
  likes: number
  replies?: Reply[]
}

type Reply = {
  id: number
  author: string
  avatar: string
  avatarColor: string
  time: string
  body: string
  likes: number
}

type RelatedPost = {
  id: string
  author: string
  content: string
  anime?: string
  time: string
  likes: number
}

/* ── Mock DB ── */
const POSTS: Record<string, PostDetail> = {
  "1": {
    id: "1",
    author: "Otaku_Arch",
    avatar: "O",
    avatarColor: "from-indigo-500 to-violet-600",
    time: "2 hours ago",
    anime: "Frieren: Beyond Journey's End",
    content:
      "Frieren's power scaling episode just broke my brain. The concept of mana concealment being the TRUE skill ceiling is one of the most thoughtful magic system reveals I've ever seen.\n\nThink about it — every other fantasy series makes power about raw output. The one who blasts the biggest fireball wins. Frieren says: no. The truly powerful mage is the one whose presence you can't detect. The one who can look ordinary right up until the moment they aren't.\n\nThis applies to Frieren herself across the entire series. She's spent centuries looking like an absent-minded spell collector. The Serie exam arc recontextualizes everything. The magic system isn't just well-designed — it's philosophically coherent with what the series is saying about presence, absence, and the danger of underestimating quiet people.\n\nKosehon Atsumi's adaptation deserves every award it has received and more. The decision to keep the color palette muted and the score sparse — trust the silence — is a masterclass in restraint.\n\nEvery rewatch rewards you with something new. Background characters you dismissed turn out to be ancient terrors in disguise. Frieren's casual dismissals of danger now read as the deadpan confidence of someone who has fought beings most people can't comprehend. The writing trusts you to notice. That trust is rare.",
    likes: 312,
    comments: 48,
    liked: false,
    tags: ["power-scaling", "frieren", "magic-system", "anime-theory"],
  },
  "2": {
    id: "2",
    author: "ShadowWatcher",
    avatar: "S",
    avatarColor: "from-violet-500 to-purple-600",
    time: "4 hours ago",
    anime: "Chainsaw Man",
    content:
      "Controversial take: Chainsaw Man's anime actually elevated the manga. MAPPA's cinematographic direction in the final arc is something no adaptation has done before. Fight me.\n\nFujimoto's original panels are electric, yes — but the adaptation made deliberate choices to slow down, add negative space, and let the horror breathe. The Bomb Devil arc's color grading alone is some of the most intentional visual design in recent anime history.\n\nPeople complained about the ending credits format at the time. Looking back, each episode having its own unique ending felt like a flex of creative confidence. Every director brought a different lens to the series' identity crisis: is this horror, comedy, tragedy, satire? Yes. All of it.\n\nThe Reze arc cinematography especially deserves academic study. The way rain is used to signal emotional temperature shifts — it's not incidental, it's the grammar of the whole arc.\n\nFujimoto himself approved these choices. That alone should settle the debate. The man knows what his own work is about better than any of us, and if he greenlit every significant deviation, they were likely intentional improvements.",
    likes: 184,
    comments: 93,
    liked: true,
    tags: ["chainsaw-man", "hot-take", "animation", "mappa"],
  },
  "3": {
    id: "3",
    author: "NeuralBot_X",
    avatar: "N",
    avatarColor: "from-cyan-500 to-blue-600",
    time: "6 hours ago",
    anime: "Monster",
    content:
      "Just finished Monster for the first time in 2026. Why did nobody tell me this exists?? Absolutely floored. 74 episodes and not a single bad one. Johan is the greatest villain in anime history — no debate.\n\nI went in expecting a slow procedural. What I got was a character study of evil that refuses to explain itself. The show is deeply uncomfortable with the idea that some evil is simply... present. No trauma flashback that fully explains it. No redemption arc. No final monologue where everything is tied up.\n\nJohan's genius is structural: he is barely in the series. He operates like gravity — invisible, inexorable, felt in the distortion of everything around him. Tenma spends 70 episodes chasing a shape.\n\nThe Eva Heinemann subplot, which I initially dismissed as a detour, turned out to be the series' emotional core. Her relationship with her father and the way it mirrors Tenma's obsession with Johan is something I'll be thinking about for a long time.\n\nNaoki Urasawa understands that the scariest monster is one with a comprehensible origin and incomprehensible conclusions. Watch Monster. Drop what you're doing and watch Monster.",
    likes: 427,
    comments: 62,
    liked: false,
    tags: ["monster", "underrated", "villain", "johan"],
  },
}

const FALLBACK_POST: PostDetail = {
  id: "0",
  author: "Shinobi",
  avatar: "S",
  avatarColor: "from-zinc-500 to-zinc-700",
  time: "recently",
  content: "This post has moved or no longer exists.",
  likes: 0,
  comments: 0,
  liked: false,
  tags: [],
}

const RELATED_BY_AUTHOR: Record<string, RelatedPost[]> = {
  "1": [
    { id: "101", author: "Otaku_Arch", content: "Hot take: the Sousou no Frieren OST by Evan Call is the best anime soundtrack of the decade. Nothing else comes close to its emotional restraint.", anime: "Frieren: Beyond Journey's End", time: "1 day ago", likes: 204 },
    { id: "102", author: "Otaku_Arch", content: "Completed my full Madhouse rewatch project. Their golden era (2004–2011) produced more masterworks per year than any studio before or since.", time: "3 days ago", likes: 381 },
    { id: "103", author: "Otaku_Arch", content: "The Berserk 1997 adaptation still outperforms every modern fantasy adaptation in terms of raw atmosphere. Kentaro Miura's world has never felt more alive on screen.", anime: "Berserk", time: "5 days ago", likes: 176 },
  ],
  "2": [
    { id: "201", author: "ShadowWatcher", content: "MAPPA's production quality discourse misses the point. Compare their output volume to any other studio. The miracle isn't some episodes look rough — it's that most are still excellent.", time: "6 hours ago", likes: 97 },
    { id: "202", author: "ShadowWatcher", content: "Every season I try to pick an underrated gem to champion. This season it's Dungeon Meshi. Trigger's creature design alone warrants immediate attention.", anime: "Delicious in Dungeon", time: "2 days ago", likes: 142 },
    { id: "203", author: "ShadowWatcher", content: "Finished Vinland Saga S2 last night. The contrast with S1 is intentional and perfect. Going from war epic to pacifist farming anime is the bravest sequel decision in years.", anime: "Vinland Saga", time: "4 days ago", likes: 289 },
  ],
  "3": [
    { id: "301", author: "NeuralBot_X", content: "Starting Berserk 1997 on recommendation after Monster. If this hit the same way I don't know what I'll do. Prepared to be broken.", anime: "Berserk", time: "1 hour ago", likes: 53 },
    { id: "302", author: "NeuralBot_X", content: "Monster convinced me Urasawa is the greatest manga artist working in the thriller genre. Now starting 20th Century Boys. Send help.", time: "3 hours ago", likes: 118 },
    { id: "303", author: "NeuralBot_X", content: "Ranked every Madhouse anime I've seen: Monster > HxH 2011 > Death Note > One Punch Man S1. All elite. The ranking is impossible but someone had to do it.", time: "8 hours ago", likes: 76 },
  ],
}

const FALLBACK_RELATED: RelatedPost[] = [
  { id: "r1", author: "Shinobi_A", content: "Great discussion in the community lately. Anime fans genuinely have the best takes.", time: "2 hours ago", likes: 34 },
  { id: "r2", author: "Shinobi_B", content: "Season finales are hitting different this year. Something in the air.", time: "5 hours ago", likes: 61 },
  { id: "r3", author: "Shinobi_C", content: "New seasonal rankings are up — drop your top 3 in the comments.", time: "1 day ago", likes: 88 },
]

/* ── Comment card with inline reply expand ── */
function CommentCard({ comment, index }: { comment: Comment; index: number }) {
  const [liked, setLiked]             = useState(false)
  const [replyLikes, setReplyLikes]   = useState<Record<number, boolean>>({})
  const [showReplies, setShowReplies] = useState(false)
  const hasReplies = (comment.replies?.length ?? 0) > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-2xl bg-surface border border-border space-y-3"
    >
      {/* Author */}
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${comment.avatarColor} flex items-center justify-center text-xs font-black shrink-0`}>
          {comment.avatar}
        </div>
        <div>
          <p className="text-xs font-black text-foreground">{comment.author}</p>
          <p className="text-[9px] text-subtle">{comment.time}</p>
        </div>
      </div>

      {/* Body */}
      <p className="text-sm text-muted leading-relaxed">{comment.body}</p>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setLiked(l => !l)}
          className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${
            liked ? "text-rose-400" : "text-subtle hover:text-rose-400"
          }`}
        >
          <Heart size={10} fill={liked ? "currentColor" : "none"} />
          {comment.likes + (liked ? 1 : 0)}
        </button>

        {hasReplies && (
          <button
            onClick={() => setShowReplies(s => !s)}
            className="flex items-center gap-1 text-[10px] font-bold text-subtle hover:text-accent-bright transition-colors"
          >
            {showReplies ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            {comment.replies!.length} {comment.replies!.length === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {/* Inline replies */}
      <AnimatePresence>
        {showReplies && hasReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-2 ml-5 pl-4 border-l border-border space-y-3">
              {comment.replies!.map((reply) => (
                <div key={reply.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CornerDownRight size={10} className="text-subtle shrink-0" />
                    <div className={`h-6 w-6 rounded-lg bg-gradient-to-br ${reply.avatarColor} flex items-center justify-center text-[9px] font-black shrink-0`}>
                      {reply.avatar}
                    </div>
                    <p className="text-[10px] font-black text-foreground">{reply.author}</p>
                    <p className="text-[9px] text-subtle">{reply.time}</p>
                  </div>
                  <p className="ml-8 text-[11px] text-muted leading-relaxed">{reply.body}</p>
                  <button
                    onClick={() => setReplyLikes(prev => ({ ...prev, [reply.id]: !prev[reply.id] }))}
                    className={`ml-8 flex items-center gap-1 text-[9px] font-bold transition-colors ${
                      replyLikes[reply.id] ? "text-rose-400" : "text-subtle hover:text-rose-400"
                    }`}
                  >
                    <Heart size={8} fill={replyLikes[reply.id] ? "currentColor" : "none"} />
                    {reply.likes + (replyLikes[reply.id] ? 1 : 0)}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { push } = useToast()
  const authUser = useAuthStore(s => s.user)

  const { data: postData, isLoading, isError } = usePost(id)
  const { data: commentsData } = useComments(id)

  // Realtime: comments arriving from other viewers show up instantly
  useLivePost(id)
  const likeMut = useLikePost(id)
  const commentMut = useCreateComment(id)

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentText, setCommentText] = useState("")

  // Sync like state from API
  useMemo(() => {
    if (postData) {
      setLiked(postData.liked ?? false)
      setLikeCount(postData.post._count?.likes ?? 0)
    }
  }, [postData])

  // Map API post to local shape — no fallback mocks. If the post isn't
  // loaded, we render the loading / error UI further below.
  const apiPost = postData?.post
  const post = apiPost
    ? {
        ...FALLBACK_POST, // only used for unused decorative fields (tags)
        id: apiPost.id,
        author: apiPost.author?.displayName ?? apiPost.author?.username ?? "Anonymous",
        avatar: (apiPost.author?.displayName ?? apiPost.author?.username ?? "?")[0].toUpperCase(),
        time: timeAgo(apiPost.createdAt),
        anime: apiPost.anime?.title,
        content: apiPost.content,
        likes: likeCount,
        comments: apiPost._count?.comments ?? 0,
        liked,
        authorUsername: apiPost.author?.username,
      }
    : null

  const apiComments = (commentsData?.data ?? []).map(c => ({
    id: c.id as unknown as number,
    author: c.author?.displayName ?? c.author?.username ?? "Anonymous",
    avatar: (c.author?.displayName ?? c.author?.username ?? "?")[0].toUpperCase(),
    avatarColor: "bg-gradient-to-br from-indigo-500 to-violet-600",
    time: timeAgo(c.createdAt),
    body: c.content,
    likes: 0, liked: false, replies: [],
  }))

  const visibleComments = apiComments

  // Related posts: live from /users/:username/posts, capped at 3, excluding
  // the current post. Empty if the author has no other posts.
  type ApiRelatedRow = { id: string; content: string; createdAt: string; _count?: { likes: number } }
  const { data: relatedApi } = useQuery({
    queryKey: ["related-posts", post?.authorUsername ?? ""],
    queryFn:  () => api<{ data: ApiRelatedRow[] }>(`/users/${post!.authorUsername}/posts?page=1&limit=6`),
    enabled:  !!post?.authorUsername,
    staleTime: 60_000,
  })
  const relatedPosts: RelatedPost[] = (relatedApi?.data ?? [])
    .filter(r => r.id !== id)
    .slice(0, 3)
    .map(r => ({
      id: r.id,
      author: post?.author ?? "Author",
      content: r.content,
      time: timeAgo(r.createdAt),
      likes: r._count?.likes ?? 0,
    }))

  const toggleLike = () => {
    if (!authUser) { push("Sign in to like posts", "info"); return }
    const next = !liked
    likeMut.mutate({ like: next }, {
      onSuccess: () => { setLiked(next); setLikeCount(c => next ? c + 1 : c - 1) },
    })
  }

  const submitComment = () => {
    if (!commentText.trim()) return
    if (!authUser) { push("Sign in to comment", "info"); return }
    commentMut.mutate(commentText, {
      onSuccess: () => { setCommentText(""); push("Comment posted!", "success") },
      onError: () => push("Failed to post comment", "error"),
    })
  }

  if (isLoading || !post) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 size={24} className="animate-spin text-accent-bright" /></div>
  if (isError) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-sm text-center space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400">Post unavailable</p>
        <h1 className="text-2xl font-black tracking-tighter text-foreground">We couldn&apos;t load this post.</h1>
        <p className="text-sm text-muted">It may have been deleted or hidden by its author.</p>
        <Link href="/community" className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-accent-bright hover:text-accent transition-colors">
          ← Back to community
        </Link>
      </div>
    </div>
  )

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      push("Link copied!", "success")
    } catch {
      push("Could not copy link", "error")
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-6xl mx-auto px-6 pt-8">

        {/* Back button */}
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-subtle hover:text-foreground transition-colors mb-8"
        >
          <ChevronLeft size={13} /> Back to Community
        </Link>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* ── Main column ── */}
          <div className="space-y-6">

            {/* Post card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-2 border border-border rounded-2xl p-6 space-y-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${post.avatarColor} flex items-center justify-center font-black text-base shrink-0`}>
                    {post.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground">{post.author}</p>
                    <p className="text-[10px] text-subtle">{post.time}</p>
                  </div>
                </div>
                <PostMenu postId={String(post.id)} />
              </div>

              {/* Anime badge */}
              {post.anime && (
                <Link
                  href="/bestanimelist"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/8 border border-accent/15 text-[10px] font-bold text-accent-bright hover:bg-accent/15 transition-colors"
                >
                  <Star size={9} /> {post.anime}
                </Link>
              )}

              {/* Full content */}
              <div className="space-y-3">
                {post.content.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="text-sm text-muted leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-bold text-accent-bright/60 hover:text-accent-bright cursor-pointer transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action bar */}
              <div className="flex items-center gap-5 pt-2 border-t border-border">
                <button
                  onClick={toggleLike}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                    liked ? "text-rose-400" : "text-subtle hover:text-rose-400"
                  }`}
                >
                  <Heart size={14} fill={liked ? "currentColor" : "none"} />
                  {likeCount}
                </button>
                <span className="flex items-center gap-1.5 text-xs font-bold text-subtle">
                  <MessageSquare size={14} />
                  {post.comments}
                </span>
                <button
                  onClick={share}
                  className="flex items-center gap-1.5 text-xs font-bold text-subtle hover:text-muted transition-colors ml-auto"
                >
                  <Share2 size={13} /> Share
                </button>
              </div>
            </motion.div>

            {/* Comment section */}
            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">
                Comments ({visibleComments.length})
              </h2>

              <div className="space-y-4">
                {(commentsData?.data?.length ?? 0) === 0 ? (
                  <div className="text-center py-10 text-subtle text-sm border border-dashed border-border rounded-2xl">
                    Be the first to comment.
                  </div>
                ) : (
                  commentsData!.data.map(c => (
                    <CommentRow
                      key={c.id}
                      comment={c}
                      postId={id}
                      maxDepth={Number.POSITIVE_INFINITY}
                    />
                  ))
                )}
              </div>

              {/* Add comment */}
              <div className="bg-surface-2 border border-border rounded-2xl p-5 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">
                  Add a Comment
                </p>
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Share your thoughts…"
                  rows={3}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-subtle resize-none outline-none leading-relaxed"
                />
                <div className="flex justify-end border-t border-border pt-3">
                  <button
                    onClick={submitComment}
                    disabled={!commentText.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-bright disabled:opacity-40 text-xs font-black uppercase tracking-widest text-foreground transition-all"
                  >
                    <Send size={12} /> Post Comment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar: related posts ── */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">
              More from {post.author}
            </h2>
            <div className="space-y-3">
              {relatedPosts.map((rp, i) => (
                <motion.div
                  key={rp.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                >
                  <Link
                    href={`/posts/${rp.id}`}
                    className="block p-4 rounded-2xl bg-surface border border-border hover:border-accent/25 hover:bg-surface transition-all group"
                  >
                    {rp.anime && (
                      <span className="inline-flex items-center gap-1 mb-2 text-[9px] font-bold text-accent-bright/60">
                        <Star size={8} /> {rp.anime}
                      </span>
                    )}
                    <p className="text-sm text-muted group-hover:text-muted transition-colors line-clamp-3 leading-relaxed">
                      {rp.content}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-[10px] text-subtle">
                      <span>{rp.time}</span>
                      <span className="flex items-center gap-1">
                        <Heart size={9} fill="currentColor" className="text-rose-400/50" /> {rp.likes}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
