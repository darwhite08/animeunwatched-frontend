"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Share2, Bookmark, ChevronLeft, Clock, User, Eye,
  MessageSquare, Send, Loader2,
} from "lucide-react"
import { HeartLike } from "@/components/ui/HeartLike"
import Link from "next/link"
import { useToast } from "@/stores/toast.store"
import { useBlog, type Blog } from "@/hooks/useBlogs"
import { useBlogViews, useBlogLikes } from "@/hooks/useRealtime"
import { VerifiedBadge } from "@/components/social/VerifiedBadge"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { useAuthStore } from "@/stores/auth.store"
import { TranslateBar } from "@/components/blog/TranslateBar"
import { ReaderFunnel } from "@/components/blog/ReaderFunnel"
import { ReaderSidebar } from "@/components/blog/ReaderSidebar"
import { ArticleTOC } from "@/components/blog/ArticleTOC"
import { StickyJoinBar } from "@/components/blog/StickyJoinBar"

/* ── Types ── */
type BlogMeta = {
  slug: string
  title: string
  author: string
  authorAvatar: string
  publishedAt: string
  readTime: number
  coverGradient: string
  category: string
  likes: number
  views: number
  excerpt: string
}

type Comment = {
  id: number
  author: string
  avatar: string
  time: string
  body: string
  likes: number
}

type RelatedPost = {
  slug: string
  title: string
  category: string
  readTime: number
  coverGradient: string
}

/* ── Mock DB ── */
const BLOG_META: Record<string, BlogMeta> = {
  "why-frieren-is-most-honest-fantasy": {
    slug: "why-frieren-is-most-honest-fantasy",
    title: "Why Frieren is the Most Honest Fantasy in Years",
    author: "Otaku_Arch",
    authorAvatar: "O",
    publishedAt: "May 3, 2026",
    readTime: 8,
    coverGradient: "from-indigo-900 via-violet-900 to-purple-900",
    category: "Deep Dive",
    likes: 842,
    views: 14300,
    excerpt:
      "Most isekai asks you to imagine power. Frieren asks you to feel loss. It's the rare fantasy that earns every emotional beat through restraint, not spectacle.",
  },
  "ranking-every-mappa-production": {
    slug: "ranking-every-mappa-production",
    title: "Ranking Every MAPPA Production by Animation Quality",
    author: "AnimationNerd",
    authorAvatar: "A",
    publishedAt: "Apr 28, 2026",
    readTime: 12,
    coverGradient: "from-rose-900 via-pink-900 to-fuchsia-900",
    category: "List",
    likes: 1203,
    views: 29800,
    excerpt:
      "From Yuri on Ice to Chainsaw Man, MAPPA has become one of the most divisive studios in the industry.",
  },
  "physics-behind-jujutsu-kaisen-cursed-energy": {
    slug: "physics-behind-jujutsu-kaisen-cursed-energy",
    title: "The Physics Behind Jujutsu Kaisen's Cursed Energy",
    author: "NeuralBot_X",
    authorAvatar: "N",
    publishedAt: "Apr 20, 2026",
    readTime: 10,
    coverGradient: "from-blue-900 via-cyan-900 to-teal-900",
    category: "Theory",
    likes: 976,
    views: 21500,
    excerpt:
      "What if cursed energy actually followed thermodynamic laws?",
  },
  "20-underrated-anime-everyone-should-watch": {
    slug: "20-underrated-anime-everyone-should-watch",
    title: "20 Underrated Anime Everyone Should Watch",
    author: "VoidSeeker",
    authorAvatar: "V",
    publishedAt: "Apr 15, 2026",
    readTime: 15,
    coverGradient: "from-amber-900 via-orange-900 to-red-900",
    category: "List",
    likes: 2104,
    views: 48200,
    excerpt:
      "Beyond Naruto and Attack on Titan lives a vast catalog of hidden masterpieces.",
  },
  "monster-perfect-slow-burn": {
    slug: "monster-perfect-slow-burn",
    title: "Monster: A Perfect Slow Burn That Demands Your Patience",
    author: "Cipher_Ronin",
    authorAvatar: "C",
    publishedAt: "Apr 10, 2026",
    readTime: 11,
    coverGradient: "from-slate-900 via-zinc-800 to-gray-900",
    category: "Review",
    likes: 1560,
    views: 33700,
    excerpt:
      "74 episodes. No filler. No power-ups. Just a surgeon, a sociopath, and one of the most meticulously constructed narratives in anime history.",
  },
}

