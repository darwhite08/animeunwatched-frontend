"use client"

import { use } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronRight, Clock, Eye, Heart, PenSquare, User } from "lucide-react"
import { useBlogs } from "@/hooks/useBlogs"

/* ── Types ── */
type BlogCategory = "Deep Dive" | "Review" | "Theory" | "Opinion" | "List"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: BlogCategory
  coverGradient: string
  publishedAt: string
  readTime: number
  views: number
  likes: number
}

/* ── Cover gradients (cycled by index) ── */
const COVER_GRADIENTS = [
  "from-indigo-900 via-violet-900 to-purple-900",
  "from-blue-900 via-cyan-900 to-teal-900",
  "from-slate-900 via-zinc-800 to-gray-900",
  "from-red-900 via-rose-900 to-orange-900",
  "from-emerald-900 via-green-900 to-teal-900",
  "from-amber-900 via-yellow-900 to-orange-900",
]

function formatDate(iso: string | null): string {
  if (!iso) return "Draft"
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

/* ── Blog card ── */
function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="group block bg-surface-2 border border-border hover:border-accent/30 rounded-2xl overflow-hidden transition-all"
    >
      {/* Cover gradient */}
      <div className={`h-40 w-full bg-gradient-to-br ${post.coverGradient} relative`}>
        <div className="absolute inset-0 bg-black/30" />
        {/* Category badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-border text-[9px] font-black uppercase tracking-widest text-muted">
          {post.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        <h2 className="text-sm font-black uppercase italic tracking-tight text-foreground leading-snug group-hover:text-accent-bright transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="text-xs text-muted leading-relaxed line-clamp-2">{post.excerpt}</p>

        {/* Date + read time */}
        <div className="flex items-center gap-3 text-[10px] text-subtle pt-1 border-t border-border">
          <span className="flex items-center gap-1">
            <Clock size={9} /> {post.readTime} min read
          </span>
          <span className="ml-auto">{post.publishedAt}</span>
        </div>

        {/* Engagement stats */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-[10px] text-rose-400/70">
            <Heart size={10} fill="currentColor" /> {post.likes.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-subtle">
            <Eye size={10} /> {post.views.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.article>
  )
}

/* ── Page ── */
export default function UserBlogPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = use(params)
  const { data: blogsData, isLoading } = useBlogs()

  // Filter blogs by this user (published only), fall back to empty array
  const rawBlogs = (blogsData?.data ?? []).filter(
    (b) => b.author.username === username && b.status === "PUBLISHED",
  )

  const posts: BlogPost[] = rawBlogs.map((b, i) => ({
    id: b.id,
    title: b.title,
    excerpt: b.body.replace(/[#*`_>~\[\]]/g, "").slice(0, 160),
    category: "Deep Dive" as BlogCategory,
    coverGradient: COVER_GRADIENTS[i % COVER_GRADIENTS.length],
    publishedAt: formatDate(b.publishedAt),
    readTime: Math.max(1, Math.ceil(b.body.split(/\s+/).length / 200)),
    views: 0,
    likes: 0,
  }))

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-subtle mb-8">
          <Link href={`/u/${username}`} className="hover:text-muted transition-colors">
            @{username}
          </Link>
          <ChevronRight size={11} className="text-subtle" />
          <span className="text-accent-bright">Blog</span>
        </nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10"
        >
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-3">
              Community Long-form
            </p>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic text-foreground leading-none">
              @{username}&apos;s Articles<span style={{color:"var(--app-accent)"}}>.</span>
            </h1>
            <p className="text-subtle text-sm mt-2">
              {isLoading ? "Loading…" : `${posts.length} article${posts.length !== 1 ? "s" : ""} published`}
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface border border-border text-[10px] font-black uppercase tracking-widest text-subtle">
            <User size={12} className="text-accent-bright" />
            {username}
          </div>
        </motion.div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-surface border border-border animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-24 space-y-3">
            <p className="text-subtle text-4xl font-black uppercase italic">No Articles Yet</p>
            <p className="text-subtle text-sm">@{username} hasn&apos;t published any blogs yet.</p>
          </div>
        )}

        {/* 2-col grid */}
        {!isLoading && posts.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-6">
            {posts.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}

        {/* More articles CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 flex flex-col items-center gap-4 text-center"
        >
          <p className="text-subtle text-sm">
            Enjoying {username}&apos;s writing? Visit their full profile.
          </p>
          <Link
            href={`/u/${username}`}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.04] border border-border hover:border-accent/30 hover:bg-surface text-sm font-black uppercase tracking-widest text-muted hover:text-foreground transition-all"
          >
            <PenSquare size={14} className="text-accent-bright" />
            More articles by @{username}
            <ChevronRight size={14} />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
