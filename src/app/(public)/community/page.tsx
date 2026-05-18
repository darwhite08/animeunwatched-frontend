"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Flame, TrendingUp, Users, Vote,
  Heart, MessageSquare, Share2, MoreHorizontal,
  Plus, Send, AtSign, Hash, Image as ImageIcon, Star, Loader2,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/stores/toast.store"
import ShareCard from "@/components/ui/ShareCard"
import TrendingWidget from "@/components/social/TrendingWidget"
import WatchlistPreviewWidget from "@/components/social/WatchlistPreviewWidget"
import { useDiscover, useCreatePost, useLikePost } from "@/hooks/usePosts"
import { useAuthStore } from "@/stores/auth.store"
import type { Post } from "@/lib/api/types"

type FeedTab = "trending" | "following" | "latest"

const TRENDING_TAGS = ["frieren", "attack-on-titan", "one-piece", "demon-slayer", "jjk", "hxh", "monster"]

const ACTIVE_POLLS = [
  { id: 1, question: "Best anime of 2024?",        votes: 4203, options: ["Dungeon Meshi", "Solo Leveling", "Frieren S2"] },
  { id: 2, question: "Strongest anime character?",  votes: 6841, options: ["Goku", "Saitama", "Anos Voldigoad"] },
]

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60000) return "just now"
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

function PostCard({ post }: { post: Post }) {
  const { push } = useToast()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post._count?.likes ?? 0)
  const likePost = useLikePost(post.id)

  const handleLike = useCallback(() => {
    likePost.mutate(
      { like: !liked },
      {
        onSuccess: () => {
          setLiked(l => !l)
          setLikeCount(c => liked ? c - 1 : c + 1)
        },
        onError: () => push("Sign in to like posts", "info"),
      }
    )
  }, [liked, likePost, push])

  const authorName = post.author?.displayName ?? post.author?.username ?? "Anonymous"
  const avatarLetter = authorName[0]?.toUpperCase() ?? "?"

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/60 border border-white/8 hover:border-white/15 rounded-2xl p-6 space-y-4 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/u/${post.author?.username ?? ""}`}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-sm hover:scale-105 transition-transform">
              {avatarLetter}
            </div>
          </Link>
          <div>
            <Link href={`/u/${post.author?.username ?? ""}`}>
              <p className="text-sm font-black text-white hover:text-indigo-300 transition-colors">{authorName}</p>
            </Link>
            <p className="text-[10px] text-white/30">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <button className="p-1.5 text-white/20 hover:text-white/50 transition-colors">
          <MoreHorizontal size={15} />
        </button>
      </div>

      {post.anime && (
        <Link href={`/anime/${post.anime.malId}`}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/8 border border-indigo-500/15 text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/15 transition-colors">
          <Star size={9} /> {post.anime.title}
        </Link>
      )}

      <p className="text-sm text-white/75 leading-relaxed">{post.content}</p>

      <div className="flex items-center gap-5 pt-1 border-t border-white/5">
        <button onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${liked ? "text-rose-400" : "text-white/30 hover:text-rose-400"}`}>
          <Heart size={14} fill={liked ? "currentColor" : "none"} />
          {likeCount}
        </button>
        <button className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-indigo-400 transition-colors">
          <MessageSquare size={14} />
          {post._count?.comments ?? 0}
        </button>
        <button className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-white/60 transition-colors ml-auto">
          <Share2 size={13} />
        </button>
      </div>
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
              Community<span className="text-indigo-500">.</span>
            </h1>
            <p className="text-xs text-white/30 mt-0.5">
              {posts.length > 0 ? `${posts.length}+ posts from the Shinobi` : "What the Shinobi are watching and saying"}
            </p>
          </div>
          <button onClick={() => setComposing(c => !c)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black uppercase tracking-widest text-white transition-all">
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
              {feedTab === t && <motion.div layoutId="feed-tab-line" className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-full" />}
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
                <div className="bg-zinc-900 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
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
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-black uppercase tracking-wider text-white transition-all">
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
              <TrendingUp size={14} className="text-indigo-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Trending Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TAGS.map((tag, i) => (
                <motion.span key={tag} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-[10px] font-bold text-white/50 hover:text-indigo-400 hover:border-indigo-500/25 cursor-pointer transition-all">
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
            className="flex items-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-indigo-500/20 hover:from-indigo-600/20 transition-all group">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Users size={16} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">Creator Studio</p>
              <p className="text-[10px] text-white/35 mt-0.5">Publish blogs, polls, and feeds</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