const FALLBACK_META: BlogMeta = {
  slug: "unknown",
  title: "Article",
  author: "Unknown",
  authorAvatar: "?",
  publishedAt: "2026",
  readTime: 5,
  coverGradient: "from-zinc-900 to-slate-900",
  category: "Opinion",
  likes: 0,
  views: 0,
  excerpt: "",
}


const RELATED_POSTS: RelatedPost[] = [
  {
    slug: "monster-perfect-slow-burn",
    title: "Monster: A Perfect Slow Burn That Demands Your Patience",
    category: "Review",
    readTime: 11,
    coverGradient: "from-slate-900 via-zinc-800 to-gray-900",
  },
  {
    slug: "20-underrated-anime-everyone-should-watch",
    title: "20 Underrated Anime Everyone Should Watch",
    category: "List",
    readTime: 15,
    coverGradient: "from-amber-900 via-orange-900 to-red-900",
  },
]

/* ── Article body ── */
function ArticleBody({ apiContent }: { apiContent?: string }) {
  if (apiContent) {
    // New blogs are HTML; legacy blogs are plain text. The TranslateBar adds a
    // language switcher (auto-translate) and renders the (translated) content.
    return <TranslateBar content={apiContent} />
  }
  return (
    <div className="space-y-6 text-muted text-base leading-relaxed">
      <p>
        Anime has always been comfortable with death. From the early days of Osamu Tezuka to the
        present era of industry-defining franchises, loss is a genre staple. Yet very few series
        understand that grief is not a single event — it is an accumulation. <em>Frieren: Beyond
        Journey&apos;s End</em> is, at its core, a meditation on what it means to outlive the people
        you love, and how meaning is constructed in their absence.
      </p>

      <h2 className="text-xl font-black uppercase italic tracking-tight text-foreground pt-4">
        The Fantasy That Starts After the Hero&apos;s Journey Ends
      </h2>

      <p>
        Most fantasy narratives open with a call to adventure. Frieren&apos;s first episode takes
        place immediately after the conclusion of one — the defeat of the Demon King. The fellowship
        celebrates, disperses, and then we jump forward in time. Fifty years pass. The human heroes
        have aged, married, built families, and eventually died. Frieren, an elf mage, has barely
        changed.
      </p>

      <p>
        This structural choice is radical in its simplicity. By showing us what came <em>after</em>,
        the series inverts the standard power fantasy. Victory is not the destination. It is the
        starting line of a longer, quieter journey toward understanding what those years meant.
      </p>

      <blockquote className="border-l-4 border-accent pl-5 py-1 italic text-muted text-sm">
        &ldquo;I didn&apos;t know much about Himmel. I want to understand, even if it takes me a
        hundred years.&rdquo; — Frieren
      </blockquote>

      <h2 className="text-xl font-black uppercase italic tracking-tight text-foreground pt-4">
        Restraint as a Narrative Superpower
      </h2>

      <p>
        The series never explains its emotional mechanics with dialogue. A character&apos;s grief is not
        delivered through monologue — it is shown through the way they pause, what they cannot look
        at, what they reflexively reach for. This is graduate-level screenwriting, and it&apos;s
        happening in a weekly TV anime.
      </p>

      <p>
        The magic system, too, reflects this philosophy. In a genre obsessed with power scaling and
        technique reveals, Frieren&apos;s magic is about subtlety: concealing your mana signature,
        understanding what spells meant to the person who invented them, collecting minor spells
        that serve no combat purpose because they were beautiful. The plot&apos;s stakes never derive
        purely from strength — they derive from meaning.
      </p>

      <h2 className="text-xl font-black uppercase italic tracking-tight text-foreground pt-4">
        Sollen vs. Sein: The Ethical Weight of Living Long
      </h2>

      <p>
        Frieren&apos;s longevity creates a peculiar moral dimension. She watched human civilization
        rise and fall across centuries. She knew people who are now legends — and she barely paid
        attention. The series is honest about this: Frieren was not cruel, she was simply not
        present in the way humans needed her to be.
      </p>

      <p>
        Her journey is not a hero&apos;s quest for power — it is a form of penance and
        reconstruction. She walks the same roads, speaks to descendants of people she once knew, and
        slowly learns the art of being present. This transforms what could have been a nostalgic
        fantasy into something closer to philosophy.
      </p>

      <h2 className="text-xl font-black uppercase italic tracking-tight text-foreground pt-4">
        Why It Works Where Others Have Failed
      </h2>

      <p>
        The critical difference between Frieren and other introspective anime is precision. Every
        flashback is calibrated to land at a specific emotional frequency. The pacing never feels
        indulgent because each quiet moment is doing invisible work — shifting our understanding of
        a character, establishing a moral question, or planting a detail that will devastate us three
        episodes later.
      </p>

      <p>
        This is, ultimately, what honest fantasy looks like. It does not ask us to imagine
        ourselves as powerful. It asks us to sit with the reality that time passes, people leave,
        and what we choose to remember defines who we become.
      </p>

      <p>
        Frieren earns every tear. That is more than most can say.
      </p>
    </div>
  )
}

