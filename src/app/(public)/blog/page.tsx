"use client"

import { useState, useMemo } from "react"
import { useBlogs } from "@/hooks/useBlogs"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen, Heart, Eye, Clock, User, TrendingUp, PenSquare, ChevronRight,
} from "lucide-react"
import Link from "next/link"

/* ── Types ── */
type Category = "All" | "Deep Dive" | "Review" | "Theory" | "Opinion" | "List"

type Blog = {
  id: string
  slug: string
  title: string
  excerpt: string
  author: string
  readTime: number
  publishedAt: string
  coverGradient: string
  category: "Deep Dive" | "Review" | "Theory" | "Opinion" | "List"
  likes: number
  views: number
}

/* ── Mock data ── */
const BLOGS: Blog[] = [
  {
    id: "1",
    slug: "why-frieren-is-most-honest-fantasy",
    title: "Why Frieren is the Most Honest Fantasy in Years",
    excerpt:
      "Most isekai asks you to imagine power. Frieren asks you to feel loss. It's the rare fantasy that earns every emotional beat through restraint, not spectacle.",
    author: "Otaku_Arch",
    readTime: 8,
    publishedAt: "May 3, 2026",
    coverGradient: "from-indigo-900 via-violet-900 to-purple-900",
    category: "Deep Dive",
    likes: 842,
    views: 14300,
  },
  {
    id: "2",
    slug: "ranking-every-mappa-production",
    title: "Ranking Every MAPPA Production by Animation Quality",
    excerpt:
      "From Yuri on Ice to Chainsaw Man, MAPPA has become one of the most divisive studios in the industry. Here's every major production, ranked honestly.",
    author: "AnimationNerd",
    readTime: 12,
    publishedAt: "Apr 28, 2026",
    coverGradient: "from-rose-900 via-pink-900 to-fuchsia-900",
    category: "List",
    likes: 1203,
    views: 29800,
  },
  {
    id: "3",
    slug: "physics-behind-jujutsu-kaisen-cursed-energy",
    title: "The Physics Behind Jujutsu Kaisen's Cursed Energy",
    excerpt:
      "What if cursed energy actually followed thermodynamic laws? We break down domain expansion, reversal techniques, and Gojo's infinity through the lens of real physics.",
    author: "NeuralBot_X",
    readTime: 10,
    publishedAt: "Apr 20, 2026",
    coverGradient: "from-blue-900 via-cyan-900 to-teal-900",
    category: "Theory",
    likes: 976,
    views: 21500,
  },
  {
    id: "4",
    slug: "20-underrated-anime-everyone-should-watch",
    title: "20 Underrated Anime Everyone Should Watch",
    excerpt:
      "Beyond Naruto and Attack on Titan lives a vast catalog of hidden masterpieces. These are the 20 shows that deserve a fraction of the mainstream attention they never received.",
    author: "VoidSeeker",
    readTime: 15,
    publishedAt: "Apr 15, 2026",
    coverGradient: "from-amber-900 via-orange-900 to-red-900",
    category: "List",
    likes: 2104,
    views: 48200,
  },
  {
    id: "5",
    slug: "monster-perfect-slow-burn",
    title: "Monster: A Perfect Slow Burn That Demands Your Patience",
    excerpt:
      "74 episodes. No filler. No power-ups. Just a surgeon, a sociopath, and one of the most meticulously constructed narratives in anime history.",
    author: "Cipher_Ronin",
    readTime: 11,
    publishedAt: "Apr 10, 2026",
    coverGradient: "from-slate-900 via-zinc-800 to-gray-900",
    category: "Review",
    likes: 1560,
    views: 33700,
  },
  {
    id: "6",
    slug: "chainsaw-man-is-anti-shonen",
    title: "Chainsaw Man Is the Anti-Shonen and That's the Point",
    excerpt:
      "Every shonen convention gets inverted, subverted, and deconstructed in Fujimoto's opus. Power fantasy, nakama, and heroism are all put on trial.",
    author: "ShadowWatcher",
    readTime: 9,
    publishedAt: "Apr 5, 2026",
    coverGradient: "from-red-900 via-rose-900 to-orange-900",
    category: "Opinion",
    likes: 731,
    views: 17200,
  },
  {
    id: "7",
    slug: "berserk-manga-ending-analysis",
    title: "What Berserk's Ending Tells Us About Grief and Authorship",
    excerpt:
      "Kentaro Miura passed before completing his masterwork. What the studio chose to do next, and why fans are divided, speaks volumes about what art means to its audience.",
    author: "GriffinSeer",
    readTime: 14,
    publishedAt: "Mar 28, 2026",
    coverGradient: "from-stone-900 via-neutral-900 to-zinc-900",
    category: "Deep Dive",
    likes: 1890,
    views: 40100,
  },
  {
    id: "8",
    slug: "why-studio-ghibli-remains-undefeated",
    title: "Why Studio Ghibli Remains Undefeated in 2026",
    excerpt:
      "In an era of streaming churn and sequel culture, Ghibli still releases films that feel like events. We examine the creative philosophy that refuses to compromise.",
    author: "SakuraFrame",
    readTime: 7,
    publishedAt: "Mar 20, 2026",
    coverGradient: "from-emerald-900 via-green-900 to-teal-900",
    category: "Opinion",
    likes: 1244,
    views: 25900,
  },
]

