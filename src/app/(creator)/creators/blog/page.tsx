"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useBlogs } from "@/hooks/useBlogs"
import { FileText, Plus, Search, Eye, Heart, BarChart2, Clock, Edit2, Trash2, MoreHorizontal } from "lucide-react"

type BlogStatus = "published" | "draft" | "under_review"

type Blog = {
  id: string
  slug?: string
  title: string
  excerpt: string
  status: BlogStatus
  views: number
  likes: number
  readTime: number
  publishedAt: string
  coverGradient: string
}

const MOCK_BLOGS: Blog[] = [
  {
    id: "1",
    title: "Why Attack on Titan Changed Anime Forever",
    excerpt: "A deep dive into the storytelling, symbolism, and cultural impact of one of the greatest anime in history.",
    status: "published",
    views: 12400,
    likes: 843,
    readTime: 8,
    publishedAt: "3 days ago",
    coverGradient: "from-red-900/60 to-orange-800/30",
  },
  {
    id: "2",
    title: "Gojo Satoru's Infinity: A Physics Breakdown",
    excerpt: "We model Gojo's Six Eyes and Infinity using real physics concepts. Spoiler: it actually makes sense.",
    status: "published",
    views: 8900,
    likes: 620,
    readTime: 6,
    publishedAt: "1 week ago",
    coverGradient: "from-blue-900/60 to-indigo-800/30",
  },
  {
    id: "3",
    title: "The Best Anime Antagonists of 2024",
    excerpt: "Ranking the most complex and memorable villains this year had to offer — with context you might have missed.",
    status: "under_review",
    views: 0,
    likes: 0,
    readTime: 5,
    publishedAt: "Pending review",
    coverGradient: "from-purple-900/60 to-pink-800/30",
  },
  {
    id: "4",
    title: "Chainsaw Man: Understanding the Contracts",
    excerpt: "The devil contract system explained — what rules govern Denji's powers and why they matter for the plot.",
    status: "draft",
    views: 0,
    likes: 0,
    readTime: 4,
    publishedAt: "Not published",
    coverGradient: "from-yellow-900/60 to-amber-800/30",
  },
]

const STATUS_CONFIG: Record<BlogStatus, { label: string; cls: string }> = {
  published:    { label: "Published",    cls: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" },
  draft:        { label: "Draft",        cls: "bg-zinc-600/20 text-zinc-400 border-zinc-500/30" },
  under_review: { label: "Under Review", cls: "bg-amber-600/20 text-amber-400 border-amber-500/30" },
}

type Filter = "all" | BlogStatus

export default function BlogListPage() {
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const { data: blogsData } = useBlogs()

  const apiBlogs: Blog[] = (blogsData?.data ?? []).map(b => ({
    id: b.id, slug: b.slug, title: b.title,
    excerpt: b.body.slice(0, 100) + "…",
    coverGradient: "from-indigo-900 to-violet-900",
    status: b.status === "PUBLISHED" ? "published" as const : "draft" as const,
    views: 0, likes: 0,
    readTime: Math.max(1, Math.ceil(b.body.split(" ").length / 200)),
    publishedAt: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : "",
  }))

  const allBlogs = apiBlogs.length > 0 ? apiBlogs : MOCK_BLOGS

  const visible = useMemo(() => {
    return allBlogs.filter(b => {
      const matchesFilter = filter === "all" || b.status === filter
      const matchesQuery = b.title.toLowerCase().includes(query.toLowerCase())
      return matchesFilter && matchesQuery
    })
  }, [allBlogs, filter, query])

  const totalViews = allBlogs.reduce((s, b) => s + b.views, 0)
  const totalLikes = allBlogs.reduce((s, b) => s + b.likes, 0)
  const published = allBlogs.filter(b => b.status === "published").length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <FileText size={18} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Blog Articles</h1>
            <p className="text-sm text-white/40">{allBlogs.length} articles</p>
          </div>
        </div>

        <Link
          href="/creators/create/blog"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 transition text-sm font-medium"
        >
          <Plus size={15} />
          New Article
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Eye} label="Total Views" value={totalViews.toLocaleString()} color="text-amber-400" />
        <StatCard icon={Heart} label="Total Likes" value={totalLikes.toLocaleString()} color="text-rose-400" />
        <StatCard icon={BarChart2} label="Published" value={String(published)} color="text-emerald-400" />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-800 rounded-xl text-sm outline-none placeholder:text-white/30 focus:ring-1 focus:ring-purple-500/50"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "published", "under_review", "draft"] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm capitalize transition ${
                filter === f ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              {f === "under_review" ? "Review" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Blog grid */}
      <motion.div layout className="grid md:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {visible.map((blog, i) => (
            <BlogCard key={blog.id} blog={blog} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <div className="text-center py-16 text-white/30">
          <FileText size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No articles match your filter</p>
        </div>
      )}
    </div>
  )
}

function BlogCard({ blog, index }: { blog: Blog; index: number }) {
  const { label, cls } = STATUS_CONFIG[blog.status]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.04 }}
      className="bg-zinc-900 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition group"
    >
      {/* Cover */}
      <div className={`h-32 bg-gradient-to-br ${blog.coverGradient} relative`}>
        <div className="absolute inset-0 bg-black/20" />
        {/* Action buttons on hover */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
          <Link
            href={`/creators/create/blog?id=${blog.id}`}
            className="p-2 rounded-lg bg-black/60 backdrop-blur-sm text-white/70 hover:text-white transition"
            onClick={e => e.stopPropagation()}
          >
            <Edit2 size={13} />
          </Link>
          <button className="p-2 rounded-lg bg-black/60 backdrop-blur-sm text-white/70 hover:text-red-400 transition">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-xs border px-3 py-1 rounded-full ${cls}`}>{label}</span>
          <span className="text-xs text-white/30 flex items-center gap-1">
            <Clock size={11} /> {blog.readTime} min
          </span>
        </div>

        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-amber-300 transition">
          {blog.title}
        </h3>

        <p className="text-xs text-white/40 line-clamp-2">{blog.excerpt}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-white/30">
          <div className="flex items-center gap-3">
            {blog.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye size={11} /> {(blog.views / 1000).toFixed(1)}k
              </span>
            )}
            {blog.likes > 0 && (
              <span className="flex items-center gap-1">
                <Heart size={11} /> {blog.likes}
              </span>
            )}
          </div>
          <span>{blog.publishedAt}</span>
        </div>
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
