"use client"

import { use, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  MessageSquare,
  Plus,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  Eye,
  Pin,
  Tag,
  ChevronLeft,
} from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useClubThreads, useCreateClubThread } from "@/hooks/useThreads"
import { useAuthStore } from "@/stores/auth.store"

/* ── Types ── */
type Thread = {
  id: string
  title: string
  author: string
  replyCount: number
  views: number
  lastActivity: string
  tags: string[]
  isPinned: boolean
  isTrending: boolean
  excerpt: string
}

/* ── Mock factory ── */
const CLUB_NAME_MAP: Record<string, string> = {
  "attack-on-titan-discussion": "Attack on Titan Discussion",
  "shonen-power-rankings": "Shonen Power Rankings",
  "hidden-gems-vault": "Hidden Gems Vault",
  "studio-mappa-fan-club": "Studio MAPPA Fan Club",
  "psychological-anime-society": "Psychological Anime Society",
  "slice-of-life-appreciation": "Slice of Life Appreciation",
}

function slugToName(slug: string): string {
  return (
    CLUB_NAME_MAP[slug] ??
    slug
      .split("-")
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join(" ")
  )
}

const PINNED_THREADS: Thread[] = [
  {
    id: "p1",
    title: "Club Rules & Introduction — Read Before Posting",
    author: "TitanSlayer_X",
    replyCount: 14,
    views: 2840,
    lastActivity: "1 week ago",
    tags: ["Rules", "Meta"],
    isPinned: true,
    isTrending: false,
    excerpt:
      "Welcome to the club. Before diving in, please read our community guidelines to ensure discussions stay constructive and spoiler-safe.",
  },
  {
    id: "p2",
    title: "Megathread: Weekly Discussion & Recommendations",
    author: "Otaku_Arch",
    replyCount: 312,
    views: 9100,
    lastActivity: "3h ago",
    tags: ["Megathread", "Weekly"],
    isPinned: true,
    isTrending: true,
    excerpt:
      "The central hub for weekly recommendations, watch updates, and casual discussion. Keep it friendly and on-topic.",
  },
]

function buildThreads(slug: string): Thread[] {
  const seed = slug.length % 5

  const pool: Thread[] = [
    {
      id: "t1",
      title: "Who had the best character arc across all seasons?",
      author: "Otaku_Arch",
      replyCount: 48,
      views: 1230,
      lastActivity: "2h ago",
      tags: ["Characters", "Discussion"],
      isPinned: false,
      isTrending: true,
      excerpt: "Breaking down the character evolution from start to finish — who surprised you the most?",
    },
    {
      id: "t2",
      title: "Unpopular opinion thread — let's hear your hot takes",
      author: "ShadowWatcher",
      replyCount: 93,
      views: 3400,
      lastActivity: "4h ago",
      tags: ["Hot Takes", "Opinion"],
      isPinned: false,
      isTrending: true,
      excerpt: "Drop your most controversial takes here. Upvote the ones you secretly agree with.",
    },
    {
      id: "t3",
      title: "Breaking down the symbolism in the final arc",
      author: "NeuralBot_X",
      replyCount: 31,
      views: 870,
      lastActivity: "1d ago",
      tags: ["Analysis", "Lore"],
      isPinned: false,
      isTrending: false,
      excerpt: "A deep textual analysis of the thematic layers embedded in the final arc.",
    },
    {
      id: "t4",
      title: "Animation quality comparison: early vs late seasons",
      author: "FrameRate_Fan",
      replyCount: 22,
      views: 640,
      lastActivity: "2d ago",
      tags: ["Animation", "Quality"],
      isPinned: false,
      isTrending: false,
      excerpt: "Side-by-side frames comparing the production quality evolution across the series run.",
    },
    {
      id: "t5",
      title: "Manga readers — how did you react to the ending?",
      author: "VoidSeeker",
      replyCount: 67,
      views: 2100,
      lastActivity: "3d ago",
      tags: ["Manga", "Spoilers"],
      isPinned: false,
      isTrending: false,
      excerpt: "SPOILER THREAD. Manga-only discussion on the divisive conclusion and what it means.",
    },
    {
      id: "t6",
      title: "Best OST moments? Compile your favourites",
      author: "Cipher_Ronin",
      replyCount: 15,
      views: 420,
      lastActivity: "5d ago",
      tags: ["OST", "Music"],
      isPinned: false,
      isTrending: false,
      excerpt: "Share your most emotionally powerful OST moments. Timestamps appreciated.",
    },
    {
      id: "t7",
      title: "Power scaling deep dive — ranked with receipts",
      author: "LoreKeeper_99",
      replyCount: 104,
      views: 4500,
      lastActivity: "6h ago",
      tags: ["Power Scaling", "Analysis"],
      isPinned: false,
      isTrending: true,
      excerpt: "Comprehensive tier list based on canon feats only. No statements, no outliers.",
    },
    {
      id: "t8",
      title: "Hidden lore most people miss on first watch",
      author: "MangaPhilosopher",
      replyCount: 56,
      views: 1800,
      lastActivity: "4d ago",
      tags: ["Lore", "Easter Eggs"],
      isPinned: false,
      isTrending: false,
      excerpt: "Background details, foreshadowing clues, and Easter eggs buried in plain sight.",
    },
  ]

  // Shuffle slightly by seed for variety per slug
  return [...pool.slice(seed), ...pool.slice(0, seed)]
}

