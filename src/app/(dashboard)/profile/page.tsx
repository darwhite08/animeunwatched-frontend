"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  Edit3,
  Camera,
  Trophy,
  Bookmark,
  Flame,
  Settings,
  Clock,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  Award,
  Star,
  Share2,
  Heart,
  ThumbsUp,
  Eye,
  BookOpen,
  CalendarDays,
  MessageSquare,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import ShareCard from "@/components/ui/ShareCard"
import { useAuthStore } from "@/stores/auth.store"
import { useUserList } from "@/hooks/useLists"

const MOCK_REVIEWS = [
  {
    id: 1,
    animeTitle: "Fullmetal Alchemist: Brotherhood",
    animeImage:
      "https://images.unsplash.com/photo-1518893063132-36e46dbe2428?q=80&w=400&auto=format&fit=crop",
    score: 10,
    excerpt:
      "An absolute masterpiece in every sense of the word. The storytelling is tight, the characters are deeply human, and the emotional payoff is earned through 64 episodes of relentless craft. Brotherhood set the gold standard for shonen anime.",
    date: "Jan 12, 2024",
    helpful: 248,
  },
  {
    id: 2,
    animeTitle: "Steins;Gate",
    animeImage:
      "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=400&auto=format&fit=crop",
    score: 9,
    excerpt:
      "The first half feels slow, but that's the point — it makes the second half gut-wrenching. Okabe Rintaro is one of anime's greatest protagonists. Once the timer kicks in, the show becomes unputdownable.",
    date: "Mar 5, 2024",
    helpful: 176,
  },
  {
    id: 3,
    animeTitle: "Vinland Saga",
    animeImage:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80https://images.unsplash.com/photo-1476611338391-6f395a0dd82e?q=80&w=400&auto=format&fit=cropw=400https://images.unsplash.com/photo-1476611338391-6f395a0dd82e?q=80&w=400&auto=format&fit=cropauto=formathttps://images.unsplash.com/photo-1476611338391-6f395a0dd82e?q=80&w=400&auto=format&fit=cropfit=crop",
    score: 9,
    excerpt:
      "Season 2 is where this show transcends the genre. Thorfinn's transformation from revenge-fueled warrior to a man pursuing genuine peace is one of the most compelling character arcs I've witnessed in anime.",
    date: "May 20, 2024",
    helpful: 132,
  },
  {
    id: 4,
    animeTitle: "Frieren: Beyond Journey's End",
    animeImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop",
    score: 10,
    excerpt:
      "Frieren understands grief and time better than almost any other piece of fiction. It's a quiet, devastating meditation on what it means to outlive everyone you love. The magic exam arc is deceptively brilliant.",
    date: "Aug 8, 2024",
    helpful: 309,
  },
]

const MOCK_BLOGS = [
  {
    id: 1,
    title: "Why Gege Akutami's Writing Is More Intentional Than You Think",
    category: "Analysis",
    excerpt:
      "Most people misread Jujutsu Kaisen as shock-value writing. A deeper look at foreshadowing, theme repetition, and character parallels reveals an author in full control of his narrative.",
    date: "Apr 14, 2024",
    readTime: "7 min",
    views: 3_840,
  },
  {
    id: 2,
    title: "The Invisible Hand: How MAPPA Redefined Production Value",
    category: "Industry",
    excerpt:
      "From Chainsaw Man to Attack on Titan's finale, MAPPA made bold aesthetic choices that split the fanbase. This piece argues those decisions were never about cutting corners — they were about vision.",
    date: "Feb 27, 2024",
    readTime: "5 min",
    views: 2_210,
  },
  {
    id: 3,
    title: "Anime Endings That Earned Every Tear",
    category: "Picks",
    excerpt:
      "Clannad, Your Lie in April, Anohana — what separates an ending that devastates from one that merely surprises? I break down the craft behind the most emotionally resonant finales in the medium.",
    date: "Jan 3, 2024",
    readTime: "6 min",
    views: 5_120,
  },
]

const ACTIVITY_EVENTS = [
  { title: "Universal Sync", sub: "One Piece Archive Updated", time: "2h", icon: Zap },
  { title: "Master Rating", sub: "Attack on Titan • 10/10 Verified", time: "1d", icon: Star },
  { title: "Deep Reading", sub: "Berserk Vol. 41 Added", time: "3d", icon: Bookmark },
]

