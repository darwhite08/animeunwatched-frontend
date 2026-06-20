"use client"

import { useState, useMemo } from "react"
import { useBlogs, type BlogSort } from "@/hooks/useBlogs"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen, Heart, Eye, Clock, User, TrendingUp, PenSquare, ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { VerifiedBadge } from "@/components/social/VerifiedBadge"
import { fadeUp, ui } from "@/lib/design/tokens"

/* Strip HTML tags + entities to plain text for excerpts (blog bodies are rich HTML). */
function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/&#?[a-z0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/* First <img> src in a blog body — used as the card cover when no coverImage. */
function firstImage(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return m?.[1] ?? null
}

/* Map the backend BlogCategory enum → the display labels used by the filter pills. */
const CATEGORY_LABEL: Record<string, CategoryLabel> = {
  DEEP_DIVE: "Deep Dive", REVIEW: "Review", FEATURE: "Feature", DISCUSSION: "Discussion",
  THEORY: "Theory", OPINION: "Opinion", LIST: "List", NEWS: "News",
}

/* ── Types ── */
type CategoryLabel = "Deep Dive" | "Review" | "Feature" | "Discussion" | "Theory" | "Opinion" | "List" | "News" | "Article"
type Category = "All" | CategoryLabel

type Blog = {
  id: string
  slug: string
  title: string
  excerpt: string
  author: string
  authorAvatar?: string | null
  authorVerified?: "USER" | "CREATOR" | "STUDIO" | null
  readTime: number
  publishedAt: string
  coverGradient: string
  coverImage?: string | null
  category: CategoryLabel
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

const CATEGORIES: Category[] = ["All", "News", "Deep Dive", "Review", "Feature", "Discussion", "Theory", "Opinion", "List"]

/* ── BlogCard ── */
function BlogCard({ blog, index }: { blog: Blog; index: number }) {
  return (
    <motion.article {...fadeUp(index)}>
      <Link
        href={`/blog/${blog.slug}`}
        className="group block bg-surface-2 border border-border hover:border-white/30 rounded-2xl overflow-hidden transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        {/* Cover — real image when available, gradient fallback otherwise.
            Plain <img>: blog covers come from arbitrary content hosts, so we
            don't route them through next/image's remote-host allowlist. */}
        <div className={`aspect-[16/9] w-full relative overflow-hidden ${blog.coverImage ? "bg-surface-3" : `bg-gradient-to-br ${blog.coverGradient}`}`}>
          {blog.coverImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={blog.coverImage}
              alt={blog.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
          {/* Category badge */}
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/55 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-foreground/90">
            {blog.category}
          </span>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-3">
          <h2 className="text-[15px] sm:text-sm font-black uppercase italic tracking-tight text-foreground leading-snug group-hover:text-foreground transition-colors line-clamp-2">
            {blog.title}
          </h2>
          <p className="text-[13px] sm:text-xs text-muted leading-relaxed line-clamp-2">{blog.excerpt}</p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-[10px] text-subtle pt-1 border-t border-border">
            <span className="flex items-center gap-1.5 min-w-0">
              {blog.authorAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={blog.authorAvatar} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
              ) : (
                <User size={9} />
              )}
              <span className="truncate">{blog.author}</span>
              {blog.authorVerified && <VerifiedBadge kind={blog.authorVerified} size={11} />}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock size={9} /> {blog.readTime} min
            </span>
            <span className="ml-auto shrink-0">{blog.publishedAt}</span>
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
  const [sort, setSort] = useState<BlogSort>("trending")
  const { data: blogsData } = useBlogs(1, sort)

  const apiBlogs: Blog[] = useMemo(() => (blogsData?.data ?? []).map(b => {
    const text = stripHtml(b.body)
    return {
      id: b.id, slug: b.slug, title: b.title,
      excerpt: text.slice(0, 160) + (text.length > 160 ? "…" : ""),
      author: b.author?.displayName ?? b.author?.username ?? "Anonymous",
      authorAvatar: b.author?.avatarUrl ?? null,
      authorVerified: b.author?.verifiedKind ?? null,
      readTime: Math.max(1, Math.ceil(text.split(" ").length / 200)),
      publishedAt: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
      coverGradient: "from-indigo-900 via-violet-900 to-purple-900",
      coverImage: b.coverImage ?? firstImage(b.body),
      category: CATEGORY_LABEL[b.category ?? ""] ?? "Article",
      likes: b.likeCount ?? 0, views: b.viewCount ?? 0,
    }
  }), [blogsData])

  const allBlogs = apiBlogs
  void BLOGS

  // Live sidebar data: top authors (by article count) + popular tags
  // (#hashtag tokens across all blog bodies). Both recompute when blogs
  // refetch — no mock fallback.
  const liveTopAuthors = useMemo(() => {
    const counts = new Map<string, { articles: number; avatarUrl: string | null; initial: string; username: string; verified: "USER" | "CREATOR" | "STUDIO" | null }>()
    for (const b of (blogsData?.data ?? [])) {
      const handle = b.author?.username ?? "anon"
      const display = b.author?.displayName ?? b.author?.username ?? "Anonymous"
      const cur = counts.get(display)
      counts.set(display, {
        articles: (cur?.articles ?? 0) + 1,
        avatarUrl: b.author?.avatarUrl ?? cur?.avatarUrl ?? null,
        initial: display[0]?.toUpperCase() ?? "?",
        username: handle,
        verified: b.author?.verifiedKind ?? cur?.verified ?? null,
      })
    }
    return [...counts.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.articles - a.articles)
      .slice(0, 5)
  }, [blogsData])

  const livePopularTags = useMemo(() => {
    const counts = new Map<string, number>()
    const RE = /(^|\s)#([a-zA-Z0-9_-]+)/g
    for (const b of (blogsData?.data ?? [])) {
      let m: RegExpExecArray | null
      while ((m = RE.exec(b.body)) !== null) {
        const tag = m[2].toLowerCase()
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(e => e[0])
  }, [blogsData])

  void TOP_AUTHORS; void POPULAR_TAGS

  // Masthead featured well: the highest-viewed article (falls back to the first
  // in the current sort — i.e. latest/trending — when view counts are all 0).
  const featured = useMemo<Blog | null>(() => {
    if (allBlogs.length === 0) return null
    const byViews = [...allBlogs].sort((a, b) => b.views - a.views)
    return (byViews[0]?.views ?? 0) > 0 ? byViews[0] : allBlogs[0]
  }, [allBlogs])

  // Newswire ticker — real headlines (category + title) from the latest articles.
  const wireItems = useMemo(
    () => allBlogs.slice(0, 6).map(b => ({ cat: b.category, title: b.title })),
    [allBlogs],
  )
  const wireFallback = [
    { cat: "Deep Dive", title: "The economics of a 12-episode cour" },
    { cat: "Theory", title: "Who really wins the succession arc" },
    { cat: "Review", title: "The season's quietest masterpiece" },
    { cat: "Opinion", title: "In defense of the slow burn" },
  ]
  const wire = wireItems.length > 0 ? wireItems : wireFallback

  const filtered =
    activeCategory === "All"
      ? allBlogs
      : allBlogs.filter(b => b.category === activeCategory)

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">

      {/* Hero — The Chronicle masthead. Scrolls away with the page (NOT sticky)
          so the cards get the full viewport once you scroll. The cover well is
          a live article (highest-viewed / latest). */}
      <div className={`max-w-6xl mx-auto ${ui.screenX} pt-[2px] pb-4`}>
        <div className="chron chron-serif" role="img" aria-label="The Chronicle — long-form anime journalism by the community: deep dives, reviews, theories, and takes.">
          <div className="chron-wrap">

            {/* edition rule */}
            <div className="chron-edition">
              <span className="gold">VOL. I</span>
              <span>NO. {Math.max(allBlogs.length, 1)}</span>
              <span className="faint">EST. MMXXVI</span>
              <span className="spacer" />
              <span className="star">&#10022;</span>
              <span className="spacer" />
              <span className="hidden sm:inline">Community Bureau</span>
              <span className="faint">{featured?.publishedAt || "JUN 2026"}</span>
            </div>

            {/* body: lead + featured cover */}
            <div className="chron-body">
              <div className="chron-lead">
                <span className="chron-overline">
                  Community Long-Form<span className="sep" /><span className="jp">クロニクル</span>
                </span>
                <div className="chron-titlewrap">
                  <h1 className="chron-title">The Chronicle<span className="gold">.</span></h1>
                  <svg className="chron-brush" viewBox="0 0 600 26" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M3 16 C 150 7, 330 6, 470 10 C 522 11.5, 560 15, 597 9 C 565 21, 472 19.5, 300 18.5 C 178 17.8, 78 20, 5 23 Z" />
                  </svg>
                </div>
                <p className="chron-tagline">Deep dives, reviews, theories &amp; takes — by the community.</p>
              </div>

              {/* featured cover well — the live highest-viewed / latest article */}
              {featured ? (
                <Link href={`/blog/${featured.slug}`} className="chron-cover" aria-label={`Featured: ${featured.title}`}>
                  <div className="chron-cover-bg" aria-hidden="true"><div className="lines" /></div>
                  {featured.coverImage && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={featured.coverImage} alt="" loading="lazy" />
                  )}
                  <div className="chron-cover-frame">
                    <span className="chron-tab">&#9733; Featured</span>
                    <div className="chron-kanji">特集</div>
                    <div className="chron-cap">
                      <div className="chron-eyebrow">{featured.category}</div>
                      <div className="chron-headline">{featured.title}</div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="chron-cover" aria-hidden="true">
                  <div className="chron-cover-bg"><div className="lines" /></div>
                  <div className="chron-cover-frame">
                    <span className="chron-tab">&#9733; Featured</span>
                    <div className="chron-kanji">特集</div>
                    <div className="chron-cap">
                      <div className="chron-eyebrow">Coming soon</div>
                      <div className="chron-headline">The first issue is being written.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* newswire ticker — real headlines */}
            <div className="chron-wire" aria-hidden="true">
              <span className="chron-wire-tag"><span className="pulse" />On the Wire</span>
              <div className="chron-wire-feed">
                <div className="chron-wire-track">
                  {[0, 1].map(dup => (
                    <span key={dup}>
                      {wire.map((w, i) => (
                        <span key={`${dup}-${i}`}>
                          <span className="cat">{w.cat.toUpperCase()}</span>&nbsp;&nbsp;{w.title}
                          <span className="dot">&bull;</span>
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Filter bar — sticky with a CONSTANT height (so it never resizes on
          scroll → no jitter). Pins right below the global navbar once the hero
          scrolls past it. */}
      <div className="sticky top-[var(--sticky-top,0px)] z-40 bg-background/95 backdrop-blur border-y border-border shadow-[0_4px_12px_color-mix(in_srgb,var(--app-fg)_4%,transparent)]">
        <div className={`max-w-6xl mx-auto ${ui.screenX} py-2 flex items-center gap-3`}>
          <span className="hidden md:block text-base font-black tracking-tighter uppercase italic text-foreground leading-none shrink-0 mr-1">
            The Chronicle<span style={{color:"var(--app-accent)"}}>.</span>
          </span>
          {/* Sort: Hot (trending) / Top (best-of) / New (latest) — drives the ranker. */}
          <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-border bg-surface p-0.5">
            {([["trending", "Hot"], ["top", "Top"], ["latest", "New"]] as const).map(([s, label]) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                aria-pressed={sort === s}
                title={s === "trending" ? "Trending" : s === "top" ? "Top (all-time)" : "Latest"}
                className={`min-h-9 rounded-full px-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                  sort === s ? "bg-accent text-black" : "text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={`min-h-11 inline-flex items-center px-4 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                  activeCategory === cat
                    ? "bg-accent text-black shadow-[0_0_16px_color-mix(in_srgb,var(--app-accent)_35%,transparent)]"
                    : "bg-surface border border-border text-muted hover:text-foreground hover:bg-surface-2"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main grid — left feed + sticky right rail, independent scroll */}
      <div className={`max-w-6xl mx-auto ${ui.screenX} pt-6 grid lg:grid-cols-3 gap-8`}>

        {/* Blog grid (2/3) */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 gap-4 sm:gap-6"
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

        {/* Sidebar — sticky + independently scrollable via data-lenis-prevent */}
        <aside
          data-lenis-prevent
          className="lg:sticky lg:top-[180px] lg:self-start lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:overscroll-contain space-y-6 lg:pr-2"
        >

          {/* Top Authors — derived from real blog data */}
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-accent-bright" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Top Authors</h3>
            </div>
            {liveTopAuthors.length > 0 ? (
              <div className="space-y-3">
                {liveTopAuthors.map((author, i) => (
                  <Link key={author.name} href={`/u/${author.username}`}
                    className="flex items-center gap-3 group rounded-lg hover:bg-surface-2 -mx-1 px-1 py-1 transition-colors">
                    <span className="text-[10px] font-black text-muted w-4 shrink-0 tabular-nums">{i + 1}</span>
                    {author.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={author.avatarUrl} alt="" className="h-8 w-8 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-black shrink-0 text-foreground">
                        {author.initial}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate group-hover:text-foreground transition-colors flex items-center gap-1">
                        <span className="truncate">{author.name}</span>
                        {author.verified && <VerifiedBadge kind={author.verified} size={12} />}
                      </p>
                      <p className="text-[10px] text-muted tabular-nums">{author.articles} article{author.articles === 1 ? "" : "s"}</p>
                    </div>
                    <ChevronRight size={12} className="text-muted shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted">No published articles yet.</p>
            )}
          </div>

          {/* Popular Tags — derived from real blog body content */}
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-violet-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Popular Tags</h3>
            </div>
            {livePopularTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {livePopularTags.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="inline-flex min-h-11 items-center px-3.5 rounded-full bg-surface-2 border border-border text-[11px] font-bold text-muted hover:text-foreground hover:border-white/30 cursor-pointer transition-colors active:scale-95"
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
            ) : (
              <p className="text-[11px] text-muted">Tag posts with #hashtags to see them surface here.</p>
            )}
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
              <p className="text-sm font-bold text-foreground group-hover:text-foreground transition-colors">
                Write for The Chronicle
              </p>
              <p className="text-[10px] text-subtle mt-0.5">Share your takes with the community</p>
            </div>
            <ChevronRight size={14} className="text-accent-bright/40 group-hover:text-foreground ml-auto transition-all group-hover:translate-x-0.5" />
          </Link>
        </aside>
      </div>
    </div>
  )
}
