"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useFeed, useDeletePost } from "@/hooks/usePosts"
import { useToast } from "@/stores/toast.store"
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
  draft:     { label: "Draft",     cls: "bg-surface-2 text-muted border-border" },
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

  const displayFeed = apiFeedPosts
  void ENHANCED_FEED

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

  const totalComments = displayFeed.reduce((s, p) => s + p.comments, 0)
  const publishedCount = displayFeed.filter(p => p.status === "published").length

  return (
    <div className="space-y-8">
      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-surface">
        {/* Aurora background */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-90"
          style={{
            background:
              "radial-gradient(60% 80% at 100% 0%, color-mix(in srgb, var(--app-accent) 28%, transparent), transparent 70%)," +
              "radial-gradient(50% 70% at 0% 100%, color-mix(in srgb, var(--app-accent-bright) 18%, transparent), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(color-mix(in srgb, var(--app-fg) 60%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--app-fg) 60%, transparent) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse 70% 80% at 50% 50%, black 25%, transparent 80%)",
          }}
        />

        <div className="relative p-8 sm:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-3 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] bg-accent/12 border border-accent/30 text-accent-bright">
              <Rss size={11} /> Creator Studio
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase italic text-foreground leading-[0.95]">
              {folderId ? "Folder" : "Feed"}<span style={{ color: "var(--app-accent)" }}>.</span>
            </h1>
            <p className="text-sm text-muted max-w-md">
              {publishedCount} published · {displayFeed.length - publishedCount} drafts · all your short-form takes in one place.
            </p>
          </div>

          <Link
            href="/creators/create/feed"
            className="self-start md:self-end inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-black transition-all hover:scale-[1.03] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
            style={{
              background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))",
              boxShadow: "0 8px 24px color-mix(in srgb, var(--app-accent) 35%, transparent)",
            }}
          >
            <Plus size={13} /> New Post
          </Link>
        </div>
      </section>

      {/* ── Stat tiles ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Eye}            label="Total Views"   value={totalViews.toLocaleString()}    sub="across all posts" color="var(--app-accent-bright)" />
        <StatCard icon={Heart}          label="Total Likes"   value={totalLikes.toLocaleString()}    sub="from your fans"   color="#fb7185" />
        <StatCard icon={MessageCircle}  label="Conversations" value={totalComments.toLocaleString()} sub="comments earned"  color="var(--app-accent)" />
      </div>

      {/* ── Toolbar: search + status pills + sort ──────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search posts…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted outline-none focus:border-accent/40 focus:bg-surface transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-surface-2 border border-border rounded-xl p-1 shrink-0">
          {(["all", "published", "draft"] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              aria-pressed={statusFilter === f}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                statusFilter === f
                  ? "bg-accent text-black"
                  : "text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Posts ──────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visible.map((post, i) => (
            <FeedPostRow key={post.id} post={post} index={i} />
          ))}
        </AnimatePresence>

        {visible.length === 0 && (
          <div className="text-center py-20 rounded-2xl border border-dashed border-border bg-surface">
            <Rss size={34} className="mx-auto mb-3 text-muted" />
            <p className="text-sm font-semibold text-foreground">No posts match that filter</p>
            <p className="text-xs text-muted mt-1">Try a different status, or clear the search.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FeedPostRow({ post, index }: { post: FeedPost; index: number }) {
  const { label, cls } = STATUS_CONFIG[post.status]
  const [menuOpen, setMenuOpen] = useState(false)
  const deletePost = useDeletePost(post.id)
  const { push } = useToast()

  const onDelete = () => {
    if (!confirm("Delete this post? This cannot be undone.")) return
    deletePost.mutate(undefined, {
      onSuccess: () => push("Post deleted", "success"),
      onError:   () => push("Could not delete post", "error"),
    })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.03 }}
      className="group relative bg-surface border border-border rounded-2xl px-5 py-4 flex items-center gap-4 overflow-hidden hover:border-accent/30 transition-all hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--app-fg)_6%,transparent)]"
    >
      {/* Subtle accent edge on hover */}
      <span
        aria-hidden
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
      />

      {/* Post info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
          {post.anime && (
            <span className="text-[10px] font-bold text-accent-bright bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
              {post.anime}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-[14px] text-foreground truncate group-hover:text-accent-bright transition-colors">
          {post.title}
        </h3>
      </div>

      {/* Stats — show on sm+, tighten on hover for action room */}
      <div className="hidden sm:flex items-center gap-4 text-[11px] font-bold text-muted shrink-0 transition-opacity group-hover:opacity-90">
        {post.views > 0 && (
          <span className="flex items-center gap-1.5 tabular-nums" title="Views">
            <Eye size={13} className="text-muted" /> {post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}k` : post.views}
          </span>
        )}
        {post.likes > 0 && (
          <span className="flex items-center gap-1.5 tabular-nums" title="Likes">
            <Heart size={13} className="text-rose-400" /> {post.likes}
          </span>
        )}
        {post.comments > 0 && (
          <span className="flex items-center gap-1.5 tabular-nums" title="Comments">
            <MessageCircle size={13} className="text-accent-bright" /> {post.comments}
          </span>
        )}
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-subtle">
          <Clock size={12} /> {post.createdAt}
        </span>
      </div>

      {/* Actions — fade in on hover, focus-visible keeps them reachable via keyboard */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <Link
          href={`/creators/create/feed?id=${post.id}`}
          aria-label="Edit post"
          className="p-2 rounded-lg text-muted hover:text-accent-bright hover:bg-accent/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <Edit2 size={14} />
        </Link>
        <button
          type="button"
          onClick={onDelete}
          disabled={deletePost.isPending}
          aria-label="Delete post"
          title="Delete post"
          className="p-2 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="relative overflow-hidden bg-surface border border-border rounded-2xl p-5 group hover:border-accent/25 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">{label}</p>
          <p className="text-3xl font-black tracking-tighter text-foreground tabular-nums mt-1.5">{value}</p>
          <p className="text-[11px] text-muted mt-1">{sub}</p>
        </div>
        <span
          className="h-10 w-10 rounded-xl grid place-items-center shrink-0"
          style={{
            background: `color-mix(in srgb, ${color} 14%, transparent)`,
            color,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 25%, transparent)`,
          }}
        >
          <Icon size={18} />
        </span>
      </div>
    </div>
  )
}