/* ── ThreadRow ── */
function ThreadRow({ thread, index }: { thread: Thread; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04 }}
    >
      <Link
        href={`/threads/${thread.id}`}
        className="group flex gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-indigo-500/25 hover:bg-white/[0.04] transition-all duration-300"
      >
        {/* Left: content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            {thread.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[8px] font-black uppercase tracking-wider text-violet-400">
                <Pin size={7} /> Pinned
              </span>
            )}
            {thread.isTrending && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[8px] font-black uppercase tracking-wider text-amber-400">
                <TrendingUp size={7} /> Hot
              </span>
            )}
            {thread.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-wider text-white/35"
              >
                <Tag size={6} /> {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-white/85 group-hover:text-white transition-colors leading-snug line-clamp-2">
            {thread.title}
          </h3>

          {/* Excerpt */}
          <p className="text-[10px] text-white/30 leading-relaxed line-clamp-1 hidden sm:block">
            {thread.excerpt}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-[9px] text-white/25">
            <span>by <span className="text-white/45 font-bold">{thread.author}</span></span>
            <span className="flex items-center gap-1">
              <MessageSquare size={8} /> {thread.replyCount} replies
            </span>
            <span className="flex items-center gap-1">
              <Eye size={8} /> {thread.views.toLocaleString()} views
            </span>
            <span className="flex items-center gap-1">
              <Clock size={8} /> {thread.lastActivity}
            </span>
          </div>
        </div>

        {/* Right: arrow */}
        <div className="flex items-center shrink-0">
          <ChevronRight
            size={14}
            className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all"
          />
        </div>
      </Link>
    </motion.div>
  )
}