/* ── Blog Comments (real API) ── */
function BlogComments({ slug }: { slug: string }) {
  const { push } = useToast()
  const isAuth = useAuthStore(s => s.isAuthenticated)
  const qc = useQueryClient()
  const [draft, setDraft] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["blog-comments", slug],
    queryFn:  () => api<{ data: Array<{ id: string; content: string; createdAt: string; author: { username: string; displayName: string; avatarUrl: string | null; verifiedKind?: "USER" | "CREATOR" | "STUDIO" | null } }> }>(`/blogs/${slug}/comments`),
    staleTime: 60_000,
  })

  const createMut = useMutation({
    mutationFn: (content: string) => api(`/blogs/${slug}/comments`, { method: "POST", body: JSON.stringify({ content }) }),
    onSuccess: () => { setDraft(""); qc.invalidateQueries({ queryKey: ["blog-comments", slug] }); push("Comment posted!", "success") },
    onError: () => push("Failed to post comment", "error"),
  })

  const comments = data?.data ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">
          Comments ({isLoading ? "…" : comments.length})
        </h3>
        <MessageSquare size={13} className="text-subtle" />
      </div>

      {/* Comment composer */}
      {isAuth && (
        <div className="flex gap-3">
          <textarea value={draft} onChange={e => setDraft(e.target.value)}
            placeholder="Share your thoughts…" rows={2} maxLength={1000}
            className="flex-1 px-4 py-3 rounded-xl bg-surface border border-border text-base sm:text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-accent/30 resize-none transition-all" />
          <button onClick={() => draft.trim() && createMut.mutate(draft.trim())}
            disabled={!draft.trim() || createMut.isPending}
            className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl text-black transition-all disabled:opacity-40 hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))" }}>
            {createMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-accent-bright" /></div>
      ) : comments.length === 0 ? (
        <p className="text-center py-8 text-xs text-subtle">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="p-5 rounded-2xl bg-surface border border-border space-y-3">
              <div className="flex items-center gap-3">
                <Link href={`/u/${c.author.username}`} className="shrink-0">
                  {c.author.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={c.author.avatarUrl} alt={c.author.displayName || c.author.username}
                      className="h-8 w-8 rounded-xl object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-black">
                      {(c.author.displayName || c.author.username)[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>
                <div>
                  <Link href={`/u/${c.author.username}`}
                    className="text-xs font-black text-foreground hover:text-white transition-colors flex items-center gap-1">
                    {c.author.displayName || c.author.username}
                    {c.author.verifiedKind && <VerifiedBadge kind={c.author.verifiedKind} size={12} />}
                  </Link>
                  <p className="text-[9px] text-subtle">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed">{c.content}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Page ── */
export function BlogReaderClient({ slug, initialBlog }: { slug: string; initialBlog?: Blog }) {
  const { push } = useToast()
  const { data: blogData, isLoading: blogLoading, isError: blogError } = useBlog(slug, initialBlog)

  // Resolve the metadata before any conditional returns. useBlog returns
  // undefined while loading; we fall back to the mock so the hooks below
  // never change order between loading → loaded.
  const apiBlog = blogData?.blog
  const meta = apiBlog ? {
    slug: apiBlog.slug,
    title: apiBlog.title,
    author: apiBlog.author?.displayName ?? apiBlog.author?.username ?? "Anonymous",
    authorAvatar: (apiBlog.author?.displayName ?? apiBlog.author?.username ?? "?")[0].toUpperCase(),
    publishedAt: apiBlog.publishedAt ? new Date(apiBlog.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "",
    readTime: Math.max(1, Math.ceil(apiBlog.body.split(" ").length / 200)),
    coverGradient: "from-indigo-900 via-violet-900 to-purple-900",
    tags: [] as string[],
    likes: apiBlog.likeCount ?? 0,
    views: apiBlog.viewCount ?? 0,
    content: apiBlog.body,
  } : (BLOG_META[slug] ?? { ...FALLBACK_META, slug, title: slug.replace(/-/g, " ") })

  // ALL hooks must run on every render — never gate them behind an early
  // return. Loading / error UI is rendered AFTER all hooks below.
  // Real, deduplicated, realtime view count (records this read once + ticks
  // live as others read). Only active once the real blog has resolved.
  const liveViews = useBlogViews(apiBlog ? slug : null, meta.views)
  // Real, persistent, realtime likes (seeded from likedByMe so a like survives
  // refresh; optimistic toggle; ticks live as others like).
  const { count: likeCount, liked, toggle: toggleLikeApi } = useBlogLikes(
    apiBlog ? slug : null, meta.likes, apiBlog?.likedByMe ?? false,
  )
  const [bookmarked, setBookmarked] = useState(false)
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({})

  // Now safe to short-circuit — these returns come AFTER every useState.
  if (blogLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" aria-label="Loading article" />
    </div>
  )

  if (blogError && !apiBlog && !BLOG_META[slug]) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-sm text-center space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400">Article unavailable</p>
        <h1 className="text-2xl font-black tracking-tighter text-foreground">We couldn&apos;t load this story.</h1>
        <p className="text-sm text-muted">The blog may have been removed, or the API is offline. Try again from the listing.</p>
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-accent-bright hover:text-white transition-colors">
          <ChevronLeft size={12} /> Back to The Chronicle
        </Link>
      </div>
    </div>
  )

  const toggleLike = () => {
    if (!useAuthStore.getState().isAuthenticated) { push("Sign in to like this article", "info"); return }
    toggleLikeApi()
  }

  const toggleCommentLike = (id: number) => {
    setCommentLikes(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      push("Link copied to clipboard!", "success")
    } catch {
      push("Could not copy link", "error")
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">

      {/* Hero banner */}
      <div className={`relative h-[45vh] min-h-[320px] w-full bg-gradient-to-br ${meta.coverGradient} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-bg)] via-[var(--app-bg)]/40 to-transparent" />

        {/* Back */}
        <Link
          href="/blog"
          className="absolute top-3 left-3 sm:top-4 sm:left-4 inline-flex min-h-11 items-center gap-1.5 px-3 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-muted hover:text-foreground active:scale-95 transition-all"
        >
          <ChevronLeft size={13} /> The Chronicle
        </Link>

        {/* Category */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-border text-[10px] font-black uppercase tracking-widest text-accent-bright">
            {(meta as Record<string, unknown>).category as string ?? "Article"}
          </span>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-7 sm:bottom-8 left-4 right-4 sm:left-6 sm:right-6 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[1.6rem] sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-foreground leading-[1.05] md:leading-none"
          >
            {meta.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-muted text-sm max-w-2xl"
          >
            {(meta as Record<string, unknown>).excerpt as string ?? ""}
          </motion.p>
        </div>
      </div>

      {/* Content area — TOC rail + article + secondary rail (research-backed) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[210px_minmax(0,1fr)_300px]">

          {/* Left rail — Table of Contents (xl+) */}
          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <ArticleTOC />
            </div>
          </aside>

          {/* Article — cap line length for comfortable reading below lg (the grid
              template handles width at lg+); centered so tablet isn't over-wide. */}
          <div className="min-w-0 space-y-8 w-full max-w-[68ch] mx-auto lg:max-w-none lg:mx-0">

            {/* Breadcrumbs — aids crawl + orientation */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-subtle">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <span className="text-border">/</span>
              <Link href="/blog" className="hover:text-foreground">The Chronicle</Link>
              <span className="text-border">/</span>
              <span className="max-w-[40ch] truncate text-muted">{meta.title}</span>
            </nav>


        {/* Author bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-4 flex-wrap"
        >
          <Link
            href={apiBlog?.author?.username ? `/u/${apiBlog.author.username}` : "#"}
            className="flex items-center gap-3 group"
          >
            {apiBlog?.author?.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={apiBlog.author.avatarUrl} alt={meta.author} className="h-10 w-10 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-sm shrink-0">
                {meta.authorAvatar}
              </div>
            )}
            <div>
              <p className="text-sm font-black text-foreground flex items-center gap-1.5 group-hover:text-white transition-colors">
                {meta.author}
                {apiBlog?.author?.verifiedKind && <VerifiedBadge kind={apiBlog.author.verifiedKind} size={14} />}
              </p>
              <p className="text-[10px] text-subtle">{meta.publishedAt}</p>
            </div>
          </Link>

          {/* Read time + views — highlighted chips */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent-bright ml-2">
            <Clock size={11} />
            <span>{meta.readTime} min read</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-[10px] font-bold text-foreground">
            <Eye size={11} className="text-accent-bright" />
            <span className="tabular-nums">{liveViews.toLocaleString()}</span>
            <span className="text-subtle">views</span>
          </div>

          {/* Share */}
          <button
            onClick={share}
            className="ml-auto inline-flex min-h-11 items-center gap-2 px-4 rounded-xl border border-border bg-white/[0.04] text-[10px] font-black uppercase tracking-widest text-muted hover:text-foreground hover:bg-surface active:scale-95 transition-all"
          >
            <Share2 size={12} /> Share
          </button>
        </motion.div>

        {/* Article body */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ArticleBody apiContent={(meta as { content?: string }).content} />
        </motion.div>

        {/* Like / Share / Bookmark bar */}
        <div className="flex items-center gap-3 sm:gap-4 py-5 border-t border-b border-border">
          <span
            className={`inline-flex min-h-11 items-center gap-2 px-4 sm:px-5 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-white/[0.04] border border-border ${
              liked ? "text-rose-400" : "text-muted hover:text-rose-400 hover:border-rose-500/20"
            }`}
          >
            <HeartLike liked={liked} onToggle={toggleLike} size={16} />
            {likeCount.toLocaleString()}
          </span>

          <button
            onClick={share}
            className="inline-flex min-h-11 items-center gap-2 px-4 sm:px-5 rounded-xl bg-white/[0.04] border border-border text-xs font-black uppercase tracking-widest text-muted hover:text-foreground hover:bg-surface active:scale-95 transition-all"
          >
            <Share2 size={14} /> Share
          </button>

          <button
            onClick={() => { setBookmarked(b => !b); push(bookmarked ? "Removed bookmark" : "Bookmarked!", "success") }}
            className={`ml-auto inline-flex min-h-11 items-center gap-2 px-4 sm:px-5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 border bg-white/[0.04] border-border ${
              bookmarked ? "text-accent-bright" : "text-muted hover:text-white"
            }`}
          >
            <Bookmark size={14} fill={bookmarked ? "currentColor" : "none"} />
            {bookmarked ? "Saved" : "Save"}
          </button>
        </div>

        {/* Trending + sign-up funnel — mobile/tablet only (sidebar covers ≥lg) */}
        <div className="lg:hidden">
          <ReaderFunnel excludeSlug={slug} />
        </div>

        {/* Comments — real API */}
        <BlogComments slug={slug} />
          </div>

          {/* Right rail — secondary modules only (right-rail blindness) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <ReaderSidebar excludeSlug={slug} />
            </div>
          </aside>
        </div>
      </div>

      {/* Primary conversion: sticky bottom sign-up bar (logged-out) */}
      <StickyJoinBar />
    </div>
  )
}