const TABS = ["Activity", "Watchlist", "Reviews", "Blogs"] as const
type Tab = (typeof TABS)[number]

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function DNABar({ label, percent, colors }: { label: string; percent: number; colors: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <span className="text-sm font-black uppercase tracking-widest text-white/80">{label}</span>
        <span className="text-xs font-medium text-white/30 tracking-tighter">{percent}% saturation</span>
      </div>
      <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full bg-gradient-to-r ${colors} rounded-full relative shadow-[0_0_15px_rgba(99,102,241,0.2)]`}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay" />
        </motion.div>
      </div>
    </div>
  )
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <Star
          key={i}
          size={10}
          className={i < score ? "text-amber-400" : "text-white/15"}
          fill={i < score ? "#f59e0b" : "none"}
        />
      ))}
      <span className="ml-1.5 text-[10px] font-black text-white/50">{score}/10</span>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Tab content panels
───────────────────────────────────────────── */
const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

function ActivityTab() {
  return (
    <div className="relative space-y-4">
      <div className="absolute left-[31px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-indigo-500/50 via-white/5 to-transparent" />
      {ACTIVITY_EVENTS.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="relative pl-20 group cursor-pointer"
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center z-10 group-hover:border-amber-500/50 transition-all shadow-xl">
            <item.icon size={22} className="text-amber-400" />
          </div>
          <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-all flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-white/90">{item.title}</h3>
              <p className="text-sm text-white/40 font-medium mt-1">{item.sub}</p>
            </div>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{item.time} ago</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function WatchlistTab() {
  const authUser = useAuthStore(s => s.user)
  const { data: listData, isLoading } = useUserList(authUser?.username ?? "")
  const watchlistAnime = (listData?.data ?? []).slice(0, 8).map(e => ({
    id: String(e.anime?.malId ?? e.animeId),
    title: e.anime?.title ?? "Unknown",
    image: e.anime?.imageUrl ?? "",
    rating: e.anime?.score ?? 0,
    status: e.status,
  }))
  if (isLoading) return <div className="text-white/30 text-sm py-10 text-center">Loading…</div>
  if (!authUser) return <div className="text-white/30 text-sm py-10 text-center">Sign in to see your watchlist</div>
  if (watchlistAnime.length === 0) return (
    <div className="py-16 text-center flex flex-col items-center gap-4">
      <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center">
        <span className="text-2xl">📺</span>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-black uppercase tracking-widest text-white/30">No anime tracked yet</p>
        <p className="text-xs text-white/20">Add anime to your watchlist to start building your profile.</p>
      </div>
      <a href="/bestanimelist" className="text-xs font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors">Browse Anime →</a>
    </div>
  )
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {watchlistAnime.map((anime, i) => {
        const isWatching = anime.status === "WATCHING"
        return (
          <motion.div
            key={anime.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group relative rounded-2xl overflow-hidden border border-white/8 hover:border-amber-500/30 bg-[#0a0a0a] transition-all duration-400"
          >
            {/* Cover */}
            <div className="relative aspect-[2/3] w-full">
              <Image
                src={anime.image}
                alt={anime.title}
                fill
                className="object-cover brightness-75 group-hover:brightness-90 transition-all duration-500"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* Status badge overlay */}
              <div className="absolute top-2 left-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                    isWatching
                      ? "bg-emerald-500/25 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/25 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {isWatching ? "● Watching" : "✓ Completed"}
                </span>
              </div>
              {/* Rating badge */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md">
                <Star size={9} fill="#f59e0b" className="text-amber-400" />
                <span className="text-[9px] font-black text-white">{anime.rating.toFixed(1)}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            {/* Title */}
            <div className="p-3">
              <p className="text-[10px] font-black text-white uppercase italic tracking-tighter line-clamp-2 leading-tight">
                {anime.title}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function ReviewsTab() {
  const [likedReviews, setLikedReviews] = useState<Set<number>>(new Set())

  const toggleLike = (id: number) => {
    setLikedReviews((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {MOCK_REVIEWS.map((review, i) => {
        const liked = likedReviews.has(review.id)
        return (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="group flex gap-5 p-7 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all"
          >
            {/* Thumbnail */}
            <div className="relative w-16 h-24 shrink-0 rounded-xl overflow-hidden border border-white/10">
              <Image
                src={review.animeImage}
                alt={review.animeTitle}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3 min-w-0">
              <div>
                <h3 className="text-sm font-black text-white uppercase italic tracking-tight line-clamp-1">
                  {review.animeTitle}
                </h3>
                <StarRating score={review.score} />
              </div>

              <p className="text-sm text-white/55 leading-relaxed line-clamp-3">{review.excerpt}</p>

              <div className="flex items-center gap-4 pt-1">
                <span className="text-[9px] font-black text-white/25 uppercase tracking-widest flex items-center gap-1">
                  <CalendarDays size={10} />
                  {review.date}
                </span>
                <button
                  onClick={() => toggleLike(review.id)}
                  className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    liked ? "text-rose-400" : "text-white/25 hover:text-rose-400"
                  }`}
                >
                  <ThumbsUp size={11} fill={liked ? "currentColor" : "none"} />
                  {liked ? review.helpful + 1 : review.helpful} Helpful
                </button>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function BlogsTab() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {MOCK_BLOGS.map((blog, i) => (
        <motion.div
          key={blog.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="group flex flex-col rounded-[2rem] overflow-hidden border border-white/5 bg-[#0a0a0a] hover:border-amber-500/30 hover:bg-zinc-900/50 transition-all duration-400 cursor-pointer"
        >
          {/* Gradient banner */}
          <div className="h-32 bg-gradient-to-br from-indigo-600/30 via-purple-700/20 to-violet-900/30 relative">
            <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/bg-gradient-3.svg')] bg-cover" />
            <div className="absolute top-4 left-4">
              <span className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest text-amber-400">
                {blog.category}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 space-y-3 flex flex-col">
            <h3 className="text-sm font-black text-white uppercase italic tracking-tight leading-tight line-clamp-2 group-hover:text-amber-300 transition-colors">
              {blog.title}
            </h3>
            <p className="text-[11px] text-white/45 leading-relaxed line-clamp-3 flex-1">{blog.excerpt}</p>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-3 text-[9px] font-black text-white/25 uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <CalendarDays size={9} />
                  {blog.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={9} />
                  {blog.readTime}
                </span>
              </div>
              <span className="flex items-center gap-1 text-[9px] font-black text-white/25 uppercase tracking-widest">
                <Eye size={9} />
                {blog.views.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function WorldClassProfile() {
  const [shareOpen, setShareOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("Activity")
  const authUser = useAuthStore(s => s.user)

  const stats = [
    { label: "Archive",  value: String(authUser ? "..." : "0"),   icon: Bookmark,    color: "text-amber-400", sub: "Anime cataloged" },
    { label: "Momentum", value: "22",                              icon: Flame,        color: "text-orange-500", sub: "Day watch streak" },
    { label: "Standing", value: "812",                             icon: Globe,        color: "text-blue-400",   sub: "Global percentile" },
    { label: "Trust",    value: String(authUser?.reputation ?? 0), icon: ShieldCheck,  color: "text-emerald-400",sub: "Reputation score" },
  ]

  return (
    <div className="max-w-[1400px] mx-auto space-y-16 pb-32 px-6">

      {/* 1. MASTER HEADER: THE INFINITY CANVAS */}
      <section className="relative min-h-[450px] flex items-end overflow-hidden rounded-[3rem] border border-white/5 bg-[#050505] shadow-2xl">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[80%] bg-amber-600/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[70%] bg-purple-900/10 blur-[100px] rounded-full" />
          <div className="absolute inset-0 bg-[url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/bg-gradient-3.svg')] bg-cover opacity-20 mix-blend-overlay" />
        </div>

        <div className="relative z-10 w-full p-10 md:p-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-10 bg-gradient-to-t from-black via-black/40 to-transparent">

          <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
            {/* THE ARCHITECT AVATAR */}
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.02, rotate: -2 }}
                className="h-44 w-44 md:h-56 md:w-56 rounded-[2.5rem] p-1 bg-gradient-to-br from-indigo-500 via-white/20 to-purple-500 shadow-2xl"
              >
                <div className="relative h-full w-full rounded-[2.2rem] overflow-hidden bg-[#0a0a0a]">
                  <Image
                    src="/assets/png/tanjiro.png"
                    alt="Master Designer Profile"
                    fill
                    className="object-cover object-top brightness-90 group-hover:brightness-110 transition-all duration-700"
                  />
                </div>
              </motion.div>
              <button className="absolute -bottom-2 -right-2 p-4 bg-white text-black rounded-2xl shadow-2xl hover:scale-110 transition-transform active:scale-95">
                <Camera size={20} fill="black" />
              </button>
            </div>

            {/* IDENTITY STACK */}
            <div className="text-center md:text-left space-y-4">
              <div className="space-y-1">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-center md:justify-start gap-4">
                  <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white">
                    {authUser?.displayName ?? authUser?.username ?? "Shinobi"}
                  </h1>
                  <div className="p-[1px] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
                    <span className="px-4 py-1 rounded-full bg-black text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] block">
                      Elite Grade
                    </span>
                  </div>
                </motion.div>
                <p className="text-white/40 text-xl font-light tracking-wide italic">Level 20 • Visionary Curator</p>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-6 pt-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                      <Zap size={14} className="text-yellow-500" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-black bg-amber-500 flex items-center justify-center text-[10px] font-bold text-black">
                    +12
                  </div>
                </div>
                <span className="text-xs font-bold text-white/60 uppercase tracking-tighter">Rare Badges Earned</span>
              </div>
            </div>
          </div>

          {/* ACTION HUB */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-4">
              <button className="h-14 px-10 rounded-2xl text-black font-bold transition-all hover:-translate-y-1"
                style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 10px 40px rgba(245,158,11,0.35)" }}>
                Customize Hub
              </button>
              <button
                onClick={() => setShareOpen(true)}
                className="h-14 px-6 flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md text-white/70 hover:text-white text-sm font-bold"
              >
                <Share2 size={18} />
                Share Profile
              </button>
              <button className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md">
                <Settings size={20} className="text-white/60" />
              </button>
            </div>
            <Link
              href="/profile/wrapped"
              className="flex items-center justify-center gap-2 h-11 px-6 rounded-2xl bg-gradient-to-r from-violet-600/30 to-indigo-600/30 border border-violet-500/30 hover:border-violet-500/60 text-violet-300 hover:text-white text-sm font-black uppercase tracking-widest transition-all hover:-translate-y-0.5"
            >
              See My 2024 Wrapped
            </Link>
          </div>
        </div>
      </section>

      {/* 2. THE ANALYTICS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group relative overflow-hidden p-10 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] hover:bg-zinc-900/50 transition-all duration-500"
          >
            <div className={`mb-8 ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
              <stat.icon size={32} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black text-white tracking-tighter">
                {stat.value}
                <span className="text-lg text-white/20 ml-1 font-medium">{stat.label === "Trust" ? "%" : ""}</span>
              </p>
              <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
            <p className="mt-6 text-sm text-white/40 font-medium">{stat.sub}</p>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
          </motion.div>
        ))}
      </section>

      {/* 3. TAB SECTION */}
      <section className="space-y-10">
        {/* Tab nav */}
        <div className="relative flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/5 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-colors duration-200 ${
                activeTab === tab ? "text-white" : "text-white/35 hover:text-white/70"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", boxShadow: "0 4px 20px rgba(245,158,11,0.35)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 36 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>

        {/* Tab content with AnimatePresence */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeTab === "Activity" && <ActivityTab />}
              {activeTab === "Watchlist" && <WatchlistTab />}
              {activeTab === "Reviews" && <ReviewsTab />}
              {activeTab === "Blogs" && <BlogsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 4. EXPERIENCE JOURNEY & DNA */}
      <div className="grid lg:grid-cols-12 gap-12">
        {/* ANIME DNA (GENRES) */}
        <div className="lg:col-span-5 space-y-10">
          <h2 className="text-4xl font-black tracking-tighter">Anime DNA</h2>
          <div className="p-12 rounded-[3rem] border border-white/5 bg-gradient-to-br from-zinc-900/80 to-black backdrop-blur-3xl space-y-10 relative shadow-2xl">
            <div className="absolute top-8 right-12 opacity-10">
              <Award size={80} strokeWidth={1} />
            </div>

            <div className="space-y-8">
              <DNABar label="Shonen" percent={85} colors="from-indigo-600 via-blue-500 to-cyan-400" />
              <DNABar label="Psychological" percent={64} colors="from-purple-600 via-pink-500 to-rose-400" />
              <DNABar label="Seinen" percent={42} colors="from-emerald-600 via-teal-500 to-green-400" />
              <DNABar label="Fantasy" percent={30} colors="from-orange-600 via-yellow-500 to-amber-400" />
            </div>

            <div className="pt-10 border-t border-white/5 flex flex-col gap-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Runtime Exposure</p>
                  <p className="text-3xl font-black text-white">
                    1,420<span className="text-sm font-medium text-white/40 ml-1 italic">hours</span>
                  </p>
                </div>
                <Clock size={40} className="text-amber-500 opacity-20" strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>

        {/* Empty right column spacer */}
        <div className="lg:col-span-7" />
      </div>

      <ShareCard
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title="My Anime Profile"
        subtitle={`${authUser?.username ?? "shinobi"} · Level ${Math.max(1, Math.floor(Math.sqrt((authUser?.reputation ?? 0) * 100 / 1000)))} Shinobi`}
        url={`https://kaiveron.app/u/${authUser?.username ?? "shinobi"}`}
        type="profile"
      />
    </div>
  )
}