/* ── Pagination stub ── */
function Pagination({
  page,
  total,
  onChange,
}: {
  page: number
  total: number
  onChange: (p: number) => void
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/8 text-white/40 hover:text-white hover:border-white/20 disabled:opacity-30 transition-all"
      >
        <ChevronLeft size={14} />
      </button>

      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`h-9 w-9 flex items-center justify-center rounded-xl text-[11px] font-black transition-all ${
            page === p
              ? "bg-indigo-600 text-white shadow-[0_0_16px_rgba(99,102,241,0.3)]"
              : "bg-white/[0.03] border border-white/8 text-white/40 hover:text-white hover:border-white/20"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(Math.min(total, page + 1))}
        disabled={page === total}
        className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/8 text-white/40 hover:text-white hover:border-white/20 disabled:opacity-30 transition-all"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

/* ── Page ── */
export default function ClubThreadsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const { push } = useToast()
  const authUser = useAuthStore(s => s.user)
  const clubName = slugToName(slug)
  const createThread = useCreateClubThread(slug)

  const [page, setPage] = useState(1)
  const [composerOpen, setComposerOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")

  const { data: threadsData } = useClubThreads(slug, page)
  const apiThreads = (threadsData?.data ?? []).map((t): Thread => ({
    id: t.id, title: t.title,
    excerpt: t.content.slice(0, 100) + (t.content.length > 100 ? "…" : ""),
    author: t.author?.displayName ?? t.author?.username ?? "Anonymous",
    replyCount: t._count?.replies ?? 0, views: 0,
    lastActivity: (() => { const d = Date.now() - new Date(t.createdAt).getTime(); return d < 3600000 ? `${Math.floor(d/60000)}m ago` : d < 86400000 ? `${Math.floor(d/3600000)}h ago` : `${Math.floor(d/86400000)}d ago` })(),
    isPinned: t.isPinned,
    isTrending: false,
    tags: [],
  }))
  const threads = apiThreads.length > 0 ? apiThreads : buildThreads(slug)
  const totalPages = threadsData?.meta ? Math.ceil(threadsData.meta.total / 20) : 3

  const handleNewThread = () => {
    if (!authUser) { push("Sign in to create threads", "info"); return }
    setComposerOpen(c => !c)
  }

  const submitThread = () => {
    if (!newTitle.trim() || !newContent.trim()) { push("Title and content required", "info"); return }
    createThread.mutate(
      { title: newTitle.trim(), content: newContent.trim() },
      {
        onSuccess: () => { setComposerOpen(false); setNewTitle(""); setNewContent(""); push("Thread created! 🎌", "success") },
        onError: () => push("Failed to create thread", "error"),
      }
    )
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-25%] left-[-10%] w-[45%] h-[55%] bg-violet-700/8 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-5%] w-[35%] h-[50%] bg-indigo-700/8 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 mb-8"
        >
          <Link href="/clubs" className="hover:text-white/60 transition-colors flex items-center gap-1">
            <ArrowLeft size={10} /> Clubs
          </Link>
          <ChevronRight size={10} className="text-white/15" />
          <Link
            href={`/clubs/${slug}`}
            className="hover:text-white/60 transition-colors truncate max-w-[120px]"
          >
            {clubName}
          </Link>
          <ChevronRight size={10} className="text-white/15" />
          <span className="text-indigo-400">Threads</span>
        </motion.nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10"
        >
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-400/70">
              Community
            </p>
            <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter text-white leading-none">
              Threads<span style={{color:"#f59e0b"}}>.</span>
            </h1>
            <p className="text-white/35 text-xs">
              {threads.length + PINNED_THREADS.length} threads in {clubName}
            </p>
          </div>

          <button
            onClick={handleNewThread}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-sm font-black uppercase tracking-widest text-white transition-all shadow-[0_0_32px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 whitespace-nowrap self-start sm:self-auto"
          >
            <Plus size={14} /> New Thread
          </button>
        </motion.div>

        {/* ── Thread composer ── */}
        {composerOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6">
            <div className="bg-zinc-900/80 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Thread title…"
                className="w-full bg-transparent border-b border-white/10 text-sm font-bold text-white placeholder:text-white/25 outline-none py-2" />
              <textarea value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} placeholder="Share your thoughts…"
                className="w-full bg-transparent text-sm text-white/70 placeholder:text-white/25 resize-none outline-none" />
              <div className="flex items-center justify-end gap-3 pt-1 border-t border-white/5">
                <button onClick={() => setComposerOpen(false)} className="text-xs text-white/40 hover:text-white transition-colors">Cancel</button>
                <button onClick={submitThread} disabled={createThread.isPending}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-xs font-black uppercase tracking-widest text-white transition-all">
                  Post Thread
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Pinned threads ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-violet-400/70 mb-4 flex items-center gap-2">
            <Pin size={9} /> Pinned
          </p>
          <div className="space-y-3">
            {PINNED_THREADS.map((thread, i) => (
              <ThreadRow key={thread.id} thread={thread} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[9px] font-black uppercase tracking-[0.35em] text-white/20">
            All Threads
          </span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {/* ── Regular threads ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {threads.map((thread, i) => (
              <ThreadRow key={thread.id} thread={thread} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        <Pagination page={page} total={totalPages} onChange={setPage} />
      </div>
    </div>
  )
}
