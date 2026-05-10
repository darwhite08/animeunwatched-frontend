"use client"

import { use } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronRight, Clock, Eye, Heart, PenSquare, User } from "lucide-react"

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

/* ── Mock post generator ── */
const POST_TEMPLATES: {
  title: string
  excerpt: string
  category: BlogCategory
  coverGradient: string
}[] = [
  {
    title: "Why Frieren is the Most Honest Fantasy in Years",
    excerpt:
      "Most isekai asks you to imagine power. Frieren asks you to feel loss. It's the rare fantasy that earns every emotional beat through restraint, not spectacle.",
    category: "Deep Dive",
    coverGradient: "from-indigo-900 via-violet-900 to-purple-900",
  },
  {
    title: "The Physics Behind Jujutsu Kaisen's Cursed Energy",
    excerpt:
      "What if cursed energy followed thermodynamic laws? We break down domain expansion, reversal techniques, and Gojo's infinity through the lens of real physics.",
    category: "Theory",
    coverGradient: "from-blue-900 via-cyan-900 to-teal-900",
  },
  {
    title: "Monster: A Perfect Slow Burn That Demands Your Patience",
    excerpt:
      "74 episodes. No filler. No power-ups. Just a surgeon, a sociopath, and one of the most meticulously constructed narratives in anime history.",
    category: "Review",
    coverGradient: "from-slate-900 via-zinc-800 to-gray-900",
  },
  {
    title: "Chainsaw Man is the Anti-Shonen and That's the Point",
    excerpt:
      "Every shonen convention gets inverted, subverted, and deconstructed in Fujimoto's opus. Power fantasy, nakama, and heroism are all put on trial.",
    category: "Opinion",
    coverGradient: "from-red-900 via-rose-900 to-orange-900",
  },
]

const PUBLISHED_DATES = [
  "May 3, 2026",
  "Apr 20, 2026",
  "Apr 10, 2026",
  "Apr 5, 2026",
]
const READ_TIMES = [8, 10, 11, 9]
const VIEW_COUNTS = [14300, 21500, 33700, 17200]
const LIKE_COUNTS = [842, 976, 1560, 731]

function buildBlogPosts(username: string): BlogPost[] {
  const seed = username.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return POST_TEMPLATES.map((t, i) => ({
    id: String(i + 1),
    title: t.title,
    excerpt: t.excerpt,
    category: t.category,
    coverGradient: t.coverGradient,
    publishedAt: PUBLISHED_DATES[i],
    readTime: READ_TIMES[(i + seed) % READ_TIMES.length],
    views: ((VIEW_COUNTS[i] + seed * 10) % 30000) + 5000,
    likes: ((LIKE_COUNTS[i] + seed) % 1500) + 200,
  }))
}

/* ── Blog card ── */
function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="group block bg-zinc-900/60 border border-white/8 hover:border-indigo-500/30 rounded-2xl overflow-hidden transition-all"
    >
      {/* Cover gradient */}
      <div className={`h-40 w-full bg-gradient-to-br ${post.coverGradient} relative`}>
        <div className="absolute inset-0 bg-black/30" />
        {/* Category badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/70">
          {post.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        <h2 className="text-sm font-black uppercase italic tracking-tight text-white leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="text-xs text-white/45 leading-relaxed line-clamp-2">{post.excerpt}</p>

        {/* Date + read time */}
        <div className="flex items-center gap-3 text-[10px] text-white/30 pt-1 border-t border-white/5">
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
          <span className="flex items-center gap-1 text-[10px] text-white/30">
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
  const posts = buildBlogPosts(username)

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/25 mb-8">
          <Link href={`/u/${username}`} className="hover:text-white/60 transition-colors">
            @{username}
          </Link>
          <ChevronRight size={11} className="text-white/15" />
          <span className="text-indigo-400">Blog</span>
        </nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10"
        >
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60 mb-3">
              Community Long-form
            </p>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white leading-none">
              @{username}&apos;s Articles<span className="text-indigo-500">.</span>
            </h1>
            <p className="text-white/35 text-sm mt-2">{posts.length} articles published</p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.02] border border-white/8 text-[10px] font-black uppercase tracking-widest text-white/30">
            <User size={12} className="text-indigo-400" />
            {username}
          </div>
        </motion.div>

        {/* 2-col grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {posts.map((post, i) => (
            <BlogCard key={post.id} post={post} index={i} />
          ))}
        </div>

        {/* More articles CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 flex flex-col items-center gap-4 text-center"
        >
          <p className="text-white/30 text-sm">
            Enjoying {username}&apos;s writing? Visit their full profile.
          </p>
          <Link
            href={`/u/${username}`}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/30 hover:bg-white/[0.07] text-sm font-black uppercase tracking-widest text-white/60 hover:text-white transition-all"
          >
            <PenSquare size={14} className="text-indigo-400" />
            More articles by @{username}
            <ChevronRight size={14} />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
