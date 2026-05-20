"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useFeed } from "@/hooks/usePosts"
import { useAuthStore } from "@/stores/auth.store"
import { motion, AnimatePresence } from "framer-motion"
import { Rss, Plus, Eye, Heart, MessageCircle, MoreHorizontal, Search, Trash2, Edit2, Clock } from "lucide-react"
import { feedContent } from "@/features/creator/data/feedData"

type PostStatus = "published" | "draft"

type FeedPost = {
  id: string
  title: string
  folderId: string
  status: PostStatus
  views: number
  likes: number
  comments: number
  anime?: string
  createdAt: string
}

const ENHANCED_FEED: FeedPost[] = [
  { id: "1", title: "Gojo vs Sukuna Breakdown", folderId: "1", status: "published", views: 4200, likes: 312, comments: 87, anime: "Jujutsu Kaisen", createdAt: "2d ago" },
  { id: "2", title: "Why Luffy Never Gives Up", folderId: "2", status: "published", views: 2100, likes: 198, comments: 43, anime: "One Piece", createdAt: "5d ago" },
  { id: "3", title: "Eren's Real Plan Explained", folderId: "1", status: "published", views: 6800, likes: 520, comments: 142, anime: "Attack on Titan", createdAt: "1w ago" },
  { id: "4", title: "Demon Slayer S5 Theories", folderId: "2", status: "draft", views: 0, likes: 0, comments: 0, anime: "Demon Slayer", createdAt: "just now" },
]

const STATUS_CONFIG: Record<PostStatus, { label: string; cls: string }> = {
  published: { label: "Published", cls: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" },
  draft:     { label: "Draft",     cls: "bg-zinc-600/20 text-zinc-400 border-zinc-500/30" },
}

export default function FeedPage() {
  const searchParams = useSearchParams()
  const folderId = searchParams.get("folder")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | PostStatus>("all")
  const user = useAuthStore(s => s.user)
  const { data: feedData } = useFeed()

  // Build feed posts from real API data (user's own posts)
  const apiFeedPosts: FeedPost[] = useMemo(() => {
    const posts = feedData?.pages.flatMap(p => p.data) ?? []
    return posts.filter(p => p.authorId === user?.id).map((p, i) => ({
      id: p.id, title: p.content.slice(0, 50) + (p.content.length > 50 ? "…" : ""),
      folderId: "1", status: "published" as const,
      views: 0, likes: p._count?.likes ?? 0, comments: p._count?.comments ?? 0,
      anime: p.anime?.title,
      createdAt: (() => { const d = Date.now() - new Date(p.createdAt).getTime(); return d < 3600000 ? `${Math.floor(d/60000)}m ago` : d < 86400000 ? `${Math.floor(d/3600000)}h ago` : `${Math.floor(d/86400000)}d ago` })(),
    }))
  }, [feedData, user])

  const displayFeed = apiFeedPosts.length > 0 ? apiFeedPosts : ENHANCED_FEED

  const visible = useMemo(() => {
    return displayFeed.filter(item => {
      const matchesFolder = !folderId || item.folderId === folderId
      const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      return matchesFolder && matchesQuery && matchesStatus
    })
  }, [displayFeed, folderId, query, statusFilter])

  const totalViews = displayFeed.reduce((s, p) => s + p.views, 0)
  const totalLikes = displayFeed.reduce((s, p) => s + p.likes, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Rss size={18} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">
              {folderId ? "Folder" : "Feed Content"}
            </h1>
            <p className="text-sm text-white/40">{visible.length} posts</p>
          </div>
        </div>

        <Link
          href="/creators/create/feed"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 transition text-sm font-medium"
        >
          <Plus size={15} />
          New Post
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Eye} label="Total Views" value={totalViews.toLocaleString()} color="text-amber-400" />
        <StatCard icon={Heart} label="Total Likes" value={totalLikes.toLocaleString()} color="text-rose-400" />
        <StatCard icon={MessageCircle} label="Comments" value={ENHANCED_FEED.reduce((s, p) => s + p.comments, 0).toString()} color="text-amber-400" />
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search posts…"
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-800 rounded-xl text-sm outline-none placeholder:text-white/30 focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm capitalize transition ${
                statusFilter === f ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visible.map((post, i) => (
            <FeedPostRow key={post.id} post={post} index={i} />
          ))}
        </AnimatePresence>

        {visible.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <Rss size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No posts in this view</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FeedPostRow({ post, index }: { post: FeedPost; index: number }) {
  const { label, cls } = STATUS_CONFIG[post.status]
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.03 }}
      className="group bg-zinc-900 border border-white/10 hover:border-white/20 rounded-2xl px-5 py-4 transition flex items-center gap-4"
    >
      {/* Post info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs border px-2.5 py-0.5 rounded-full ${cls}`}>{label}</span>
          {post.anime && (
            <span className="text-xs text-amber-400/80 bg-indigo-600/10 px-2.5 py-0.5 rounded-full">
              {post.anime}
            </span>
          )}
        </div>
        <h3 className="font-medium text-sm truncate group-hover:text-amber-300 transition">
          {post.title}
        </h3>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-5 text-xs text-white/30 shrink-0">
        {post.views > 0 && (
          <span className="flex items-center gap-1.5">
            <Eye size={12} /> {(post.views / 1000).toFixed(1)}k
          </span>
        )}
        {post.likes > 0 && (
          <span className="flex items-center gap-1.5">
            <Heart size={12} /> {post.likes}
          </span>
        )}
        {post.comments > 0 && (
          <span className="flex items-center gap-1.5">
            <MessageCircle size={12} /> {post.comments}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock size={12} /> {post.createdAt}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <Link
          href={`/creators/create/feed?id=${post.id}`}
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition"
        >
          <Edit2 size={14} />
        </Link>
        <button className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition">
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
      <Icon size={18} className={color} />
      <div>
        <p className="text-lg font-semibold">{value}</p>
        <p className="text-xs text-white/40">{label}</p>
      </div>
    </div>
  )
}