const TOP_AUTHORS = [
  { name: "Otaku_Arch",    articles: 14, avatar: "O" },
  { name: "NeuralBot_X",  articles: 11, avatar: "N" },
  { name: "ShadowWatcher", articles: 9,  avatar: "S" },
]

const POPULAR_TAGS = [
  "frieren", "mappa", "jjk", "monster", "ghibli", "theory",
  "animation", "villain", "underrated", "slow-burn", "shonen", "manga",
]

const CATEGORIES: Category[] = ["All", "Deep Dive", "Review", "Theory", "Opinion", "List"]

/* ── BlogCard ── */
function BlogCard({ blog, index }: { blog: Blog; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link
        href={`/blog/${blog.slug}`}
        className="group block bg-surface-2 border border-border hover:border-accent/30 rounded-2xl overflow-hidden transition-all"
      >
        {/* Cover gradient */}
        <div className={`h-40 w-full bg-gradient-to-br ${blog.coverGradient} relative`}>
          <div className="absolute inset-0 bg-black/30" />
          {/* Category badge */}
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-border text-[9px] font-black uppercase tracking-widest text-muted">
            {blog.category}
          </span>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <h2 className="text-sm font-black uppercase italic tracking-tight text-foreground leading-snug group-hover:text-accent-bright transition-colors line-clamp-2">
            {blog.title}
          </h2>
          <p className="text-xs text-muted leading-relaxed line-clamp-2">{blog.excerpt}</p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-[10px] text-subtle pt-1 border-t border-border">
            <span className="flex items-center gap-1">
              <User size={9} /> {blog.author}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={9} /> {blog.readTime} min
            </span>
            <span className="ml-auto">{blog.publishedAt}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[10px] text-rose-400/70">
              <Heart size={10} fill="currentColor" /> {blog.likes.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-subtle">
              <Eye size={10} /> {blog.views.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

/* ── Page ── */
export default function BlogListingPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All")
  const { data: blogsData } = useBlogs()

  const apiBlogs: Blog[] = useMemo(() => (blogsData?.data ?? []).map(b => ({
    id: b.id, slug: b.slug, title: b.title,
    excerpt: b.body.slice(0, 160) + "…",
    author: b.author?.displayName ?? b.author?.username ?? "Anonymous",
    readTime: Math.max(1, Math.ceil(b.body.split(" ").length / 200)),
    publishedAt: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
    coverGradient: "from-indigo-900 via-violet-900 to-purple-900",
    category: "Deep Dive" as const, likes: 0, views: 0,
  })), [blogsData])

  const allBlogs = apiBlogs
  void BLOGS

  const filtered =
    activeCategory === "All"
      ? allBlogs
      : allBlogs.filter(b => b.category === activeCategory)

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">

      {/* Cinematic header */}
      <div className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-violet-950/20 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-black uppercase tracking-widest text-accent-bright">
              Community Long-form
            </span>
            <h1 className="mt-4 text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-foreground leading-none">
              The Chronicle<span style={{color:"var(--app-accent)"}}>.</span>
            </h1>
            <p className="mt-3 text-subtle text-base max-w-lg">
              Long-form anime journalism by the community — deep dives, reviews, theories, and takes.
            </p>
          </motion.div>

          {/* Category filter tabs */}
          <div className="mt-10 flex items-center gap-1 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat
                    ? "bg-accent text-black shadow-[0_0_20px_color-mix(in srgb, var(--app-accent) 40%, transparent)]"
                    : "bg-surface border border-border text-muted hover:text-foreground hover:bg-surface"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-6xl mx-auto px-6 pt-10 grid lg:grid-cols-3 gap-10">

        {/* Blog grid (2/3) */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 gap-6"
            >
              {filtered.map((blog, i) => (
                <BlogCard key={blog.id} blog={blog} index={i} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-2 text-center py-20 text-subtle text-sm font-bold">
                  No articles in this category yet.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">

          {/* Top Authors */}
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-accent-bright" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Top Authors</h3>
            </div>
            <div className="space-y-3">
              {TOP_AUTHORS.map((author, i) => (
                <div key={author.name} className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-subtle w-4 shrink-0">{i + 1}</span>
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-black shrink-0">
                    {author.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-muted truncate">{author.name}</p>
                    <p className="text-[9px] text-subtle">{author.articles} articles</p>
                  </div>
                  <ChevronRight size={12} className="text-subtle shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-violet-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Popular Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="px-3 py-1.5 rounded-full bg-surface border border-border text-[10px] font-bold text-muted hover:text-accent-bright hover:border-accent/25 cursor-pointer transition-all"
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Write CTA */}
          <Link
            href="/creators/create/blog"
            className="flex items-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-accent/20 hover:from-indigo-600/20 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
              <PenSquare size={16} className="text-accent-bright" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground group-hover:text-accent-bright transition-colors">
                Write for The Chronicle
              </p>
              <p className="text-[10px] text-subtle mt-0.5">Share your takes with the community</p>
            </div>
            <ChevronRight size={14} className="text-accent-bright/40 group-hover:text-accent-bright ml-auto transition-all group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
